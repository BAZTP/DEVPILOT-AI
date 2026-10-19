import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  Headers,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { ProjectsService } from "./projects.service";
import { SupportedTemplate } from "../workspace-core";

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: "El nombre del proyecto es obligatorio" })
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(
    [
      "REACT",
      "NEXTJS",
      "NODEJS",
      "PYTHON",
      "NESTJS_API",
      "HTML_CSS_JS",
      "BLANK",
    ],
    { message: "Plantilla no soportada" }
  )
  @IsOptional()
  template?: SupportedTemplate;
}

@ApiTags("projects")
@Controller("v1/projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: "Crear un nuevo proyecto con archivos funcionales" })
  @ApiResponse({ status: 201, description: "Proyecto creado exitosamente" })
  async createProject(
    @Body() dto: CreateProjectDto,
    @Headers("x-user-id") headerUserId?: string
  ) {
    const userId = headerUserId || "default-user";
    return this.projectsService.createProject(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar proyectos del usuario" })
  async getProjects(@Headers("x-user-id") headerUserId?: string) {
    const userId = headerUserId || "default-user";
    return this.projectsService.getProjects(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener detalles de un proyecto por ID" })
  async getProject(
    @Param("id") projectId: string,
    @Headers("x-user-id") headerUserId?: string
  ) {
    const userId = headerUserId || "default-user";
    return this.projectsService.getProject(userId, projectId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar un proyecto y sus archivos" })
  async deleteProject(
    @Param("id") projectId: string,
    @Headers("x-user-id") headerUserId?: string
  ) {
    const userId = headerUserId || "default-user";
    return this.projectsService.deleteProject(userId, projectId);
  }

  @Patch(":id/favorite")
  @ApiOperation({ summary: "Alternar estado de favorito de un proyecto" })
  async toggleFavorite(
    @Param("id") projectId: string,
    @Headers("x-user-id") headerUserId?: string
  ) {
    const userId = headerUserId || "default-user";
    return this.projectsService.toggleFavorite(userId, projectId);
  }
}
