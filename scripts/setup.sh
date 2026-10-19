#!/bin/bash
# =============================================================================
# DevPilot AI — Script de configuración inicial (Linux/macOS)
# Uso: bash scripts/setup.sh
# =============================================================================

set -e

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║          DevPilot AI — Setup Inicial          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

check_tool() {
  if command -v "$1" &>/dev/null; then
    echo -e "  ${GREEN}✅ $1: $(${1} --version 2>&1 | head -1)${NC}"
    return 0
  else
    echo -e "  ${RED}❌ $1: No encontrado${NC}"
    return 1
  fi
}

echo -e "${CYAN}Verificando herramientas...${NC}"
check_tool node || { echo -e "${RED}Node.js requerido: https://nodejs.org/${NC}"; exit 1; }
check_tool pnpm || { echo -e "${RED}pnpm requerido: npm install -g pnpm${NC}"; exit 1; }
check_tool docker || echo -e "${YELLOW}  ⚠️  Docker no encontrado - ejecución de código deshabilitada${NC}"
check_tool git

# Variables de entorno
if [ ! -f ".env" ]; then
  echo ""
  echo -e "${CYAN}Creando archivo .env desde .env.example...${NC}"
  cp .env.example .env
  echo -e "  ${GREEN}✅ .env creado${NC}"
  echo -e "  ${YELLOW}⚠️  Edita .env con tus valores reales${NC}"
else
  echo -e "  ${GREEN}✅ .env ya existe${NC}"
fi

# Dependencias
echo ""
echo -e "${CYAN}Instalando dependencias...${NC}"
pnpm install
echo -e "  ${GREEN}✅ Dependencias instaladas${NC}"

# Docker
if command -v docker &>/dev/null; then
  echo ""
  echo -e "${CYAN}Iniciando servicios Docker...${NC}"
  docker compose up -d postgres redis
  echo -e "  ${GREEN}✅ PostgreSQL y Redis iniciados${NC}"
  sleep 5
fi

# Base de datos
echo ""
echo -e "${CYAN}Configurando base de datos...${NC}"
pnpm db:generate
echo -e "  ${GREEN}✅ Cliente Prisma generado${NC}"

pnpm db:migrate 2>/dev/null && \
  echo -e "  ${GREEN}✅ Migraciones ejecutadas${NC}" || \
  echo -e "  ${YELLOW}⚠️  Error en migraciones. Verifica DATABASE_URL en .env${NC}"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗"
echo -e "║           Setup completado con éxito          ║"
echo -e "╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Para iniciar:${NC} pnpm dev"
echo ""
echo -e "  🌐 Frontend:  http://localhost:3000"
echo -e "  🔌 API:       http://localhost:3001"
echo -e "  📚 Swagger:   http://localhost:3001/api/docs"
echo ""
