# DevPilot AI — Sandbox de Ejecución Aislada
# Entorno seguro y con privilegios mínimos para ejecutar código no confiable

FROM node:20-alpine

# Instalar dependencias esenciales y Python 3
RUN apk add --no-cache \
    python3 \
    py3-pip \
    bash \
    git \
    curl \
    su-exec

# Crear usuario sin privilegios 'devpilot'
RUN addgroup -g 1001 devpilot && \
    adduser -u 1001 -G devpilot -s /bin/bash -D devpilot

# Configurar directorio de trabajo
WORKDIR /workspace

# Ajustar permisos para el usuario sin privilegios
RUN chown -R devpilot:devpilot /workspace && \
    chmod 755 /workspace

# Variables de entorno predeterminadas
ENV NODE_ENV=development \
    PATH="/workspace/node_modules/.bin:$PATH" \
    HOME="/home/devpilot"

# Ejecutar como usuario sin privilegios
USER devpilot

# Punto de entrada predeterminado
CMD ["/bin/bash"]
