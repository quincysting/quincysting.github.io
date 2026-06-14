# Building Production GenAI on AWS: Beyond the Demo

A Bedrock demo takes an afternoon. You wire up `invoke_model`, paste in a prompt, get a plausible answer, and someone in the room says "ship it." Then you try to put that in front of real users in a regulated bank, and the afternoon becomes two quarters.

I've spent the last few years building GenAI systems on AWS — most recently on a tier-one Australian bank data-platform program — and the gap between a demo and production is almost entirely the stuff the demo conveniently ignores: what happens when the model is wrong, who is allowed to call it, where the data lives, what it costs at 10,000 requests an hour, and how you prove any of it to an auditor.

This is a field guide to that gap. It's opinionated, and it calls out where things break.

## Choosing a Foundation Model (and Not Marrying It)

Bedrock gives you a catalog — Anthropic Claude, Amazon Titan and Nova, Meta Llama, Mistral, Cohere, AI21, Stability. The instinct is to benchmark them all on day one and pick a winner. That's the wrong question. The right question is: what's the smallest, cheapest model that clears my quality bar for *this specific task*, and can I swap it later without a rewrite?

Two principles I hold to:

- **Route by task, not by org.** Summarisation, classification, and extraction often run fine on a small/fast model. Multi-step reasoning and tool use need a frontier model. Pinning everything to your most capable model "to be safe" is the single most common way teams burn budget.
- **Abstract the model ID behind config.** Model versions get deprecated, new ones land monthly, and your "best" choice will change. Don't scatter model identifiers through your codebase.

```python
# Model choice is a deployment decision, not a code decision.
MODEL_ROUTES = {
    "extract":   "amazon.nova-lite-v1:0",
    "summarize": "anthropic.claude-3-5-haiku-20241022-v1:0",
    "reason":    "anthropic.claude-sonnet-4-20250514-v1:0",
}

def model_for(task: str) -> str:
    return MODEL_ROUTES[task]  # one place to change when models churn
```

The honest trade-off: managed Bedrock inference is more expensive per token than a self-hosted SageMaker endpoint you've optimised. But for the vast majority of workloads, the engineering and operational cost of running your own inference fleet dwarfs the token savings. Self-host when you have sustained, predictable, high volume *and* a latency or data-residency constraint Bedrock can't meet — not before.

## Guardrails Are Not Optional

In financial services, "the model said something it shouldn't have" is an incident, not a bug. Bedrock Guardrails give you content filters, denied topics, PII detection and redaction, and contextual grounding checks as a policy layer that sits *outside* the prompt. That last part matters: a guardrail you can configure and version independently of the prompt is auditable in a way that "we told the model to behave" never is.

A few hard-won notes:

- **Treat the user prompt and the system prompt as different trust zones.** User-supplied text is hostile input. Prompt injection is the new SQL injection, and "ignore previous instructions" is the new `' OR 1=1 --`.
- **Guardrails are defence in depth, not a force field.** They reduce the rate of bad output; they don't drive it to zero. Layer them with structured output validation and least-privilege tool access.
- **Contextual grounding checks are your cheapest hallucination defence in RAG.** They score whether the answer is actually supported by the retrieved context, and let you block or flag low-grounding responses before they reach a user.

## RAG vs Fine-Tuning: A Decision, Not a Religion

People treat this as a tribal allegiance. It's a cost-and-freshness decision.

**Reach for RAG when** the knowledge changes (policies, product data, tickets), when you need citations back to a source document, or when "the model must not make this up" is a hard requirement. RAG keeps your knowledge in a vector store you control and update, not baked into weights.

**Reach for fine-tuning when** you need to change *behaviour or format* — a consistent tone, a structured output shape, a domain idiom — rather than inject facts. Use parameter-efficient methods (LoRA / QLoRA train a couple of percent of the weights) before you ever consider a full fine-tune. Full fine-tuning costs more, needs more data, and quietly erodes the model's general ability.

In practice, the answer is usually **RAG first, fine-tune later if at all** — and most teams never need the fine-tune. A retrieval pipeline you can update on Tuesday afternoon beats a training run you have to re-justify every quarter.

On the RAG pipeline itself:

```
load → chunk → embed → vector store → retrieve → rerank → augment prompt → generate
```

Where teams actually lose quality:

- **Chunking.** Naive fixed-size chunking shreds tables and code. Spend your effort here before you blame the model.
- **Retrieval, not generation.** Most "the LLM gave a bad answer" bugs are "we retrieved the wrong context" bugs. Add hybrid search (dense vectors + BM25 keyword) and a reranking step before you reach for a bigger model.
- **Store choice.** Bedrock Knowledge Bases (OpenSearch Serverless underneath) is the zero-ops default. If your vectors live next to relational data, Aurora PostgreSQL with `pgvector` saves you a system. HNSW is the right index for most cases; reach for IVF only at very large corpus sizes.

## Agentic Patterns and MCP

