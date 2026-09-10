# Functional Spec: <Feature Name>

> Copy this template to `specs/<feature>/functional.md` and fill every section.
> Rule: no code is written until this spec passes `sdd:validate`.

## 1. User Story

**As a** `<role>`
**I want** `<capability>`
**So that** `<business value>`

## 2. Acceptance Criteria (Gherkin)

```gherkin
Feature: <feature>
  Scenario: <happy path>
    Given <precondition>
    When <action>
    Then <observable outcome>
```

- [ ] AC1: ...
- [ ] AC2: ...

## 3. Business Rules

| ID | Rule |
|----|------|
| BR-01 | ... |

## 4. Edge Cases

| # | Case | Expected behavior |
|---|------|-------------------|
| 1 | ... | ... |

## 5. Permissions

| Role | Allowed | Denied |
|------|---------|--------|
| guest | ... | ... |
| user | ... | ... |

## 6. Metrics

- Success metric: ...
- Instrumentation (event name + payload): ...

## 7. Out of Scope

- ...
