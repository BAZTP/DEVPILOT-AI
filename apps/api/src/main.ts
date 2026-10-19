import { NestFactory } from "@nestjs/core";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug"],
  });

  const config = app.get(ConfigService);

  // ── Seguridad HTTP ──────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: false, // Se configura en el proxy/frontend
      crossOriginEmbedderPolicy: false,
    })
  );

  // ── CORS ───────────────────────────────────────────────────────────────────
  const corsOrigin = config.get<string>("CORS_ORIGIN", "http://localhost:3000");
  app.enableCors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  // ── Versionado de API ──────────────────────────────────────────────────────
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // ── Prefijo global ─────────────────────────────────────────────────────────
  app.setGlobalPrefix("api");

  // ── Validación global ──────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // Rechaza requests con propiedades desconocidas
      transform: true,          // Convierte tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // ── Swagger / OpenAPI ──────────────────────────────────────────────────────
  if (config.get("NODE_ENV") !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("DevPilot AI API")
      .setDescription(
        "API REST del entorno de desarrollo inteligente DevPilot AI"
      )
      .setVersion("1.0")
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        "JWT"
      )
      .addTag("auth", "Autenticación y sesiones")
      .addTag("projects", "Gestión de proyectos")
      .addTag("files", "Sistema de archivos")
      .addTag("ai", "Asistente de inteligencia artificial")
      .addTag("git", "Integración Git/GitHub")
      .addTag("execution", "Ejecución de código")
      .addTag("health", "Estado del sistema")
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // ── Iniciar servidor ───────────────────────────────────────────────────────
  const port = config.get<number>("API_PORT", 3001);
  const host = config.get<string>("API_HOST", "0.0.0.0");

  await app.listen(port, host);

  console.log(
    `\n🚀 DevPilot AI API corriendo en http://${host === "0.0.0.0" ? "localhost" : host}:${port}`
  );
  console.log(
    `📚 Swagger disponible en http://localhost:${port}/api/docs`
  );
  console.log(`🌍 Entorno: ${config.get("NODE_ENV", "development")}\n`);
}

void bootstrap();
