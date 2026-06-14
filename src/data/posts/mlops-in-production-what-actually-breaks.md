# MLOps in Production: What Actually Breaks

I've spent the last stretch of my career on data and ML platforms inside regulated financial services, and I want to be blunt about something: the model is almost never what breaks. In my experience the model is the easy part. It trains, it scores well offline, a data scientist demos it in a notebook, everyone is happy. Then it meets production, and the things that fail are the things nobody put on the roadmap — the feature pipeline, the silent skew, the monitoring that was deferred to "phase two" and never funded.

This post is a tour of the failure modes I keep seeing, and how I design against them. It's opinionated and it's ops-first, because that's where the pain lands.

## The notebook-to-production gap is a discipline gap

The first hard truth: a passing test suite in conventional software is strong evidence the code is correct. In ML, a model can pass every offline metric and still rot in production, because the world changed after you trained it. That asymmetry is the whole reason MLOps exists as a separate discipline rather than "DevOps with GPUs."

Three properties make ML systems genuinely harder to operate:

- **Data dependency.** Correctness is a function of training data that drifts independently of your code. You can ship zero code changes and still degrade.
- **Stochastic outputs.** Same model, same input, two different answers. Your testing has to be probabilistic, not assertion-based.
- **Entanglement.** Change one feature and you can silently move the behaviour of every other feature. The shorthand I use with teams is CACE — Changing Anything Changes Everything.

What gets skipped most often is the boring prerequisite underneath all of it: software engineering discipline. If the data scientists are shipping un-tested, un-packaged code out of notebooks, no MLOps platform will save you. It will just give you faster, more confident wrong answers. On a recent program the single highest-leverage thing we did was insist that model code went through the same packaging, review, and CI gates as everything else. Unglamorous, and it paid for itself within a quarter.

## Feature and data pipelines: where the skew hides

Most production ML incidents I've investigated trace back to the feature layer, not the model. The classic killer is **training-serving skew**: the transformation applied at serving time differs, even subtly, from the one applied at training. A different default fill, a timezone, a rounding rule. The model never knows; it just degrades.

Two defences I push hard:

**Encapsulate preprocessing inside the model artifact** so the exact same transform runs at train and serve time. Don't reimplement feature logic in the serving service — that's two codebases drifting apart by design.

**Use a feature store that guarantees point-in-time correctness.** A feature store serves two populations with opposite needs: training wants historical, point-in-time-correct snapshots; inference wants sub-millisecond online lookups. Conflate those access patterns and you reintroduce skew. The non-negotiable property is that when you generate a training label, the feature values reflect what was actually known *at the time of the event* — not a value retrospectively joined in. Ad-hoc SQL joins violate this constantly, and it's invisible until your offline metrics look great and production doesn't.

Then there's drift. **Data drift** (the input distribution P(X) moves) is the one people remember. **Concept drift** (the relationship P(Y|X) changes) is the one that actually hurts in fraud and credit, because the adversary or the economy is actively changing the mapping you trained on. You need statistical gates on the inputs — KS, PSI, chi-squared on feature distributions — and a path to catch P(Y|X) shifts once labels arrive.

## Registry, versioning, reproducibility

If you can't answer "which data produced which model, and who approved it," you don't have a production ML system — you have a model in production, which is a different and worse thing.

A model registry is the spine here. It tracks which version is deployed where, links to the training run that produced it, and gives you a rollback path. I treat it as a first-class component wired into CI/CD, not a spreadsheet.

Underneath it you need experiment tracking — hyperparameters, metrics, and artifacts logged per run — so a production model is a traceable artifact rather than a statement of faith. MLflow is the common integration point. Whatever you pick, the test is simple: can you reconstruct, from metadata alone, exactly what went into the model regulators are about to ask about? In regulated FS, "we think it was this dataset" is not an acceptable answer.

Reproducible data splits matter more than people expect. A non-deterministic train/test split means you can't reproduce a result, which means you can't defend it. Make splitting deterministic and hashable from day one.

## CI/CD for models is not CI/CD for code

You can lift a lot of DevOps machinery, but the pipeline has extra stages. A model CI/CD pipeline I'd consider production-grade looks roughly like this:

```yaml
stages:
  - validate_data        # schema + distribution gates before anything trains
  - train
  - evaluate             # offline metrics AND fairness/bias checks
  - register             # push to model registry, tag lineage
  - deploy_shadow        # mirror prod traffic, serve nothing
  - promote              # canary -> full, gated on live metrics
```

The two stages teams skip are `validate_data` and `deploy_shadow`, and those are exactly the two that catch the expensive failures. Data validation as a *gate* — fail the pipeline if the incoming distribution doesn't match the schema — stops a corrupted upstream feed from quietly producing a corrupted model.

A trigger from monitoring should be able to fire this whole pipeline: detect drift, retrain, evaluate, and conditionally promote. That closes the loop from monitoring back to deployment, which is the difference between a platform and a pile of scripts.

## Serving patterns: pick the one that matches the latency you actually need

A recurring waste I see is teams standing up always-on real-time endpoints for workloads that are fundamentally batch. Match the pattern to the requirement:

| Mode | Latency target | Cost profile | Use it for |
|---|---|---|---|
| Real-time endpoint | < 200ms | Always-on compute | Fraud scoring, user-facing predictions |
| Batch transform | Hours fine | Pay-per-job | Nightly scoring, offline enrichment |
| Serverless inference | Seconds (cold start) | Pay-per-invocation | Spiky or infrequent traffic |
| Async inference | Minutes fine | Queued | Large inputs, document processing |

