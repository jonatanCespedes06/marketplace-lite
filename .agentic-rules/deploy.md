# Code Review: Quality Gate

El Code Review no es para buscar errores de sintaxis (eso lo hace el linter), sino para validar diseño, arquitectura y seguridad.

## 1. Checklist del Revisor
- [ ] **Arquitectura:** ¿Se respeta la Dependency Rule? ¿Hay lógica de negocio en los controladores?
- [ ] **DDD:** ¿Los Value Objects son inmutables? ¿Las entidades tienen comportamiento?
- [ ] **Manejo de Errores:** ¿Se usa el patrón `Result`? ¿Los errores son descriptivos?
- [ ] **Testing:** ¿Hay tests para el nuevo código? ¿Se cubren casos de borde (edge cases)?
- [ ] **Seguridad:** ¿Se validan los inputs con Zod? ¿Hay riesgo de inyección?

## 2. Etiquetas (Labels) Estandarizadas
- `feat`: Nueva funcionalidad.
- `fix`: Corrección de error.
- `refactor`: Cambio de código sin cambio de comportamiento.
- `docs`: Cambios en documentación.
- `breaking-change`: Requiere atención especial (ej: cambio en esquema de DB).

## 3. Proceso de PR
1. **Self-Review:** El autor debe revisar su propio código antes de pedir review.
2. **Atomic Commits:** Commits pequeños y con mensajes descriptivos.
3. **CI Green:** Ninguna PR se revisa si los tests o el build fallan.
4. **Approval:** Se requiere al menos 1 aprobación de un senior/owner.

## 4. Feedback Constructivo
- **Mal:** "Esto es una basura".
- **Bien:** "Creo que esta lógica encajaría mejor en el Dominio porque es una regla de negocio que se repetirá en otros casos de uso".
- **Sugerencias:** Usa el bloque de código de GitHub para sugerencias directas.

## 5. Automatización (MCP Skills)
- Agentes de IA pueden realizar el "Initial Pass" buscando violaciones de estas reglas antes de que un humano intervenga.
- Ver `.agentic-rules/coding-standards.md` para reglas automáticas.
