import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, MaxLength } from "class-validator";
import { AuthService } from "./auth.service";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

class RegisterDto {
  @IsEmail({}, { message: "El email no es válido" })
  email!: string;

  @IsString()
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres" })
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  @MaxLength(100)
  password!: string;
}

class LoginDto {
  @IsEmail({}, { message: "El email no es válido" })
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

// ─── Controlador ──────────────────────────────────────────────────────────────

@ApiTags("auth")
@Controller("v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Registrar nuevo usuario" })
  @ApiResponse({ status: 201, description: "Usuario creado con éxito" })
  @ApiResponse({ status: 409, description: "El email ya está en uso" })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.name, dto.password);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Iniciar sesión" })
  @ApiResponse({ status: 200, description: "Login exitoso, retorna JWT" })
  @ApiResponse({ status: 401, description: "Credenciales incorrectas" })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get("health")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Estado del módulo de autenticación" })
  healthCheck() {
    return { status: "ok", module: "auth" };
  }
}