On SageMaker specifically, all four are available and the SDK makes them cheap to stand up — which is also the trap. The cost of a real-time endpoint is a 24/7 bill whether or not anyone is calling it. If your scoring is nightly, batch transform is an order of magnitude cheaper and operationally simpler. I'd rather defend a boring batch job than babysit an endpoint that exists because it was the default.

For rollout, the safe progression is **shadow** (mirror traffic, serve nothing, compare offline — zero user risk, real infra cost), then **canary** (1–5% of live traffic, metrics measured against the incumbent champion), then full promotion. The thing that makes all three workable is the registry knowing exactly what's deployed where, with a rollback that's one command, not an archaeology project.

## Monitoring: the layer that's always under-funded

This is where most stacks are thinnest, and the failure mode is nasty precisely because it's quiet. The model degrades gradually, no alarm fires, and six months later someone notices a business metric sliding and traces it back. By then you've been making worse decisions for two quarters.

Monitoring has to be a design concern from day one, not a bolt-on. Concretely, ML observability extends ordinary metrics/logs/traces with:

- **Prediction logging** — every request and output, for offline analysis.
- **Feature logging** — the exact feature values used at inference time. This is your single best tool for diagnosing training-serving skew after the fact. Log the features the model actually saw, not the ones you think it saw.
- **Ground-truth joining** — labels arrive late; join them back to predictions to compute real performance, not just proxies.

Then decide your retraining trigger deliberately. Schedule-based is simple and predictable but can lag a fast-moving distribution. Performance-based needs labels with acceptable latency. Data-volume-based needs no labels. Drift-based is the most sensitive and the most prone to false positives — and false positives here mean retraining cost and alert fatigue, which is how monitoring quietly gets switched off. Pick the trigger that matches how fast your world actually moves, and budget the alert noise honestly.

And watch cost as a first-class signal. An endpoint that scales out under drift, or a training job that balloons, will show up on the bill before it shows up anywhere else. If cost isn't on a dashboard next to accuracy, you're monitoring half the system.

## Governance and lineage in regulated settings

In regulated FS this stops being optional and becomes the thing auditors actually test. The mindset shift that matters: treat compliance capabilities — explainability, bias monitoring, access control, audit logs — as **platform requirements the system enforces**, not documentation you write afterwards. If the lineage isn't captured automatically by the pipeline, it doesn't exist when someone asks for it under pressure.

What I want demonstrable on demand:

- **Lineage** — which data, which code, which run, which approver, for every deployed model.
- **Bias and fairness monitoring** — ongoing disparate-impact checks, not a one-time pre-launch report.
- **Explainability** — and here I lean toward *interpretable-by-design* over post-hoc explanation for high-stakes decisions. Techniques like Explainable Boosting Machines can be competitive with gradient boosting on tabular data while staying inherently interpretable. That closes the gap between the model regulators review and the model that's actually serving — which is a gap I've watched cause real trouble when the two diverge.

Most enterprise teams, honestly, sit between "notebooks and manual deploy" and "CI/CD for training." That's fine as a starting point — but you should know where you are on that ladder, because each under-engineered layer multiplies the cost of fixing the next.

## And now it's stretching to LLMOps

The same skeleton extends to foundation models, but several concerns mutate in ways that catch teams out. Training from scratch is rarely the job now; fine-tuning, RAG, and prompt-based applications dominate. The operational map shifts:

| Classical MLOps | LLMOps equivalent | New problem |
|---|---|---|
| Feature engineering | Prompt / context construction | Non-deterministic, hard to unit-test |
| Model versioning | Prompt + model versioning | The prompt is code; version-control it |
| Serving optimization | KV cache, continuous batching | Token economics, not just latency |
| Drift monitoring | Output-quality / hallucination drift | No ground truth; eval is expensive |
| CI/CD for models | CI/CD for prompts + adapters | Regression testing over open-ended output |

A few things I'd flag from running these:

**The prompt is code.** It belongs in version control with a regression suite, because a one-line prompt edit can quietly regress behaviour across every path that uses it. "We tweaked the prompt in the console" is the LLM-era equivalent of editing production by hand.

**RAG adds a retrieval component classical ML doesn't have.** That means new failure surfaces: retrieval quality (precision@k, groundedness, faithfulness) needs its own monitoring, and changing your chunking strategy or embedding model invalidates the vector index — that's a re-indexing migration, analogous to a schema change, and should be treated with the same care.

**Cost is the dominant operational metric.** Token spend has no real analogue in classical ML. KV cache, continuous batching, and routing cheap queries to smaller models are the levers. Without cost attribution wired in, an LLM feature can quietly become your largest line item.

The reassuring part: the discipline transfers. The Feature/Training/Inference split still holds — data collection, fine-tuning, and serving are still distinct stages with explicit contracts. LLMOps is an extension of MLOps, not a replacement, and teams that did the classical work well have a real head start.

## Conclusion

None of this is exotic. The failures are mostly mundane: a transform that drifted between train and serve, a registry that didn't exist, monitoring that got deferred, a prompt edited in a console. The teams that run ML well in production aren't the ones with the cleverest models — they're the ones who treated the pipeline, the lineage, and the monitoring as the actual product, and the model as one replaceable component inside it. If you design for the failure modes up front, most of this is manageable. If you don't, you'll meet every one of them eventually, usually at the worst possible time.
