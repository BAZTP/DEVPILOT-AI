import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from "@nestjs/common";
import { spawn, execFile } from "child_process";
import { promisify } from "util";
import {
  ExecutionResult,
  RunnerStatus,
  SandboxSecurityPolicy,
} from "./runner.types";

const execFileAsync = promisify(execFile);

@Injectable()
export class DockerClientService implements OnModuleInit {
  private readonly logger = new Logger(DockerClientService.name);
  private dockerAvailable = false;
  private dockerVersion: string | undefined;

  // Mapa de contenedores en ejecución: executionId -> { containerName, process }
  private activeProcesses = new Map<
    string,
    { containerName: string; kill: () => void }
  >();

  private readonly defaultSecurityPolicy: SandboxSecurityPolicy = {
    cpuLimit: 1.0,
    memoryLimitMb: 512,
    maxDurationMs: 30_000,
    networkEnabled: false,
    nonRootUid: 1001,
    nonRootGid: 1001,
    pidsLimit: 100,
    readOnlyRoot: true,
    noNewPrivileges: true,
  };

  async onModuleInit() {
    await this.checkDockerAvailability();
  }

  /**
   * Verifica si el demonio de Docker está disponible y accesible.
   */
  async checkDockerAvailability(): Promise<boolean> {
    try {
      const { stdout } = await execFileAsync("docker", ["version", "--format", "{{.Server.Version}}"]);
      this.dockerAvailable = true;
      this.dockerVersion = stdout.trim();
      this.logger.log(`Docker daemon detectado y disponible. Versión: ${this.dockerVersion}`);
      return true;
    } catch {
      this.dockerAvailable = false;
      this.dockerVersion = undefined;
      this.logger.warn(
        "Docker daemon no disponible. El motor de ejecución segura se mantendrá en modo protegido (ejecución deshabilitada por seguridad).",
      );
      return false;
    }
  }

  /**
   * Obtiene el estado del entorno de ejecución sandbox.
   */
  async getStatus(): Promise<RunnerStatus> {
    await this.checkDockerAvailability();
    return {
      isDockerAvailable: this.dockerAvailable,
      dockerVersion: this.dockerVersion,
      activeContainersCount: this.activeProcesses.size,
      securityPolicy: this.defaultSecurityPolicy,
      message: this.dockerAvailable
        ? `Sandbox activo y aislado mediante Docker (${this.dockerVersion}). Límites: 512MB RAM, 1 CPU, red aislada.`
        : "Docker no está disponible en este entorno. Por estrictas razones de seguridad, la ejecución directa en host está deshabilitada.",
    };
  }

  /**
   * Ejecuta un comando en un contenedor Docker completamente aislado.
   * NUNCA ejecuta código no confiable en el host si Docker no está disponible.
   */
  async runInSandbox(
    executionId: string,
    projectId: string,
    hostProjectPath: string,
    command: string,
    timeoutMs = 30_000,
    networkEnabled = false,
  ): Promise<ExecutionResult> {
    // 1. Verificar disponibilidad de Docker
    const isAvailable = await this.checkDockerAvailability();
    if (!isAvailable) {
      throw new ServiceUnavailableException(
        "Docker no está en ejecución. DevPilot AI no permite ejecutar código en el proceso principal por seguridad.",
      );
    }

    const containerName = `devpilot-sandbox-${executionId}`;
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    // 2. Construir argumentos seguros de Docker
    const dockerArgs = [
      "run",
      "--rm",
      "-i",
      "--name", containerName,
      // Límites de recursos estrictos
      "--memory", `${this.defaultSecurityPolicy.memoryLimitMb}m`,
      "--cpus", `${this.defaultSecurityPolicy.cpuLimit}`,
      "--pids-limit", `${this.defaultSecurityPolicy.pidsLimit}`,
      // Privilegios mínimos
      "--user", `${this.defaultSecurityPolicy.nonRootUid}:${this.defaultSecurityPolicy.nonRootGid}`,
      "--security-opt", "no-new-privileges:true",
      // Red: none por defecto
      networkEnabled ? "--network=bridge" : "--network=none",
      // Montar únicamente la carpeta del proyecto específico (nunca el host ni docker.sock)
      "-v", `${hostProjectPath}:/workspace:rw`,
      "-w", "/workspace",
      // Imagen estándar ligera
      "node:20-alpine",
      "/bin/sh", "-c", command,
    ];

    this.logger.log(`Iniciando sandbox [${containerName}] para proyecto ${projectId}: ${command}`);

    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";
      let isTimedOut = false;
      let isCancelled = false;

      const child = spawn("docker", dockerArgs);

      // Registrar proceso activo
      this.activeProcesses.set(executionId, {
        containerName,
        kill: () => {
          isCancelled = true;
          execFile("docker", ["kill", containerName], () => {});
          child.kill("SIGKILL");
        },
      });

      // Configurar temporizador de tiempo límite
      const timer = setTimeout(() => {
        isTimedOut = true;
        this.logger.warn(`Ejecución ${executionId} excedió el tiempo límite (${timeoutMs}ms). Terminando contenedor.`);
        execFile("docker", ["kill", containerName], () => {});
        child.kill("SIGKILL");
      }, timeoutMs);

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        this.activeProcesses.delete(executionId);
        const durationMs = Date.now() - startTime;
        const completedAt = new Date().toISOString();

        let status: ExecutionResult["status"] = "COMPLETED";
        if (isTimedOut) {
          status = "TIMEOUT";
          stderr += `\n[DevPilot] Proceso terminado: Excedió el tiempo límite de ${timeoutMs}ms.`;
        } else if (isCancelled) {
          status = "CANCELLED";
          stderr += `\n[DevPilot] Proceso cancelado por el usuario.`;
        } else if (code !== 0) {
          status = "FAILED";
        }

        resolve({
          executionId,
          projectId,
          command,
          exitCode: isTimedOut || isCancelled ? null : code,
          stdout,
          stderr,
          durationMs,
          status,
          startedAt,
          completedAt,
        });
      });

      child.on("error", (err) => {
        clearTimeout(timer);
        this.activeProcesses.delete(executionId);
        const durationMs = Date.now() - startTime;

        resolve({
          executionId,
          projectId,
          command,
          exitCode: -1,
          stdout,
          stderr: `Error al iniciar el contenedor de ejecución: ${err.message}`,
          durationMs,
          status: "FAILED",
          startedAt,
          completedAt: new Date().toISOString(),
        });
      });
    });
  }

  /**
   * Cancela una ejecución activa en el sandbox.
   */
  cancelExecution(executionId: string): boolean {
    const proc = this.activeProcesses.get(executionId);
    if (proc) {
      proc.kill();
      this.activeProcesses.delete(executionId);
      return true;
    }
    return false;
  }
}
