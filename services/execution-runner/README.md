# Execution Runner — Sandbox de ejecución de código

> **Estado:** ⏳ Implementación en Fase 5

Este servicio ejecuta código de usuarios en contenedores Docker aislados con:

- Límites de CPU, memoria y tiempo
- Usuario sin privilegios dentro del contenedor
- Sin acceso al socket de Docker del host
- Red restringida por defecto
- Validación de rutas para prevenir path traversal
- Registro completo de ejecuciones

## Decisión técnica

El servicio de ejecución se implementa como un microservicio separado para:
1. Aislar completamente el código no confiable del proceso principal
2. Aplicar políticas de seguridad granulares
3. Escalar independientemente del API principal
4. Facilitar auditoría y cumplimiento

**Nota de seguridad:** El Docker socket NUNCA se monta en contenedores de ejecución.
Se usa la API HTTP de Docker con permisos mínimos.
