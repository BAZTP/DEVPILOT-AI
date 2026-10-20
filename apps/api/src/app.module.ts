import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ProjectsModule } from "./projects/projects.module";
import { FilesModule } from "./files/files.module";
import { AiModule } from "./ai/ai.module";
import { RunnerModule } from "./runner/runner.module";
import { HealthModule } from "./health/health.module";
import configuration from "./config/configuration";

@Module({
  imports: [
    // ── Configuración global ────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [".env.local", ".env"],
      cache: true,
    }),

    // ── Rate limiting global ────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000,      // 1 segundo
        limit: 20,      // máx 20 req/s
      },
      {
        name: "medium",
        ttl: 60_000,    // 1 minuto
        limit: 200,     // máx 200 req/min
      },
      {
        name: "long",
        ttl: 3_600_000, // 1 hora
        limit: 2_000,   // máx 2000 req/h
      },
    ]),

    // ── Módulos de la aplicación ────────────────────────────────────────────
    PrismaModule,
    AuthModule,
    ProjectsModule,
    FilesModule,
    AiModule,
    RunnerModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
