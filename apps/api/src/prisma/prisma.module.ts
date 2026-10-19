import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/**
 * Módulo global de Prisma — disponible en toda la aplicación sin importar
 * explícitamente en cada módulo.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
