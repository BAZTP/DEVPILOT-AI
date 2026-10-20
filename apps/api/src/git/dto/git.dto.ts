import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CommitDto {
  @ApiProperty({ example: "feat: implementar autenticacion y rutas protegidas" })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ example: "DevPilot User" })
  @IsOptional()
  @IsString()
  authorName?: string;

  @ApiPropertyOptional({ example: "dev@devpilot.ai" })
  @IsOptional()
  @IsString()
  authorEmail?: string;
}

export class StageFilesDto {
  @ApiPropertyOptional({ example: ["src/app/page.tsx", "package.json"] })
  @IsOptional()
  @IsArray()
  files?: string[];
}

export class PushDto {
  @ApiProperty({ example: true, description: "Confirmación explícita requerida para realizar push remoto" })
  @IsBoolean()
  confirmed!: boolean;

  @ApiPropertyOptional({ example: "origin" })
  @IsOptional()
  @IsString()
  remote?: string;

  @ApiPropertyOptional({ example: "main" })
  @IsOptional()
  @IsString()
  branch?: string;
}

export class BranchDto {
  @ApiProperty({ example: "feature/ai-integration" })
  @IsString()
  @IsNotEmpty()
  branchName!: string;

  @ApiPropertyOptional({ example: true, description: "Crear la rama si no existe" })
  @IsOptional()
  @IsBoolean()
  create?: boolean;
}

export class CloneRepoDto {
  @ApiProperty({ example: "https://github.com/BAZTP/DEVPILOT-AI.git" })
  @IsString()
  @IsNotEmpty()
  cloneUrl!: string;

  @ApiProperty({ example: "mi-repo-clonado" })
  @IsString()
  @IsNotEmpty()
  projectName!: string;

  @ApiPropertyOptional({ example: "ghp_...", description: "Token de acceso opcional para repositorios privados" })
  @IsOptional()
  @IsString()
  githubToken?: string;
}

export class CreatePullRequestDto {
  @ApiProperty({ example: "BAZTP" })
  @IsString()
  @IsNotEmpty()
  owner!: string;

  @ApiProperty({ example: "DEVPILOT-AI" })
  @IsString()
  @IsNotEmpty()
  repo!: string;

  @ApiProperty({ example: "feat: asistente de IA y sandbox de ejecucion" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: "Implementación completa de las Fases 4 y 5 de DevPilot AI" })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ example: "feature/ai-integration" })
  @IsString()
  @IsNotEmpty()
  head!: string;

  @ApiProperty({ example: "main" })
  @IsString()
  @IsNotEmpty()
  base!: string;
}
