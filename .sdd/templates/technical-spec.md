# Technical Spec: <Feature Name>

> Copy this template to `specs/<feature>/technical.md`.
> Must respect `.agentic-rules/architecture.md` (Domain → Application → Infrastructure → Interfaces).

## 1. Domain changes

- Entities / Value Objects / Aggregates:
- Domain events:
- Invariants:

## 2. Application changes

- Use cases (commands / queries):
- DTOs + Zod schemas (validate at the boundary):
- Ports (repository / service interfaces):

## 3. Infrastructure changes

- Adapters (persistence, http-clients, messaging):
- Config / secrets (names only, never values):

## 4. Interfaces changes

- HTTP routes (`method /path` + status codes):
- Controllers / validators / mappers:
- Frontend (`features/<feature>` components, hooks, routes):

## 5. Security

- Input validation (Zod):
- AuthN/AuthZ:
- Rate limiting / headers (helmet, cors):
- OWASP Top 10 considerations:

## 6. Testing

| Layer | Type | File |
|-------|------|------|
| Domain | unit, no mocks | `tests/unit/...` |
| Application | integration with fakes | `tests/...` |
| Interfaces | HTTP / E2E | `tests/...` |

## 7. Rollout

- Feature flag name + default:
- Migration strategy (forward-only):
- Observability (logs / metrics / traces):
- Rollback plan:
