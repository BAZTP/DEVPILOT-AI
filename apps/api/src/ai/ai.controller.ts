import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { Response } from "express";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AiService } from "./ai.service";
import { ChatRequestDto } from "./dto/chat-request.dto";
import { SaveKeyDto, ApplyProposalDto } from "./dto/config-key.dto";

@ApiTags("ai")
@Controller("v1/ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("chat/stream")
  @ApiOperation({ summary: "Streaming en tiempo real del asistente IA mediante SSE" })
  @ApiResponse({ status: 200, description: "Stream de eventos Server-Sent Events" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async streamChat(
    @Body() dto: ChatRequestDto,
    @Res() res: Response,
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    try {
      for await (const chunk of this.aiService.streamChat(dto)) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ type: "error", content: err.message })}\n\n`);
    } finally {
      res.end();
    }
  }

  @Post("chat")
  @ApiOperation({ summary: "Consulta síncrona al asistente IA" })
  @ApiResponse({ status: 200, description: "Respuesta estructurada del modelo" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async chat(@Body() dto: ChatRequestDto) {
    return this.aiService.chat(dto);
  }

  @Post("tools/apply")
  @ApiOperation({ summary: "Aplica una propuesta de diff autorizada por el usuario en disco" })
  @ApiResponse({ status: 200, description: "Resultado de la aplicación del cambio" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async applyProposal(@Body() dto: ApplyProposalDto) {
    return this.aiService.applyProposal(dto.projectId, dto.proposalId);
  }

  @Post("config")
  @ApiOperation({ summary: "Guarda de forma segura una API key cifrada para un proveedor" })
  @ApiResponse({ status: 200, description: "Configuración almacenada con éxito" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async saveConfig(@Body() dto: SaveKeyDto) {
    return this.aiService.saveApiKey(dto);
  }

  @Get("providers")
  @ApiOperation({ summary: "Lista los proveedores de IA disponibles y su estado de configuración" })
  @ApiResponse({ status: 200, description: "Lista de proveedores y disponibilidad" })
  async getProviders() {
    return this.aiService.listProviders();
  }
}
