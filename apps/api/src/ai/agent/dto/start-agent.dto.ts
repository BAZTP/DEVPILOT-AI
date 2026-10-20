import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from "class-validator";
import { AgentModeType } from "../agent.types";

export class StartAgentDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsString()
  @IsNotEmpty()
  objective!: string;

  @IsOptional()
  @IsString()
  mode?: AgentModeType;

  @IsOptional()
  @IsBoolean()
  autoApproveSafeActions?: boolean;
}

export class ApproveStepDto {
  @IsBoolean()
  approved!: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}
