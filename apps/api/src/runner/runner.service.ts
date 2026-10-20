import {
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { DockerClientService } from "./docker-client.service";
import { ProjectsService } from "../projects/projects.service";
import { PrismaService } from "../prisma/prisma.service";
import { ExecuteCommandDto } from "./dto/execute-command.dto";
import { ExecutionResult, RunnerStatus } from "./runner.types";

@Injectable()
export class RunnerService {
  private readonly logger = new Logger(RunnerService.name);

  // Registro en memoria para cuando Prisma no esté conectado
  private memoryExecutionLogs = new Map<string, ExecutionResult>();

  constructor(
    private readonly dockerClient: DockerClientService,
    private readonly projectsService: ProjectsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Obtiene el estado del runner y del contenedor Docker.
   */
  async getStatus(): Promise<RunnerStatus> {
    return this.dockerClient.getStatus();
  }

  /**
   * Ejecuta un comando en el sandbox aislado.
   */
  async execute(dto: ExecuteCommandDto, userId = "system"): Promise<ExecutionResult> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Validar y resolver la ruta canónica del proyecto
    const manager = this.projectsService.getWorkspaceManager();
    const safeProjectPath = manager.getProjectDirectory(dto.projectId);

    // 2. Ejecutar en sandbox Docker aislado
    const result = await this.dockerClient.runInSandbox(
      executionId,
      dto.projectId,
      safeProjectPath,
      dto.command,
      dto.timeoutMs || 30_000,
      dto.networkEnabled || false,
    );

    // 3. Registrar auditoría y logs de ejecución
    this.memoryExecutionLogs.set(executionId, result);

    try {
      await this.prisma.executionLog.create({
        data: {
          id: executionId,
          projectId: dto.projectId,
          command: dto.command,
          status: result.status,
          exitCode: result.exitCode,
          stdout: result.stdout.slice(0, 50_000), // Limitar a 50KB para BD
          stderr: result.stderr.slice(0, 50_000),
          durationMs: result.durationMs,
        },
      });

      await this.prisma.auditLog.create({
        data: {
          userId,
          action: "EXECUTE_SANDBOX_COMMAND",
          resource: `project:${dto.projectId}`,
          metadata: {
            command: dto.command,
            status: result.status,
            durationMs: result.durationMs,
          },
        },
      });
    } catch {
      this.logger.warn(`Prisma no disponible para persistir log de ejecución ${executionId}. Guardado en memoria.`);
    }

    return result;
  }

  /**
   * Cancela una ejecución en curso.
   */
  cancel(executionId: string): { cancelled: boolean } {
    const cancelled = this.dockerClient.cancelExecution(executionId);
    return { cancelled };
  }

  /**
   * Obtiene el registro de una ejecución anterior.
   */
  async getExecutionLog(executionId: string): Promise<ExecutionResult> {
    const mem = this.memoryExecutionLogs.get(executionId);
    if (mem) return mem;

    try {
      const dbLog = await this.prisma.executionLog.findUnique({
        where: { id: executionId },
      });

      if (!dbLog) {
        throw new NotFoundException(`Registro de ejecución '${executionId}' no encontrado.`);
      }

      return {
        executionId: dbLog.id,
        projectId: dbLog.projectId,
        command: dbLog.command,
        exitCode: dbLog.exitCode,
        stdout: dbLog.stdout,
        stderr: dbLog.stderr,
        durationMs: dbLog.durationMs || 0,
        status: dbLog.status as any,
        startedAt: dbLog.startedAt.toISOString(),
        completedAt: dbLog.completedAt?.toISOString() || new Date().toISOString(),
      };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new NotFoundException(`Registro de ejecución '${executionId}' no encontrado.`);
    }
  }
}
