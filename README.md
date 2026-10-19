<p align="center">
  <img src="docs/assets/logo.png" alt="DevPilot AI" width="80" />
</p>

<h1 align="center">DevPilot AI</h1>

<p align="center">
  Entorno de desarrollo integrado con inteligencia artificial.<br/>
  Crea proyectos, edita código y trabaja con IA de forma supervisada y segura.
</p>

<p align="center">
  <img alt="Versión" src="https://img.shields.io/badge/versión-0.1.0_MVP-blue" />
  <img alt="Fase" src="https://img.shields.io/badge/fase-1%2F8-orange" />
  <img alt="Licencia" src="https://img.shields.io/badge/licencia-MIT-green" />
  <img alt="Node" src="https://img.shields.io/badge/Node-22+-brightgreen" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5_strict-blue" />
</p>

---

## 🚀 Inicio rápido

### Requisitos previos

| Herramienta | Versión mínima | Uso |
|-------------|---------------|-----|
| Node.js | 20.x | Ejecución del proyecto |
| pnpm | 9.x | Gestor de paquetes |
| Docker | 24.x | Base de datos y servicios |
| Git | 2.x | Control de versiones |

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/BAZTP/DEVPILOT-AI.git
cd DEVPILOT-AI

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores reales

# 3. Instalar dependencias
pnpm install

# 4. Levantar servicios (PostgreSQL + Redis)
docker compose up -d postgres redis

# 5. Generar cliente Prisma y ejecutar migraciones
pnpm db:generate
pnpm db:migrate

# 6. Iniciar en modo desarrollo
pnpm dev
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Swagger**: http://localhost:3001/api/docs

---

## 🏗️ Arquitectura del monorepo

```
devpilot-ai/
├── apps/
│   ├── web/          # Next.js 15 + React 19 (puerto 3000)
│   └── api/          # NestJS 10 (puerto 3001)
├── packages/
│   ├── shared/       # Tipos y utilidades compartidas
│   ├── ui/           # Componentes UI reutilizables
│   ├── ai-core/      # Motor de IA (Fase 4)
│   ├── workspace-core/ # Gestión de archivos (Fase 3)
│   └── git-core/     # Integración Git (Fase 6)
├── services/
│   └── execution-runner/ # Sandbox de ejecución Docker (Fase 5)
├── prisma/           # Schema y migraciones de BD
├── docker/           # Configuración Docker auxiliar
├── docs/             # Documentación
├── tests/            # Pruebas de integración E2E
└── scripts/          # Scripts de utilidad
```

---

## 📋 Fases de desarrollo

| Fase | Nombre | Estado |
|------|--------|--------|
| ✅ **1** | Arquitectura y configuración | **Completada** |
| 🔄 **2** | Interfaz profesional (IDE layout) | Siguiente |
| ⏳ **3** | Gestión real de proyectos y archivos | Pendiente |
| ⏳ **4** | Inteligencia artificial | Pendiente |
| ⏳ **5** | Ejecución y pruebas en sandbox | Pendiente |
| ⏳ **6** | Git y GitHub | Pendiente |
| ⏳ **7** | Agente supervisado | Pendiente |
| ⏳ **8** | Calidad, seguridad y distribución | Pendiente |

---

## 🔧 Stack tecnológico

### Frontend
- **Next.js 15** con App Router
- **React 19** con TypeScript estricto
- **Tailwind CSS** con tema oscuro personalizado
- **Monaco Editor** (mismo motor que VS Code)
- **Zustand** para estado global
- **TanStack Query** para peticiones remotas

### Backend
- **NestJS 10** con TypeScript estricto
- **API REST** con versionado (`/api/v1/`)
- **WebSockets** con Socket.IO
- **OpenAPI/Swagger** automático
- **Rate limiting** multinivel

### Base de datos
- **PostgreSQL 16**
- **Prisma 5** ORM con migraciones versionadas
- **Redis** para sesiones y caché

### Seguridad
- JWT con refresh tokens
- Bcrypt para contraseñas
- Cifrado AES para API keys de IA
- Validación de DTOs con class-validator
- Rate limiting con @nestjs/throttler
- Auditoría de acciones
- Prevención de path traversal
- Docker socket NO montado en contenedores de ejecución

---

## 🔒 Seguridad

- **Nunca** hay claves API reales en el repositorio
- Las API keys de usuarios se almacenan cifradas en la base de datos
- Los tokens de GitHub se almacenan cifrados, nunca en texto plano
- El frontend nunca recibe tokens de acceso directamente
- La ejecución de código ocurre en contenedores Docker aislados
- Los archivos del workspace están restringidos a rutas autorizadas

---

## 📚 Documentación adicional

- [Guía de instalación](docs/INSTALL.md)
- [Arquitectura detallada](docs/ARCHITECTURE.md)
- [Decisiones técnicas](docs/DECISIONS.md)
- [API Reference](http://localhost:3001/api/docs) (en desarrollo)

---

## 🤝 Contribuir

Este proyecto está en desarrollo activo. Las contribuciones son bienvenidas después de la Fase 2.

---

## 📄 Licencia

MIT © 2024 DevPilot AI Team
