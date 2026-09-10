---
translationKey: batch-to-event-driven-data-flow
locale: en
slug: from-batch-jobs-to-event-driven-data-flow
status: published
title: From nightly batch to event-driven data flow
excerpt: >-
  The 2 a.m. batch job is rarely an architectural decision. It is a habit. And
  moving away from it starts with changing how you think about data, not with
  choosing a new tool.
series: data-and-ai
tags:
  - veri-akisi
  - entegrasyon
  - streaming
  - mimari
authorRef: duosis-muhendislik-ekibi
relatedSolutionRefs:
  - en/data-streaming-and-integration
publishedAt: 2026-09-10
sources:
  - label: Apache Kafka — official documentation
    url: https://kafka.apache.org/documentation/
  - label: Apache Airflow — DAG core concepts (official documentation)
    url: https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html
seo:
  title: From nightly batch to event-driven data flow
  description: >-
    What nightly batch jobs really cost, when event-driven flow is the right
    answer, and the practical limits of making the move.
  noindex: true
---

Somewhere near the centre of most enterprise data estates is a single
sentence: "it runs at 2 a.m." Reports are ready by morning, integrations
finish overnight, the warehouse starts the day full. The arrangement works for
years and usually goes unquestioned — until a business team stops asking what
happened yesterday and starts asking what is happening right now.

This piece is about when that shift is worth making, and where it should
start. One thing is worth saying up front: **not every batch job needs to
become a stream.** The real question is when a particular piece of data is
worth something.

## What the nightly job actually costs

The cost of a batch job is usually measured in runtime. The real cost
accumulates in three other places.

**Freshness.** In a nightly job, the average age of the data is twelve hours.
That is fine for a stock report. It means the same data cannot be used for
fraud detection or a capacity alert. Freshness is not a performance setting;
it is the boundary that decides which questions the data is allowed to answer.

**Blast radius.** A batch job fails as a whole. A type error on row 190,000
of 200,000 sends the job back to the start. And because the failure happens
overnight, nobody notices until morning — by which point the window to fix it
has closed until the next night.

**The dependency chain.** Batch jobs are rarely alone. When one runs late, the
four behind it run late too. The DAG concept in an orchestrator like Airflow
exists precisely to manage those dependencies — as the official documentation
puts it, "declaring these dependencies between tasks is what makes up the Dag
structure." The tool makes the chain **manageable**. It does not make the
chain shorter.

## What event-driven flow changes

In an event-driven approach the question inverts. Instead of "how often should
I copy this table?", you ask "what has to happen in this system for me to want
to know about it?"

The difference is conceptual rather than technical. In batch, data is a
**state**: the current contents of a table. In a stream, data is an **event**:
what changed, when, and in what order. The second can reconstruct the first;
the reverse is not possible — you cannot recover how a table arrived at its
current state from a snapshot of that state.

That distinction has practical consequences:

|                | Batch job         | Event-driven flow               |
| -------------- | ----------------- | ------------------------------- |
| Data age       | Hours             | Seconds                         |
| Failure impact | Whole job fails   | A single record is isolated     |
| Reprocessing   | The entire window | From a chosen point onward      |
| New consumer   | Write a new job   | Subscribe to an existing stream |
| Ordering       | Lost              | Preserved                       |

The last row is the one most often missed. In a log-based system such as
Kafka, the order of events carries as much information as the events
themselves. "Order created → payment taken → cancelled" and "order created →
cancelled → payment taken" arrive at the same final state but describe two
completely different business cases.

## Not everywhere: a decision rule

Moving to event-driven architecture has a genuine price — operational
complexity, schema management, reprocessing scenarios, monitoring. That price
is not worth paying for every dataset.

A workable rule:

- **Move it to a stream** when the value of the data decays quickly, when
  several consumers read the same data for different purposes, or when the
  order of events carries business meaning.
- **Leave it in batch** when the data is inherently periodic (month-end
  reconciliation, payroll), when the source system can only produce snapshots,
  or when a single consumer looks at it once a day.

Migrations that skip this distinction tend to begin with the hardest dataset,
stall, and conclude that "streaming was not a fit for us." What was not a fit
was the choice of first step.

## The limits nobody plans for

Three things are consistently underestimated.

**Schema evolution.** A stream is long-lived, and its schema will change.
Adding a field must not break existing consumers; removing one has to proceed
under control. This is not a detail to work out after the migration — it is a
contract to establish on day one.

**Reprocessing.** "Let's rerun the last three days" is a harder sentence in a
streaming world than in a batch one. What a consumer does when it sees the
same event a second time — ignore it, or overwrite — has to be defined in
advance.

**Ordering and partitioning.** Event order is only guaranteed within a
partition. If order carries business meaning, the partition key has to line up
with the business key (customer, account, order). It is one of the most
expensive decisions to change later.

**Historical data.** A stream fills from today forward; the past is not in it.
If historical analysis matters, a backfill strategy has to be designed
alongside the stream, not after it.

## Where to start

The sequence that tends to work: begin with one source system and one
consumer. Establish the schema contract, the reprocessing behaviour and the
monitoring on that pair alone. When adding a second consumer to the same
source becomes easy, the approach is working. When it does not get easier,
something in the design still needs fixing.

Tools such as Confluent, Apache NiFi, Airflow and Elastic each sit at a
different point in this picture: one carries events, one routes data, one
chains work, one handles search and analysis. Which of them you need becomes
clear after the decision rule above — not before it.

Migrations that begin with tool selection share an ending: the new platform
goes in, the old batch jobs stay where they are, and the organisation now
operates both. The architecture was supposed to get simpler; the complexity
doubled instead.
