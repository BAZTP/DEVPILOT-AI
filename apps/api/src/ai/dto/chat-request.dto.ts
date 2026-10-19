import { IsString, IsNotEmpty, IsOptional, IsArray, IsIn } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AIMode } from "../types";

export class ChatMessageDto {
  @ApiProperty({ example: "user" })
  @IsString()
  @IsIn(["user", "assistant", "system"])
  role!: "user" | "assistant" | "system";

  @ApiProperty({ example: "¿Cómo puedo agregar un botón con Tailwind?" })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class ChatRequestDto {
  @ApiProperty({ example: "proj-1" })
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @ApiProperty({ example: "Explica este archivo y optimiza la función de renderizado" })
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @ApiPropertyOptional({ example: "CHAT", enum: ["CHAT", "PLAN", "EDIT", "AGENT"] })
  @IsOptional()
  @IsIn(["CHAT", "PLAN", "EDIT", "AGENT"])
  mode?: AIMode;

  @ApiPropertyOptional({ example: "gemini-1.5-pro" })
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiPropertyOptional({ example: "src/app/page.tsx" })
  @IsOptional()
  @IsString()
  activeFilePath?: string;

  @ApiPropertyOptional({ example: ["src/components/Header.tsx"] })
  @IsOptional()
  @IsArray()
  contextFiles?: string[];

  @ApiPropertyOptional({ type: [ChatMessageDto] })
  @IsOptional()
  @IsArray()
  history?: ChatMessageDto[];
}
