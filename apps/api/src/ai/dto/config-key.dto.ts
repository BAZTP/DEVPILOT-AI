import { IsString, IsNotEmpty, IsOptional, IsIn } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SaveKeyDto {
  @ApiProperty({ example: "google", enum: ["google", "anthropic", "openai", "ollama"] })
  @IsString()
  @IsIn(["google", "anthropic", "openai", "ollama"])
  provider!: "google" | "anthropic" | "openai" | "ollama";

  @ApiProperty({ example: "gemini-1.5-pro" })
  @IsString()
  @IsNotEmpty()
  modelId!: string;

  @ApiProperty({ example: "AIzaSy..." })
  @IsString()
  @IsNotEmpty()
  apiKey!: string;

  @ApiPropertyOptional({ example: "https://generativelanguage.googleapis.com" })
  @IsOptional()
  @IsString()
  baseUrl?: string;
}

export class ApplyProposalDto {
  @ApiProperty({ example: "proj-1" })
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @ApiProperty({ example: "diff-1718293819-abc" })
  @IsString()
  @IsNotEmpty()
  proposalId!: string;
}
