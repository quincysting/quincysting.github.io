# The Governed Lakehouse: Iceberg, Lake Formation and Redshift Serverless in Regulated Financial Services

I spend my days architecting analytics platforms for a tier-one Australian bank, and "lakehouse" is one of those words that has been flattened by marketing to the point of meaning nothing. So let me be specific about what I mean by it, what it costs, and what breaks.

A governed lakehouse, in the regulated financial-services context I work in, is the union of three things that historically lived apart: an open table format on object storage (Apache Iceberg on Amazon S3), a single authorization plane that every engine respects (AWS Lake Formation), and a serverless query engine that reads and writes those tables under a propagated human identity (Amazon Redshift Serverless with Spectrum). Sitting on top, business users consume the result through Amazon QuickSight / Quick Suite with single sign-on, and underneath it all an APRA prudential standard quietly dictates which of these choices are actually available to me.

This post is the architecture I've converged on, and — more usefully — the trade-offs I had to accept to get there.

## Open Table Format vs Warehouse-Native: When To Leave The Warehouse

The first real decision is whether data lives inside Redshift's managed storage (RMS) as warehouse-native tables, or out on S3 as Iceberg, queried through Spectrum. This is not a religious choice; it is a workload choice.

Warehouse-native still wins for the hot, latency-sensitive serving layer — the curated marts that feed dashboards where every millisecond of P95 matters. Redshift's local storage, result caching, and zone maps are hard to beat when the access pattern is known and the data is small enough to be worth the ingestion cost.

I reach for Iceberg-on-S3 when one or more of these is true:

- **Multiple engines need to write the same tables.** On the program I'm on, the same `orders` table is written by a Spark `MERGE INTO` job on EMR, occasionally by Athena DML, and read by Redshift. Iceberg v2 gives me ACID commits across all of them through an atomic catalog-pointer swap. Read-only Parquet cannot do this.
- **Schema evolution without rewriting petabytes.** Adding a column to a partitioned Parquet lake means a re-crawl and often a rewrite. Iceberg tracks schema in metadata.
- **Time travel for audit.** `AS OF TIMESTAMP` is not a nice-to-have when a regulator asks what a table looked like on a specific date.

The honest cost: Iceberg is not free storage with superpowers. It carries an operational tax — compaction, snapshot expiry, orphan-file cleanup — that I'll come back to. If your access pattern is read-only Parquet and you don't need cross-engine writes, staying warehouse-native (or read-only Spectrum) avoids a real maintenance burden. Default to v2 across the estate; v3 is still rolling out across AWS engines and mixing v2/v3 readers and writers is a debugging session nobody enjoys.

The Spectrum-side declaration is unremarkable, which is the point — Iceberg is just another external table:

```sql
CREATE EXTERNAL SCHEMA finance_lake
FROM DATA CATALOG
DATABASE 'finance_lake'
IAM_ROLE 'arn:aws:iam::123456789012:role/redshift-spectrum-role';

-- An Iceberg table created by Athena/Spark is now queryable with no extra DDL
SELECT region, SUM(amount)
FROM finance_lake.orders
WHERE order_date >= '2026-01-01'
GROUP BY 1;
```

## Lake Formation As The One Authorization Plane

The single most important architectural commitment I make on these programs is this: **Lake Formation is the catalog authority before any data lands.** Get the sequencing wrong — migrate to Iceberg first, retrofit governance later — and you buy yourself a second migration.

The reason is mundane and decisive. Iceberg over raw IAM bucket policies is a swamp: the writer needs metadata-folder access, the reader needs data-folder access, snapshot expiry needs delete on the manifests but not the data, and you end up with a 200-line bucket policy that drifts the first time someone is in a hurry. Lake Formation sees an Iceberg table as an ordinary Glue table and applies the same verbs it applies to Parquet — `DESCRIBE`, `SELECT`, `INSERT`, `DELETE`, `DATA_LOCATION_ACCESS` — plus column and row filters, with identical semantics.

```bash
aws lakeformation grant-permissions \
  --principal '{"DataLakePrincipalIdentifier":"arn:aws:iam::123456789012:role/redshift-spectrum-role"}' \
  --resource '{"Table":{"DatabaseName":"finance_lake","Name":"orders"}}' \
  --permissions SELECT INSERT DELETE
```

### Tag-Based Access Control Is The Only Thing That Scales