Agents are where demos are most seductive and production is least forgiving. The moment you let an LLM *take actions* — call tools, hit APIs, write data — you've handed a probabilistic component the keys to deterministic systems.

The useful patterns are old news by now: ReAct (interleave reasoning and tool calls) and PAL (generate code, execute it, return the result). What's changed is **Model Context Protocol (MCP)** becoming the common interface between agents and tools. It's genuinely useful — a standard tool-integration contract beats every team inventing its own — but it widens the attack surface.

My rules for agents in regulated environments:

- **Every tool call runs under its own least-privilege IAM role.** The agent does not get a broad role "for convenience." Scope each action group to exactly what it needs.
- **Treat tool *output* as untrusted input.** A tool that returns attacker-controlled text can inject instructions back into the model. Sanitise before re-injection.
- **Keep a human in the loop for anything irreversible.** Money movement, data deletion, customer-facing commitments — the agent proposes, a human (or a hard deterministic check) disposes.
- **Bound the loop.** Cap reasoning steps and tool invocations. An unbounded agent is an unbounded bill and an unbounded blast radius.

## Cost and Latency: Design for Them or They Design You

Token cost and latency are architectural concerns, not things you tune at the end.

- **Prompt caching** is the highest-leverage win for long, stable system prompts and reused context. If you're paying full price to resend the same 4,000-token preamble on every call, that's free money on the floor.
- **Cache responses** for repeated or near-identical queries. A semantic cache in front of the model deflects a surprising share of traffic.
- **Right-size the model per route** (see above) — this is as much a cost lever as a quality one.
- **Stream tokens** for anything user-facing. It doesn't make generation faster, but it changes perceived latency from "frozen" to "responsive," and that's most of the battle.
- **Set timeouts and exponential backoff** on every model call, and plan for throttling. Bedrock has account-level throughput limits; under load you *will* hit them, and the question is whether you degrade gracefully or fall over.

```python
# Backoff is not optional under real load.
import time, random
def invoke_with_backoff(call, max_retries=5):
    for attempt in range(max_retries):
        try:
            return call()
        except ThrottlingException:
            time.sleep((2 ** attempt) + random.random())
    raise RuntimeError("model throttled after retries")
```

Track cost per request as a first-class metric from day one. The team that doesn't measure it discovers the number in the monthly bill, which is the worst possible place to discover it.

## Security and Governance: Where Regulated Workloads Live or Die

This is the part the demo never shows and the auditor cares about most.

- **IAM is the real access control.** Scope `bedrock:InvokeModel` to specific principals and specific model ARNs. Not every engineer and not every service needs to call every model.
- **Keep traffic off the public internet.** VPC endpoints (PrivateLink) for Bedrock and SageMaker mean your prompts and data never traverse the open internet — frequently a hard compliance requirement, not a nice-to-have.
- **Data residency is a model-selection constraint.** In Australian financial services, data sovereignty can dictate which region — and therefore which models — you're even allowed to use. Confirm regional model availability *before* you design around a specific model, not after.
- **Encrypt with customer-managed KMS keys** for model artifacts, training data, and embeddings at rest.
- **Log every invocation via CloudTrail.** "Who asked the model what, when, and what did it return" is a question you must be able to answer on demand. Build that capability in from the start; retrofitting audit logging is miserable.

None of this is GenAI-specific magic. It's the same AWS security posture you'd apply to any sensitive workload — which is exactly the point. GenAI doesn't get an exemption from your control framework.

## Observability: You Can't Operate What You Can't See

Classical APM tells you the endpoint returned 200 in 800ms. It tells you nothing about whether the *answer was any good*. GenAI observability needs an extra layer:

- **Operational metrics:** latency (including time-to-first-token), token counts in and out, throttle and error rates, cost per request — on CloudWatch.
- **Quality signals:** grounding scores, guardrail intervention rates, retrieval relevance, and user feedback (thumbs up/down is crude but real). A rising guardrail-block rate or falling grounding score is often your earliest warning that something upstream — a prompt change, a data refresh, a model version bump — has regressed.
- **Drift:** the model version moved, your document corpus changed, real-world inputs shifted. Run a small evaluation suite on a schedule, not just at release, so you find regressions before your users do.

Be honest about a real gap: AWS-native, first-class RAG *evaluation* is still thinner than the rest of the stack. You'll likely assemble your own harness — a golden set of question/answer/expected-source triples, scored on a cadence. Build it early. It's the difference between "users are complaining" and "metric X dropped on Thursday after the corpus refresh."

## Closing

Most of what makes GenAI hard on AWS isn't the GenAI. It's the same discipline any production system in a regulated environment demands — least privilege, private networking, audit trails, cost control, observability — applied to a component that is probabilistic, occasionally confidently wrong, and able to take actions.

The demo proves the model *can* do the thing. Production is the work of making it do the thing safely, affordably, and provably, every time, in front of people who will notice when it doesn't. Treat the model as one component in a system you already know how to engineer, lean on AWS's existing primitives rather than waiting for a GenAI-shaped version of each, and budget for the 80% the demo skipped. That's the whole job.
