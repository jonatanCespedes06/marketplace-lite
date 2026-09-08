# Marketplace Lite: Agente Entry Point

## Qué es este repositorio
**Marketplace Lite** es un monorepo tipo scaffolding para demostrar el uso de IA en producción. Es el repo base para la charla técnica, implementando una arquitectura limpia (Clean Architecture) y Domain-Driven Design (DDD) con flujos de trabajo Spec-Driven Development (SDD).

## Stack y Arquitectura
- **Arquitectura:** Clean Architecture + DDD + SDD.
- **Monorepo:** pnpm workspaces.
- **Lenguaje:** TypeScript 5.5+ estricto.
- **Backend:** Express 4.19 + TypeScript.
- **Frontend:** React 18.3 + Vite 5 + TypeScript.
- **Validación:** Zod 3.23 para types y runtime.
- **Testing:** Vitest 2.0 + Testing Library.
- **Estándares:** ESLint 9 flat config + Prettier 3.
- **Herramientas:** Turbo 2.x, pnpm 9.x.

## Cómo navegar el repositorio

```
marketplace-lite/
├── AGENTS.md                  # Este archivo: entry point para agentes
├── .agentic-rules/            # Reglas y políticas para agentes IA
│   ├── architecture.md
│   ├── scaffolding.md
│   ├── coding-standards.md
│   ├── testing.md
│   ├── security.md
│   ├── code-review.md
│   ├── deploy.md
│   └── sdd-process.md
├── .sdd/                      # Plantillas y configuración Spec-Driven
│   ├── config.yaml
│   └── templates/
├── specs/                     # Especificaciones funcionales y técnicas
│   └── checkout/              # Feature base implementada
├── package.json               # Root: workspaces + scripts orquestadores
├── pnpm-workspace.yaml
├── turbo.json                 # Opcional, cache de builds/tests
├── tsconfig.base.json         # Configuración base de TypeScript
├── packages/
│   ├── backend/               # Express + TS + Clean Arch (Domain → App → Infra → HTTP)
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── interfaces/http/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── frontend/              # React + Vite + TS
│   │   ├── src/
│   │   │   ├── features/      # o pages/components/hooks
│   │   │   ├── shared/
│   │   │   └── app/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/                # types, constants, validators (opcional)
│       ├── src/
│       └── package.json
└── README.md
```

## Punteros a .agentic-rules/

Cada archivo define un conjunto de reglas de oro para que los agentes trabajen de forma coherente:

- **`architecture.md`:** Estructura de capas (Domain → Application → Infrastructure → Interfaces), Dependency Rule, DDD (Entities, VOs, Aggregates, Events).
- **`scaffolding.md`:** Convenciones de naming, estructura de carpetas boilerplate para Use Cases y Features.
- **`coding-standards.md`:** TS strict, patrón Result/Either, validación Zod, inmutabilidad, funciones pequeñas.
- **`testing.md`:** Pirámide de testing: Domain (unit, sin mocks) → Application (fakes) → Infrastructure (adapters) → Interfaces (E2E).
- **`security.md`:** Defense in depth, OWASP Top 10, validación de inputs, gestión de secretos.
- **`code-review.md`:** Checklist obligatorio, etiquetas (labels), proceso de feedback, integración con agentes MCP.
- **`deploy.md`:** Pipeline CI/CD, migraciones forward-only, observabilidad, feature flags, rollback.
- **`sdd-process.md`:** Flujo Spec-first (Functional → Technical → Tasks), plantillas, validación con agentes, trazabilidad.

## Flujo SDD (Spec-Driven Development)

Ejecutar comandos `pnpm sdd` desde la raíz:

1.  **`pnpm sdd start`**: Inicializar nuevo feature (crea estructura de specs y plantillas).
2.  **`pnpm sdd generate`**: Generar boilerplate (casos de uso, componentes, interfaces) basado en la spec.
3.  **`pnpm sdd validate`**: Validar la especificación contra `.agentic-rules/` (arquitectura, seguridad, pruebas).
4.  **`pnpm sdd close`**: Cerrar la spec marcando tasks como done y actualizando trazabilidad.

**Comandos shortcut típicos:**
- `pnpm sdd new <nombre>`: Atajo que ejecuta `start → generate → validate`.

## Comandos Principales

| Comando | Descripción |
| :--- | :--- |
| `pnpm dev` | Inicia dev server para backend (tsx) y frontend (vite) de forma paralela. |
| `pnpm build` | Construye ambos packages (backend `tsc -b`, frontend `vite build`). |
| `pnpm test` | Ejecuta la suite de tests (Vitest) para todos los packages. |
| `pnpm test:watch` | Modo watch de Vitest. |
| `pnpm test:coverage` | Tests con cobertura de código. |
| `pnpm lint` | ESLint con configuración flat config en todos los packages. |
| `pnpm typecheck` | `tsc -b` en todos los packages para verificar tipos estrictos. |
| `pnpm sdd <command>` | Flujo de Spec-Driven Development (ver arriba). |

## Reglas de Oro para Agentes

1.  **Clean Architecture:** NUNCA pongas lógica de negocio en los controladores (Interfaces). Siempre hacia el Domain.
2.  **Result Pattern:** Usa `Result<T, E>` para firmas de funciones. No uses `try/catch` para flujo normal.
3.  **Zod First:** Toda entrada de datos debe validarse con Zod antes de cualquier operación.
4.  **Stict Typing:** `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride` son obligatorios.
5.  **DDD Purity:** Las entidades del Domain NO deben importar nada de Express, Vite o UI. Son puro TS/JS.
6.  **Especificaciones:** Antes de escribir una línea de código, asegúrate de que exista la spec en `specs/` y haya sido validada por `sdd:validate`.

## Referencia a specs/checkout/

El directorio `specs/checkout/` contiene la feature "Checkout Base" ya implementada, sirviendo como ejemplo patrón:
- `functional.md`: Historias de usuario y criterios de aceptación.
- `technical.md`: Diseño técnico, API contracts y diagramas de secuencia.
- `tasks.md`: Desglose atómico de tareas para implementación.

Este feature sirve como "plantilla viva" para generar nuevas features usando `pnpm sdd generate`.