import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";
import { FilesService } from "./files.service";

export class WriteFileDto {
  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsString()
  content!: string;
}

export class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsString()
  @IsOptional()
  initialContent?: string;
}

export class CreateDirDto {
  @IsString()
  @IsNotEmpty()
  path!: string;
}

export class RenameDto {
  @IsString()
  @IsNotEmpty()
  oldPath!: string;

  @IsString()
  @IsNotEmpty()
  newPath!: string;
}

@ApiTags("files")
@Controller("v1/files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get("tree/:projectId")
  @ApiOperation({ summary: "Obtener árbol jerárquico de archivos del proyecto" })
  @ApiQuery({ name: "subPath", required: false })
  async getTree(
    @Param("projectId") projectId: string,
    @Query("subPath") subPath?: string
  ) {
    return this.filesService.getTree(projectId, subPath || "");
  }

  @Get("content/:projectId")
  @ApiOperation({ summary: "Leer contenido de un archivo del proyecto" })
  @ApiQuery({ name: "path", required: true })
  async readFile(
    @Param("projectId") projectId: string,
    @Query("path") filePath: string
  ) {
    return this.filesService.readFile(projectId, filePath);
  }

  @Post("content/:projectId")
  @ApiOperation({ summary: "Guardar o actualizar contenido de un archivo" })
  async writeFile(
    @Param("projectId") projectId: string,
    @Body() dto: WriteFileDto
  ) {
    return this.filesService.writeFile(projectId, dto.path, dto.content);
  }

  @Post("create/:projectId")
  @ApiOperation({ summary: "Crear un nuevo archivo dentro del proyecto" })
  async createFile(
    @Param("projectId") projectId: string,
    @Body() dto: CreateFileDto
  ) {
    return this.filesService.createFile(
      projectId,
      dto.path,
      dto.initialContent || ""
    );
  }

  @Post("mkdir/:projectId")
  @ApiOperation({ summary: "Crear una nueva carpeta dentro del proyecto" })
  async createDirectory(
    @Param("projectId") projectId: string,
    @Body() dto: CreateDirDto
  ) {
    return this.filesService.createDirectory(projectId, dto.path);
  }

  @Delete(":projectId")
  @ApiOperation({ summary: "Eliminar un archivo o carpeta" })
  @ApiQuery({ name: "path", required: true })
  async deleteItem(
    @Param("projectId") projectId: string,
    @Query("path") itemPath: string
  ) {
    return this.filesService.deleteItem(projectId, itemPath);
  }

  @Patch("rename/:projectId")
  @ApiOperation({ summary: "Renombrar un archivo o carpeta" })
  async renameItem(
    @Param("projectId") projectId: string,
    @Body() dto: RenameDto
  ) {
    return this.filesService.renameItem(projectId, dto.oldPath, dto.newPath);
  }

  @Get("search/:projectId")
  @ApiOperation({ summary: "Buscar texto dentro de los archivos del proyecto" })
  @ApiQuery({ name: "q", required: true })
  @ApiQuery({ name: "matchCase", required: false })
  @ApiQuery({ name: "regex", required: false })
  async search(
    @Param("projectId") projectId: string,
    @Query("q") query: string,
    @Query("matchCase") matchCase?: string,
    @Query("regex") regex?: string
  ) {
    return this.filesService.search(
      projectId,
      query,
      matchCase === "true",
      regex === "true"
    );
  }
}
