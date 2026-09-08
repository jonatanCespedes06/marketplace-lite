# SDD: Spec-Driven Development

En Marketplace Lite, no escribimos código sin una especificación previa. Esto permite que los Agentes de IA y los humanos trabajen sobre la misma base de verdad.

## 1. El Flujo SDD
`Functional Spec → Technical Spec → Task Breakdown → Implementation → Verification`

### 1.1 Functional Spec (`specs/feature-name/functional.md`)
- **Objetivo:** ¿Qué problema resolvemos?
- **User Stories:** "Como usuario quiero..."
- **Criterios de Aceptación:** Checklist claro de éxito.

### 1.2 Technical Spec (`specs/feature-name/technical.md`)
- **Impacto Arquitectónico:** ¿Nuevas entidades? ¿Cambios en la DB?
- **API Design:** Definición de endpoints o contratos.
- **Diagramas de Secuencia:** Para flujos complejos.

### 1.3 Task Breakdown
- División en tareas atómicas (< 4 horas).
- Definición de "Done" para cada tarea.

## 2. Uso de Plantillas
Las plantillas se encuentran en `.sdd/templates/`. Es obligatorio usarlas para mantener la consistencia.

## 3. Validación con Agentes
Antes de implementar, un agente debe validar la Technical Spec contra las `.agentic-rules/`.
- ¿Cumple con Clean Architecture?
- ¿El diseño de seguridad es correcto?
- ¿La estrategia de testing es suficiente?

## 4. Trazabilidad
Cada commit debe referenciar la tarea de la spec (ej: `feat(checkout): implement place-order use case [SPEC-1.2]`).

## 5. El "Live Document"
Las specs no son estáticas. Si durante la implementación se descubre un cambio necesario, se actualiza la spec primero, se valida y luego se continúa con el código.
