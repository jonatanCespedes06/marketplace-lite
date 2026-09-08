# Security: Defense in Depth

Seguridad desde la concepción (Privacy by Design). Mitigación proactiva de riesgos.

## 1. Input Validation (Primera Línea)
- Toda entrada de datos (HTTP Body, Params, Query) DEBE validarse con **Zod** antes de tocar cualquier capa interna.
- Sanitización de strings para prevenir XSS.

## 2. Authentication & Authorization
- **JWT:** Usar tokens firmados (RS256). No guardar información sensible en el payload.
- **Middleware de Auth:** Capa de infraestructura que inyecta el `UserContext` en el Use Case.
- **RBAC (Role Based Access Control):** Validar permisos a nivel de Aplicación, no solo de Ruta.

## 3. Database Security
- **Prepared Statements:** Uso obligatorio de ORMs o Query Builders que prevengan SQL Injection (Prisma/Kysely).
- **Least Privilege:** El usuario de la DB de la App no debe tener permisos de `DROP TABLE`.

## 4. Secrets Management
- **PROHIBIDO** commitear `.env`, claves API o certificados.
- Uso de `process.env` con validación Zod al arranque de la app.
- En producción: AWS Secrets Manager, HashiCorp Vault o similar.

## 5. OWASP Top 10 Mitigations
- **A01: Broken Access Control:** Verificación de ownership en cada update/delete.
- **A03: Injection:** Zod + Prepared Statements.
- **A07: Identification and Authentication Failures:** Rate limiting en login y renovación de tokens.

## 6. Security Headers
Implementación de **Helmet** en Express:
- Content-Security-Policy (CSP).
- HSTS.
- No-Sniff.

## 7. Audit Log
Eventos críticos (cambios de precio, eliminaciones, login fallidos) deben quedar registrados con:
- Timestamp.
- Actor (User ID).
- Acción.
- IP (con precaución por GDPR).
