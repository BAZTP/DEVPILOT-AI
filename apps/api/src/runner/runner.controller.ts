import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RunnerService } from "./runner.service";
import { ExecuteCommandDto } from "./dto/execute-command.dto";

@ApiTags("runner")
@Controller("v1/runner")
export class RunnerController {
  constructor(private readonly runnerService: RunnerService) {}

  @Get("status")
  @ApiOperation({ summary: "Consulta el estado del sandbox y del motor Docker" })
  @ApiResponse({ status: 200, description: "Estado y disponibilidad del sandbox" })
  async getStatus() {
    return this.runnerService.getStatus();
  }

  @Post("execute")
  @ApiOperation({ summary: "Ejecuta un comando en un contenedor Docker aislado y seguro" })
  @ApiResponse({ status: 200, description: "Resultado y salida de la ejecución" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async execute(@Body() dto: ExecuteCommandDto) {
    return this.runnerService.execute(dto);
  }

  @Post("cancel/:id")
  @ApiOperation({ summary: "Cancela una ejecución en curso en el sandbox" })
  @ApiResponse({ status: 200, description: "Confirmación de cancelación" })
  async cancel(@Param("id") id: string) {
    return this.runnerService.cancel(id);
  }

  @Get("logs/:id")
  @ApiOperation({ summary: "Recupera los registros detallados de una ejecución anterior" })
  @ApiResponse({ status: 200, description: "Registro completo de salida y estado" })
  async getLog(@Param("id") id: string) {
    return this.runnerService.getExecutionLog(id);
  }
}
