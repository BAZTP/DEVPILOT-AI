export type AgentModeType = "CHAT" | "PLAN" | "EDIT" | "AGENT";

export type AgentTaskStatusType =
  | "PENDING"
  | "RUNNING"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type AgentStepStatusType =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED"
  | "AWAITING_APPROVAL";

export interface AgentStepPlan {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  toolName:
    | "analyze_workspace"
    | "read_file"
    | "propose_diff"
    | "apply_diff"
    | "execute_sandbox"
    | "generate_summary";
  toolInput?: Record<string, any> | undefined;
  requiresApproval: boolean;
  approvalReason?: string | undefined;
  status: AgentStepStatusType;
  output?: any | undefined;
  error?: string | undefined;
  startedAt?: string | undefined;
  completedAt?: string | undefined;
}

export interface AgentTaskData {
  id: string;
  projectId: string;
  title: string;
  objective: string;
  mode: AgentModeType;
  status: AgentTaskStatusType;
  steps: AgentStepPlan[];
  currentStepIndex: number;
  summary?: string | undefined;
  errorMessage?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface AgentEventMessage {
  type:
    | "task_started"
    | "plan_generated"
    | "step_started"
    | "step_awaiting_approval"
    | "step_approved"
    | "step_rejected"
    | "step_completed"
    | "step_failed"
    | "sandbox_output"
    | "task_completed"
    | "task_cancelled"
    | "error";
  taskId: string;
  stepId?: string | undefined;
  data?: any | undefined;
  message?: string | undefined;
  timestamp: string;
}
