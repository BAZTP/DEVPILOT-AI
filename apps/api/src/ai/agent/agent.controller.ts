import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { AgentSupervisorService } from "./agent-supervisor.service";
import { StartAgentDto, ApproveStepDto } from "./dto/start-agent.dto";
import { AgentEventMessage } from "./agent.types";

@Controller("agent")
export class AgentController {
  private readonly logger = new Logger(AgentController.name);

  constructor(private readonly agentSupervisor: AgentSupervisorService) {}

  /**
   * Inicia una misión de agente supervisado.
   */
  @Post("start")
  @HttpCode(HttpStatus.CREATED)
  async startAgent(@Body() dto: StartAgentDto) {
    return this.agentSupervisor.startTask(dto);
  }

  /**
   * Obtiene la lista de tareas de agente para un proyecto.
   */
  @Get("tasks/:projectId")
  async getTasksForProject(@Param("projectId") projectId: string) {
    return this.agentSupervisor.getTasksForProject(projectId);
  }

  /**
   * Obtiene el estado actual y los pasos de una tarea específica.
   */
  @Get("task/:taskId")
  async getTask(@Param("taskId") taskId: string) {
    return this.agentSupervisor.getTask(taskId);
  }

  /**
   * Aprueba un paso pausado esperando autorización humana.
   */
  @Post("approve-step/:taskId/:stepId")
  @HttpCode(HttpStatus.OK)
  async approveStep(
    @Param("taskId") taskId: string,
    @Param("stepId") stepId: string,
    @Body() dto: ApproveStepDto,
  ) {
    return this.agentSupervisor.resolveStepApproval(
      taskId,
      stepId,
      dto.approved,
      dto.reason,
    );
  }

  /**
   * Rechaza un paso pausado esperando autorización humana.
   */
  @Post("reject-step/:taskId/:stepId")
  @HttpCode(HttpStatus.OK)
  async rejectStep(
    @Param("taskId") taskId: string,
    @Param("stepId") stepId: string,
    @Body() dto: ApproveStepDto,
  ) {
    return this.agentSupervisor.resolveStepApproval(
      taskId,
      stepId,
      false,
      dto.reason,
    );
  }

  /**
   * Cancela la ejecución de una tarea activa.
   */
  @Post("cancel/:taskId")
  @HttpCode(HttpStatus.OK)
  async cancelTask(@Param("taskId") taskId: string) {
    return this.agentSupervisor.cancelTask(taskId);
  }

  /**
   * Stream Server-Sent Events (SSE) para el seguimiento en tiempo real del progreso del agente.
   */
  @Get("stream/:taskId")
  streamAgentEvents(
    @Param("taskId") taskId: string,
    @Res() res: Response,
  ): void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Enviar estado inicial de la tarea si existe
    try {
      const task = this.agentSupervisor.getTask(taskId);
      res.write(`data: ${JSON.stringify({ type: "initial_state", data: task })}\n\n`);
    } catch {
      // Si la tarea aún no está en el mapa, esperamos los eventos
    }

    const unsubscribe = this.agentSupervisor.subscribe(
      taskId,
      (event: AgentEventMessage) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
        if (
          event.type === "task_completed" ||
          event.type === "task_cancelled"
        ) {
          res.end();
        }
      },
    );

    res.on("close", () => {
      unsubscribe();
    });
  }
}
