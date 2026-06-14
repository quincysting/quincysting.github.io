# RAG That Survives Production: Retrieval, Governance, and Agents

A RAG demo over a folder of PDFs takes an afternoon. A RAG system that survives a regulated production environment — where a wrong answer is a compliance incident and the wrong person seeing a retrieved chunk is a data breach — is a different engineering problem. I've built and reviewed enough of these, most recently on a tier-one bank data-platform program, to be opinionated about where the effort actually goes.

The short version: retrieval quality gets you a working prototype, but governance and evaluation are what let you put it in front of regulated users. Most teams invert that priority and pay for it later.

## RAG Is a Framework, Not an Algorithm

RAG isn't a single technique. It's a way to give a frozen model access to knowledge it never saw in training, by fetching relevant documents at query time and injecting them into the context window before generation. That solves three structural problems with parametric memory: the knowledge cutoff, confident hallucination on domain specifics, and the cost of retraining every time facts change.

It's worth being clear about the trade-off against fine-tuning, because people still treat them as competing options. They're complementary. Fine-tuning shifts *style, format, and domain vocabulary*. RAG supplies *factual content* that changes faster than any retrain cycle. On a banking program, product terms and policy documents change weekly — you re-index in minutes, you don't retrain. If you need the model to reason in a particular house style, that's a fine-tuning conversation, not a retrieval one.

## Chunking and Embeddings: The Decisions You Live With

Chunking has an outsized effect on retrieval quality, and it's the cheapest thing to get wrong. Three strategies cover most cases:

- **Fixed-size** with token overlap — fine as a baseline for uniform prose.
- **Semantic** (split on sentence/paragraph boundaries) — better for mixed-length documents.
- **Structural** (split on headings, code blocks, table rows) — the one I reach for with technical docs and policy PDFs that have real structure.

Overlap matters more than people expect. Without it, a sentence that straddles a chunk boundary becomes unretrievable, and you'll never see it in your metrics — the chunk just silently never ranks. For long documents I lean on hierarchical (parent-child) chunking: retrieve small child chunks for precision, return the parent for coherence so the model gets enough surrounding context to answer well.

On embeddings: dedicated encoder models (sentence-transformers, BERT-family derivatives) consistently beat general-purpose decoder models at retrieval because they produce dense per-chunk vectors rather than completion tokens. Two things people skip and then debug for a day:

- **Normalize.** Cosine similarity assumes L2-normalized vectors. Skip it and recall quietly degrades.
- **Benchmark on your own query-document pairs** before committing. A domain-specific embedding model often wins on in-domain recall, but "often" isn't "always" — measure it on your corpus, not a public leaderboard.

## Vector Stores, Including on AWS

The vector store choice is mostly an operational decision, not a model-quality one. My default advice is to start boring:

| Category | Examples | When |
|---|---|---|
| Postgres extension | pgvector (Aurora, RDS) | SQL joins to metadata, ACID, ops you already know |
| Embedded/local | FAISS, Chroma, sqlite-vss | Prototyping, privacy, zero infra |
| Purpose-built | Qdrant, Weaviate, Pinecone | >10M vectors, sub-10ms p99, multi-tenancy |
| Search engines | OpenSearch (k-NN) | Native BM25, existing ops discipline |
| Managed | Bedrock Knowledge Bases | IAM-integrated, compliance, less indexing control |

Starting with pgvector lets you join vector results to structured metadata and run transactions without adding a new operational dependency on day one. The honest threshold for migrating off Postgres is roughly: north of ~10M vectors, hard sub-10ms p99 requirements, or multi-tenancy that outpaces what a single Postgres node serves comfortably.

On AWS specifically: pgvector on Aurora for SQL-integrated workloads, OpenSearch with the k-NN plugin for hybrid search at scale, and Bedrock Knowledge Bases when you want retrieval wired into IAM and don't need fine control over indexing. Underneath, almost all of these default to HNSW for the index — it gives the best recall/latency trade-off in practice. The knobs that matter are `M` (edges per node, higher recall at more memory), `efConstruction` (build-time depth), and `efSearch` (query-time depth). `efSearch` is your live latency-vs-recall dial.

## Hybrid Search and Reranking

Pure vector search fails on lexically precise queries — product codes, account types, version strings, proper nouns — because embeddings smooth over exact spelling. BM25 fails on semantic paraphrase because it needs term overlap. In regulated data you have both kinds of query constantly, so hybrid isn't an optimization, it's the baseline.

The pattern is straightforward: run both arms, normalize each score to [0,1], combine with a tunable weight, rerank the top-K.

```python
# dense + sparse score fusion, then rerank
dense_hits  = vector_store.search(query_vec, k=50)
sparse_hits = bm25.search(query_text, k=50)

fused = {}
for doc_id, score in normalize(dense_hits):
    fused[doc_id] = 0.6 * score
for doc_id, score in normalize(sparse_hits):
    fused[doc_id] = fused.get(doc_id, 0) + 0.4 * score

top_k = sorted(fused, key=fused.get, reverse=True)[:10]
```

`0.6 dense / 0.4 sparse` is a starting point, not a law — tune it on your golden set. Above that sits reranking: a cross-encoder (Cohere Rerank, BGE Reranker) scores query-chunk pairs jointly and reorders the top-K before generation. It's more accurate than embedding similarity because it looks at the pair together, but it's too slow for first-pass retrieval. Use it as a second stage over the top 50, not as your retriever.

## Evaluation Before You Deploy Anything

