import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Max, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ExecuteCommandDto {
  @ApiProperty({ example: "proj-1" })
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @ApiProperty({ example: "npm test" })
  @IsString()
  @IsNotEmpty()
  command!: string;

  @ApiPropertyOptional({ example: 30000, description: "Tiempo límite en milisegundos (máx 60000)" })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(60000)
  timeoutMs?: number;

  @ApiPropertyOptional({ example: false, description: "Permitir acceso a red dentro del sandbox" })
  @IsOptional()
  @IsBoolean()
  networkEnabled?: boolean;
}
