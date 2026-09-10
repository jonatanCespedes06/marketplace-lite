# Tasks: <Feature Name>

> Copy this template to `specs/<feature>/tasks.md`.
> Keep tasks atomic; check them off as `sdd:close` validates them.

## Domain

- [ ] 1. Create/extend entities + value objects (pure TS, no framework imports)
- [ ] 2. Add domain events
- [ ] 3. Unit tests for new domain rules (no mocks)

## Application

- [ ] 4. Define Zod DTO schemas
- [ ] 5. Implement use case(s) returning `Result<T, E>`
- [ ] 6. Define ports (repository/service interfaces)
- [ ] 7. Integration tests with fakes

## Infrastructure

- [ ] 8. Implement adapters (persistence / http / messaging)
- [ ] 9. Wire config (env names documented, no secrets committed)

## Interfaces

- [ ] 10. Validators (Zod) + mappers
- [ ] 11. Controllers + routes
- [ ] 12. HTTP tests

## Frontend

- [ ] 13. `features/<feature>` components + hooks
- [ ] 14. API client wiring + input validation
- [ ] 15. Component tests

## Close-out

- [ ] 16. `sdd:validate` passes (arch, security, tests)
- [ ] 17. Docs/metrics updated
