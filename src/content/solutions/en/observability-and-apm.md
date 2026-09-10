---
translationKey: observability-apm
locale: en
slug: observability-and-apm
status: published
order: 1
category: core
featured: true
eyebrow: Observability & APM
title: Operational visibility and application performance
summary: >-
  Brings infrastructure, network, application and log data into one operational view.
problem: >-
  When a service slows down, teams look at different tools. Metrics live in one
  place, logs in another, application traces on a third screen. Finding where the
  problem started turns into archive work rather than analysis.
approach: >-
  We join metric, log, event and trace data under shared identities: same
  service, same environment, same request. Application performance is not
  separated from its infrastructure context; APM is part of this view, not a
  separate discipline.
benefits:
  - Problems become visible before they reach users
  - Root cause analysis runs within a single context
  - Escalation between teams and the argument over whose side is at fault decrease
  - Capacity and performance decisions rest on measurement
capabilities:
  - Infrastructure, virtualisation and network monitoring
  - Application performance monitoring and distributed tracing
  - Log and event collection and normalisation
  - Service-level dashboards and alert design
  - Shared tag and identity model design
  - Alert threshold and noise management
aiRole:
  detect: >-
    Collects metric, log, event and trace streams into one operational view and
    learns the normal behaviour pattern.
  understand: >-
    Correlates simultaneous deviations, reduces repeating alerts to a single
    event and derives the affected services.
  act: >-
    Connects the event to the responsible team and to a recommendation; triggers
    approved automation steps and leaves the work traceable.
scenario:
  title: A payment service that slows down
  context: >-
    Response time is rising on the payment service. There is no alert on the
    infrastructure side, while the application team suspects the infrastructure.
  flow:
    - The service dashboard shows the increase in response time and which end it comes from.
    - Traces from the same window reveal which call the request is waiting on.
    - Connection pool metrics of the database behind that call are examined.
    - A configuration change made in the same window appears in the event stream.
  result: >-
    The issue moves forward within a single context instead of separate
    investigations per team, and the change that caused it is recorded.
technologyRefs:
  - datadog
  - zabbix
  - instana
  - opentelemetry
  - foglight
proofRefs: []
cta:
  labelKey: cta.contactUs
  href: /en/contact/
seo:
  title: Operational visibility and application performance
  description: >-
    We join metric, log, event and trace data in a shared context so it becomes
    visible where a problem started.
  noindex: true
---

Visibility is not a product installation. What matters is less which data is
collected than whether that data comes together **under a shared identity**. If
the same service is named three different ways in three systems, the result is
four separate archives.

We usually start by inventorying the existing tools and deriving the tag model.
The goal is not to add another screen, but to place the signals that already
exist into one operational context.
