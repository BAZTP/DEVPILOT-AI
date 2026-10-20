import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { RunnerService } from "./runner.service";

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/terminal",
})
export class TerminalGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(TerminalGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly runnerService: RunnerService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado a terminal WebSocket: ${client.id}`);
    this.runnerService.getStatus().then((status) => {
      client.emit("terminal:status", status);
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado de terminal: ${client.id}`);
  }

  @SubscribeMessage("terminal:command")
  async handleCommand(
    @MessageBody() data: { projectId: string; command: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { projectId, command } = data;
    if (!command || !command.trim()) return;

    this.logger.log(`Terminal WebSocket [${client.id}] ejecutando: ${command}`);

    try {
      client.emit("terminal:output", { type: "info", data: `\r\n\x1b[36m[DevPilot Sandbox]\x1b[0m Iniciando: ${command}\r\n` });
      
      const result = await this.runnerService.execute({
        projectId: projectId || "devpilot-demo-app",
        command: command.trim(),
      });

      if (result.stdout) {
        client.emit("terminal:output", { type: "stdout", data: result.stdout });
      }
      if (result.stderr) {
        client.emit("terminal:output", { type: "stderr", data: result.stderr });
      }

      const color = result.exitCode === 0 ? "\x1b[32m" : "\x1b[31m";
      client.emit("terminal:output", {
        type: "exit",
        data: `\r\n${color}[Proceso finalizado con código ${result.exitCode} en ${result.durationMs}ms]\x1b[0m\r\n$ `,
      });
    } catch (err: any) {
      client.emit("terminal:output", {
        type: "error",
        data: `\r\n\x1b[33m[DevPilot Sandbox]\x1b[0m ${err.message}\r\n$ `,
      });
    }
  }

  @SubscribeMessage("terminal:get_status")
  async handleGetStatus(@ConnectedSocket() client: Socket) {
    const status = await this.runnerService.getStatus();
    client.emit("terminal:status", status);
  }
}