Named-resource grants are O(N×M) — N principals times M tables. At five thousand tables and fifty access roles, that is a quarter of a million grants nobody can reason about. Lake Formation tag-based access control (LF-TBAC) collapses this to O(N+M): you annotate resources with a small set of tags and grant principals against tag *expressions*.

I keep the tag vocabulary deliberately small and closed-valued — typically `classification ∈ {public, internal, restricted, sensitive}`, `data-domain ∈ {finance, sales, ops}`, plus `regulation` and `retention`. Tags cascade catalog → database → table → column, and a child-level tag overrides the inherited one. That is genuine ABAC over the catalog tree:

> principal `pii-readers` may `SELECT` on resources where `classification = sensitive` AND `data-domain = finance`

The discipline that matters: **start with tags even when you have fifty tables.** Teams that begin with named grants and grow to five hundred hit a wall and have to migrate the whole grant model under audit pressure. I have watched it happen. Start tagged.

## Trusted Identity Propagation: The Human Survives The Hop

Coarse role-based access — one IAM role on the namespace, everyone sees the same data — is fine for a small analytics team. It is not fine when a regulator asks "which human read which row, on which day, decrypted with which key." Answering that requires the human identity to survive every hop from the BI tool down to the storage layer. That is Trusted Identity Propagation (TIP).

The chain I run looks like this: **Microsoft Entra ID** is the corporate IdP. **IAM Identity Center** federates Entra as its external identity source, so the workforce identity that exists in Entra becomes the identity AWS services reason about. Redshift is registered as an IDC application; QuickSight authenticates through the same IDC instance. When a user runs a query, their IDC identity propagates through Redshift, into Lake Formation, which evaluates *that user's* tag grants and vends scoped credentials — covering both the `data/` and `metadata/` Iceberg prefixes — rather than a shared role.

The payoff is in the audit trail. CloudTrail's `lakeformation:GetTemporaryCredentials` event carries the IDC user in `userIdentity.onBehalfOf`, with the identity-store ARN. That is the line in the log that satisfies the "which human" question.

When TIP silently regresses to role-based authorization — and it will, the first time someone touches the config — this is my checklist, in order:

1. IDC application bound to the **namespace** (on Serverless there is no cluster identifier — the binding target is the namespace, and this trips up scripts ported from Provisioned).
2. `RedshiftConnect: ENABLED` on the Lake Formation IDC configuration in the data-owning account.
3. Trusted token issuer ARN matches between the Redshift IDC application and the BI tool's connection string.
4. The user actually signed in via IDC, not a database-user password.

If `GetTemporaryCredentials` shows the namespace's IAM role instead of an IDC user, one of those four is wrong.

## Redshift Serverless + Spectrum Against Iceberg

I default to Serverless for analytics workloads that are bursty, that are dev/staging, or that are lakehouse-first — which describes most of what I build now. The RPU model and the namespace/workgroup split fit the workload better than sizing a fixed RA3 cluster.

But Serverless is not Provisioned-minus-management. It is structurally different at exactly the layer I care about — identity — and there are two gaps I now check before committing:

- **Enhanced VPC routing is incompatible with IDC SSO on Serverless.** If your security architecture mandates enhanced VPC routing so all S3 traffic stays on the backbone and lands in VPC flow logs, *and* your data architecture mandates IDC SSO for per-user audit, the two cannot coexist on a Serverless namespace. On a program with strict network-egress controls this single line has forced a Provisioned RA3 decision. You either move to Provisioned or accept that Spectrum S3 traffic routes through the AWS-managed fleet outside your VPC, and your audit leans on CloudTrail S3 data events rather than flow logs.
- **IDC binding does not survive a snapshot restore from RA3 → Serverless.** The Serverless restore API has no IDC-application parameter. After migration you must re-register the IDC app against the namespace, or TIP silently falls back to the namespace role. This is the number-one cause of "it worked yesterday and broke after the migration."

One more hard constraint worth stating plainly: a Serverless namespace maps to exactly one workgroup. Architectures that assume one namespace serving dev and prod through two workgroups are not buildable. Use two namespaces.

## QuickSight / Quick Suite Consumption With SSO

The consumption layer is where governance either pays off or quietly leaks. The mistake I see most is a BI tool connecting through a single service account — at which point every careful Lake Formation grant collapses to "whatever that one account can see," and the per-user audit trail evaporates.

The arrangement that preserves the chain: QuickSight authenticates through the same IAM Identity Center instance that fronts Entra ID, and the dataset reaches Redshift over a connection that propagates the viewer's identity. The viewer's Entra identity is the identity Lake Formation evaluates. Row-level and column-level security are enforced *once*, at the Lake Formation plane, rather than re-implemented in QuickSight's own RLS rules and drifting out of sync. The fewer places a sensitivity rule is expressed, the fewer places it can be wrong.

