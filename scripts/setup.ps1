#!/usr/bin/env pwsh
# =============================================================================
# DevPilot AI — Script de configuración inicial
# Uso: .\scripts\setup.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║          DevPilot AI — Setup Inicial          ║" -ForegroundColor Blue
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# ── Verificar herramientas ────────────────────────────────────────────────────

function Check-Tool {
  param($Name, $Command, $MinVersion)
  try {
    $version = Invoke-Expression "$Command --version 2>&1" | Select-Object -First 1
    Write-Host "  ✅ $Name: $version" -ForegroundColor Green
    return $true
  } catch {
    Write-Host "  ❌ $Name: No encontrado" -ForegroundColor Red
    return $false
  }
}

Write-Host "Verificando herramientas..." -ForegroundColor Cyan
$node = Check-Tool "Node.js" "node" "20"
$pnpm = Check-Tool "pnpm" "pnpm" "9"
$docker = Check-Tool "Docker" "docker" "24"
$git = Check-Tool "Git" "git" "2"

if (-not $node -or -not $pnpm) {
  Write-Host ""
  Write-Host "Error: Node.js y pnpm son requeridos." -ForegroundColor Red
  Write-Host "  - Node.js: https://nodejs.org/" -ForegroundColor Yellow
  Write-Host "  - pnpm: npm install -g pnpm" -ForegroundColor Yellow
  exit 1
}

# ── Variables de entorno ──────────────────────────────────────────────────────

if (-not (Test-Path ".env")) {
  Write-Host ""
  Write-Host "Creando archivo .env desde .env.example..." -ForegroundColor Cyan
  Copy-Item ".env.example" ".env"
  Write-Host "  ✅ .env creado" -ForegroundColor Green
  Write-Host "  ⚠️  Edita .env con tus valores reales antes de continuar" -ForegroundColor Yellow
} else {
  Write-Host "  ✅ .env ya existe" -ForegroundColor Green
}

# ── Instalar dependencias ─────────────────────────────────────────────────────

Write-Host ""
Write-Host "Instalando dependencias..." -ForegroundColor Cyan
pnpm install
Write-Host "  ✅ Dependencias instaladas" -ForegroundColor Green

# ── Docker ────────────────────────────────────────────────────────────────────

if ($docker) {
  Write-Host ""
  Write-Host "Iniciando servicios Docker (PostgreSQL + Redis)..." -ForegroundColor Cyan
  docker compose up -d postgres redis
  Write-Host "  ✅ Servicios iniciados" -ForegroundColor Green
  
  # Esperar a que PostgreSQL esté listo
  Write-Host "  Esperando que PostgreSQL esté listo..." -ForegroundColor Yellow
  Start-Sleep -Seconds 5
} else {
  Write-Host ""
  Write-Host "  ⚠️  Docker no disponible. Asegúrate de tener PostgreSQL corriendo manualmente." -ForegroundColor Yellow
}

# ── Base de datos ─────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "Configurando base de datos..." -ForegroundColor Cyan
pnpm db:generate
Write-Host "  ✅ Cliente Prisma generado" -ForegroundColor Green

try {
  pnpm db:migrate
  Write-Host "  ✅ Migraciones ejecutadas" -ForegroundColor Green
} catch {
  Write-Host "  ⚠️  Error en migraciones. Verifica que PostgreSQL esté corriendo y el DATABASE_URL sea correcto." -ForegroundColor Yellow
}

# ── Resumen ───────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           Setup completado con éxito          ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el proyecto en modo desarrollo:" -ForegroundColor Cyan
Write-Host "  pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "URLs disponibles:" -ForegroundColor Cyan
Write-Host "  🌐 Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  🔌 API:       http://localhost:3001" -ForegroundColor White
Write-Host "  📚 Swagger:   http://localhost:3001/api/docs" -ForegroundColor White
Write-Host ""
