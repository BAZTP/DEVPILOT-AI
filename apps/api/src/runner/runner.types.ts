export type ExecutionStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "TIMEOUT"
  | "CANCELLED";

export interface SandboxSecurityPolicy {
  cpuLimit: number;          // e.g. 1.0 (1 core)
  memoryLimitMb: number;     // e.g. 512 MB
  maxDurationMs: number;     // e.g. 30,000 ms (30 segundos)
  networkEnabled: boolean;   // false por defecto
  nonRootUid: number;        // 1001
  nonRootGid: number;        // 1001
  pidsLimit: number;         // 100 procesos concurrentes máximo
  readOnlyRoot: boolean;     // true
  noNewPrivileges: boolean;  // true
}

export interface ExecutionResult {
  executionId: string;
  projectId: string;
  command: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  status: ExecutionStatus;
  startedAt: string;
  completedAt: string;
}

export interface RunnerStatus {
  isDockerAvailable: boolean;
  dockerVersion?: string | undefined;
  activeContainersCount: number;
  securityPolicy: SandboxSecurityPolicy;
  message: string;
}