This is the section teams skip, and it's the one that separates a demo from a system. RAG has two distinct failure modes, and aggregate "it feels good" testing can't tell them apart:

- **Retrieval failure** — the right chunks were never retrieved.
- **Generation failure** — the right chunks were retrieved and the model ignored or misrepresented them.

Build a golden dataset of `(question, expected answer, reference documents)` *before* you commit to a chunking strategy, embedding model, or index type. Then you can change one variable at a time and measure it. The metrics I actually track:

- **Context precision / recall** — of retrieved chunks, what fraction were useful; of all useful chunks, what fraction were retrieved. This isolates retrieval failure.
- **Faithfulness / groundedness** — does each claim in the answer follow from a retrieved chunk, or did the model fall back to parametric memory? An LLM-as-judge checks claim-by-claim.
- **Answer relevance** — does the answer address the question, independent of grounding.

LLM-as-judge scales the grading, but define the rubric precisely and check judge-judge agreement before you trust the scores. An unanchored judge is just a second opinion with a confidence problem.

## Hallucination and Grounding

The most effective hallucination lever in RAG is at the prompt, not the model. Give the model an explicit, licensed reason to refuse:

```
Answer using ONLY the context below.
If the answer is not in the context, say "I don't know."
For each factual claim, cite the document [source_id] it came from.

Context:
[chunk_1] (source: doc_A)
[chunk_2] (source: doc_B)

Question: {user_question}
```

Two things this buys you. First, "I don't know" becomes an acceptable output, which is far better than a confident fabrication in a financial context. Second, per-claim citations are machine-verifiable — your evaluation harness can check that every claim maps to a real retrieved source. Reinforce it with ordering: attention has a real recency bias, so put the highest-ranked chunks closest to the question, and always reserve a fixed token budget for the answer so retrieved context can't crowd out generation.

## Governance: Access Control on Retrieved Data

Here's where most RAG architectures quietly break in regulated environments. The retriever is, by default, an authorization bypass. If a user can ask a question and the vector store returns any chunk that matches semantically, you've granted read access to the entire corpus regardless of who that user is. In a bank, that's the whole game.

The fix is to push access control down to the data, not bolt it on at the chatbot. On AWS, that means tying retrieval to the same fine-grained permissions that govern the lake. If your source documents live on an open data lake — S3 plus Apache Iceberg, governed by Lake Formation — then Lake Formation's row- and column-level permissions are the authority on who can see what. Retrieval has to honor that boundary, not invent its own.

Concretely, the patterns that hold up:

- **Filter at query time by identity.** Carry the caller's entitlements into the retrieval call and apply them as a metadata pre-filter on the vector search, so a chunk the user isn't entitled to never enters the candidate set. Filtering *after* retrieval is a leak waiting to happen.
- **Per-tenant namespace isolation.** In multi-tenant stores this is mandatory, not optional. Without it you're exposed to membership inference — an adversary who can observe *which* chunks come back can infer whether a specific document exists in the corpus, which is itself disclosure.
- **Keep the permission model in one place.** Don't reimplement Lake Formation's grants inside the embedding pipeline. Derive the retrieval filter from the same governance source of truth so an entitlement change propagates without a re-index.
- **Audit every retrieval.** Log query, retrieved chunk IDs, scores, and the answer for every request. That log is your evidence trail for both quality regressions and "who saw what" investigations — and in regulated financial services, someone will eventually ask.

There's a second, RAG-specific attack worth calling out: indirect prompt injection. A malicious instruction sitting inside a *retrieved document* tells the model to ignore its system prompt or exfiltrate the conversation. It's distinct from direct injection because the attacker poisons a corpus document, not the user input. Defenses that actually help: sanitize retrieved chunks for instruction-like patterns, repeat your safety instructions *after* the retrieved context as well as before, and — critically — if your system can take actions, never let retrieved content trigger a tool call. Treat retrieval context and tool-calling instructions as strictly separate privilege domains.

## Where Agentic and MCP Retrieval Fit

In an agentic architecture, retrieval stops being a fixed pipeline step and becomes a tool the agent invokes when it decides it needs external knowledge. The agent's short-term memory is the context window; long-term memory is exactly what RAG provides. The agent chooses *when* to retrieve, *what* to query with, and *how many rounds* to run — which is what enables multi-hop questions that a single nearest-neighbor lookup can't answer. The ReAct pattern interleaves reasoning steps with retrieval actions: think, retrieve, read, think again, answer.

The Model Context Protocol is the clean way to expose retrieval as that tool. Wrapping your governed retriever behind an MCP server means the access-control and audit story from the previous section travels with the tool — the agent calls a retrieval tool that already enforces Lake Formation entitlements and logs every hit, rather than reaching into a raw index. That separation matters more in agentic systems than in pipeline RAG, precisely because the agent can chain calls and an unbounded, ungoverned retriever becomes much harder to reason about.

A caveat from experience: agentic retrieval multiplies your failure surface. Every extra retrieval round is more latency, more cost, and another place an injected instruction or an over-broad query can do damage. I reach for it when questions genuinely require multi-hop reasoning across documents — not as a default wrapper around a problem that single-pass hybrid search already solves.

## Conclusion

Production RAG is less about clever retrieval tricks than about discipline in three areas: measure retrieval and generation failures separately with a golden set, push access control down to the governed data layer instead of the chatbot, and treat retrieved content as untrusted input. Get those right and the system holds up under regulatory scrutiny. Get the embeddings perfect but skip the governance and you've built a fast, accurate way to leak data. The order of operations is the whole point.
