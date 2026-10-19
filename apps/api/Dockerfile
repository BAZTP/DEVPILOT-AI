# ─── Stage 1: Dependencias base ───────────────────────────────────────────────
FROM node:22-alpine AS base
RUN npm install -g pnpm@9.15.0
WORKDIR /app

# ─── Stage 2: Dependencias ────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY prisma/package.json ./prisma/

RUN pnpm install --frozen-lockfile --filter @devpilot/api... 2>/dev/null || \
    pnpm install --filter @devpilot/api...

# ─── Stage 3: Desarrollo (hot reload) ─────────────────────────────────────────
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .

WORKDIR /app/apps/api

# Generar cliente Prisma
RUN cd /app && npx prisma generate 2>/dev/null || true

EXPOSE 3001

# Usar ts-node para desarrollo con hot reload
CMD ["node", "-e", "require('@nestjs/cli')", "--", "start", "--watch"] 

# ─── Stage 4: Build de producción ─────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .

WORKDIR /app
RUN npx prisma generate
RUN pnpm --filter @devpilot/api run build

# ─── Stage 5: Producción ──────────────────────────────────────────────────────
FROM node:22-alpine AS production
RUN npm install -g pnpm@9.15.0
WORKDIR /app

# Usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./

USER nestjs

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/main"]