There is a real cost here: trusted identity propagation through the whole BI path is more moving parts than a service account, and the failure modes are subtle. But re-implementing fine-grained security in the BI layer is how regulated organisations end up with two conflicting answers to "can this analyst see PII," and that is a worse problem to have during an audit.

## Multi-Region Data Sovereignty and APRA CPS 230 / 234

Two APRA prudential standards shape the physical architecture more than any technical preference of mine.

**CPS 234 (Information Security)** drives the encryption and access posture. Every S3 prefix and every Redshift namespace is encrypted with customer-managed KMS keys, and — this is the part people forget — KMS grants do **not** propagate across account boundaries the way Lake Formation grants do. When data is shared cross-account via RAM, the consumer's access to the CMK is a separate, explicit grant. Miss it and the share looks configured but every query fails to decrypt. The "which key" half of the audit question is answered by CloudTrail on KMS, correlated with the Lake Formation identity events.

**CPS 230 (Operational Risk Management)** drives data residency and resilience. For an Australian bank, customer data sovereignty means the lake and its governance plane live in `ap-southeast-2`, and a multi-region DR posture has to be a deliberate design, not an assumption. This is where I temper expectations:

- **Cross-region datashare** of data-lake tables works — a consumer in one region can query a producer's catalog in another — but the consumer pays cross-region S3 transfer and their own compute.
- **S3 Tables (AWS-managed Iceberg) cross-region replication is still maturing** as of mid-2026. It is genuinely appealing for greenfield workloads because AWS owns compaction, snapshot expiry and orphan-file cleanup. But I do not bet a multi-region DR strategy on a feature still finding its feet. For workloads where DR across regions is a CPS 230 control, self-managed Glue + Iceberg with operator-built S3 replication and catalog sync remains the defensible choice, because I can reason about exactly what replicates and when.

Residency also has a quiet identity dimension: the IAM Identity Center instance and its Entra federation must be reasoned about as part of the sovereignty boundary, not treated as a global free variable.

## The Trade-Offs, Stated Plainly

No architecture is free, and the governed lakehouse is one of the more expensive ones to operate well. The honest ledger:

- **Operational overhead.** Iceberg maintenance is the operator's problem on self-managed Glue catalogs: nightly compaction, weekly snapshot expiry, weekly orphan-file removal. Forget these and S3 cost runs away — it is the single most common cause of an Iceberg lake's bill quietly tripling. S3 Tables removes this work in exchange for less control over compaction strategy and some still-maturing features.
- **Governance overhead.** LF-TBAC, the Macie-to-LF-Tag automation loop for discovering sensitive columns, the IDC plumbing — this is real configuration that needs versioning, testing, and an owner. A half-built governance plane (Macie generating findings nobody enforces) is worse than none, because it creates auditable evidence that you knew about the sensitive data and did nothing.
- **Latency.** Spectrum-over-Iceberg is not local-storage-fast. For sub-second serving I still materialise into warehouse-native tables. The lakehouse is the open, governed, multi-writer substrate; it is not always the fastest read path.
- **Cost.** RPU-based Serverless billing is efficient for bursty work and unkind to steady high-volume querying, where a sized Provisioned cluster is cheaper. Add cross-region transfer, KMS, and Macie scan costs (a daily scan on a multi-TB lake is a real line item — I run weekly or event-triggered scans on new objects instead). Model the all-in number; do not assume serverless is cheaper.
- **Complexity.** Time-to-first-query on a full multi-account TIP-over-Iceberg deployment is one to two weeks, not an afternoon. Every dimension you add — per-user identity, writable lake, automated discovery — adds a failure mode. The skill prerequisites compound accordingly.

## Conclusion

The governed lakehouse is not a product you switch on; it is a set of independent decisions — table format, authorization plane, identity propagation, deployment model, region topology — that have to be sequenced correctly and that each carry an ongoing cost. What it buys, in a regulated financial-services setting, is a single defensible answer to the questions an APRA auditor actually asks: who read what, when, and under which key. That alignment between the architecture and the audit is the real reason to build it.

If you take one thing from this: establish Lake Formation as the authority first, start with tag-based access control even when it feels like overkill, and validate your identity and residency constraints against the deployment model *before* you commit to Serverless. The rest is tractable. Those three, retrofitted late, are not.
