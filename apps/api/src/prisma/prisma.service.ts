import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: "event", level: "query" },
        { emit: "stdout", level: "info" },
        { emit: "stdout", level: "warn" },
        { emit: "stdout", level: "error" },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("✅ Conectado a PostgreSQL");
    } catch (error: any) {
      this.logger.warn(`⚠️ PostgreSQL no disponible (${error?.message}). Operando con almacenamiento en memoria.`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Desconectado de PostgreSQL");
  }
}
