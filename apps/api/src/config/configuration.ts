/**
 * Configuración centralizada de la aplicación.
 * Todas las variables de entorno se cargan y validan aquí.
 * Nunca uses process.env directamente fuera de este archivo.
 */
export default () => ({
  nodeEnv: process.env["NODE_ENV"] ?? "development",
  port: parseInt(process.env["API_PORT"] ?? "3001", 10),
  host: process.env["API_HOST"] ?? "0.0.0.0",

  database: {
    url: process.env["DATABASE_URL"],
  },

  jwt: {
    secret: process.env["JWT_SECRET"],
    expiresIn: process.env["JWT_EXPIRES_IN"] ?? "7d",
    refreshSecret: process.env["REFRESH_TOKEN_SECRET"],
    refreshExpiresIn: process.env["REFRESH_TOKEN_EXPIRES_IN"] ?? "30d",
  },

  github: {
    clientId: process.env["GITHUB_CLIENT_ID"],
    clientSecret: process.env["GITHUB_CLIENT_SECRET"],
    callbackUrl:
      process.env["GITHUB_CALLBACK_URL"] ??
      "http://localhost:3001/auth/github/callback",
  },

  workspace: {
    basePath: process.env["WORKSPACE_BASE_PATH"] ?? "/tmp/devpilot-workspace",
  },

  encryption: {
    key: process.env["ENCRYPTION_KEY"],
  },

  cors: {
    origin: process.env["CORS_ORIGIN"] ?? "http://localhost:3000",
  },

  execution: {
    dockerEnabled: process.env["DOCKER_ENABLED"] === "true",
    timeoutSeconds: parseInt(process.env["EXECUTION_TIMEOUT_SECONDS"] ?? "30", 10),
    memoryLimit: process.env["EXECUTION_MEMORY_LIMIT"] ?? "128m",
    cpuLimit: parseFloat(process.env["EXECUTION_CPU_LIMIT"] ?? "0.5"),
  },

  rateLimit: {
    ttl: parseInt(process.env["RATE_LIMIT_TTL"] ?? "60", 10),
    max: parseInt(process.env["RATE_LIMIT_MAX"] ?? "100", 10),
  },
});
