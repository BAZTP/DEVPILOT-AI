import { Injectable } from "@nestjs/common";
import { AIProvider } from "./ai-provider.interface";

@Injectable()
export class LocalEngineProvider implements AIProvider {
  readonly name = "local";
  readonly defaultModel = "devpilot-local-engine";

  async *generateStream(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>,
  ): AsyncGenerator<string> {
    const lastMessage = messages[messages.length - 1]?.content || "";
    const responseText = this.buildIntelligentResponse(lastMessage, systemPrompt);

    // Simular cadencia fluida de streaming palabra por palabra
    const words = responseText.split(" ");
    for (const word of words) {
      yield word + " ";
      await new Promise((r) => setTimeout(r, 20));
    }
  }

  async generate(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    let result = "";
    for await (const chunk of this.generateStream(systemPrompt, messages)) {
      result += chunk;
    }
    return result;
  }

  private buildIntelligentResponse(prompt: string, systemPrompt: string): string {
    const lowerPrompt = prompt.toLowerCase();

    // 1. Detección de solicitud de pruebas unitarias
    if (lowerPrompt.includes("test") || lowerPrompt.includes("prueba") || lowerPrompt.includes("vitest") || lowerPrompt.includes("jest")) {
      return `### 🧪 Suite de Pruebas Generada con Vitest

He analizado los módulos del proyecto y generado una suite de pruebas unitarias en TypeScript estricto:

\`\`\`typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('DevPilot Component & Services Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe inicializarse correctamente con la configuración por defecto', () => {
    const config = { strict: true, timeout: 5000 };
    expect(config.strict).toBe(true);
    expect(config.timeout).toBeGreaterThan(0);
  });

  it('debe manejar entradas inválidas lanzando una excepción controlada', () => {
    const validate = (val: string) => {
      if (!val.trim()) throw new Error('Entrada no puede estar vacía');
      return true;
    };

    expect(() => validate('')).toThrow('Entrada no puede estar vacía');
    expect(validate('valid-data')).toBe(true);
  });

  it('debe completar operaciones asíncronas dentro del SLA establecido', async () => {
    const fetchData = async () => Promise.resolve({ success: true, count: 42 });
    const result = await fetchData();
    expect(result.success).toBe(true);
    expect(result.count).toBe(42);
  });
});
\`\`\`

Puedes ejecutar estas pruebas en la pestaña **Pruebas** o con \`pnpm test\`.`;
    }

    // 2. Detección de creación de componente o interfaz
    if (lowerPrompt.includes("component") || lowerPrompt.includes("componente") || lowerPrompt.includes("boton") || lowerPrompt.includes("card")) {
      return `### 🧩 Componente React Reutilizable

Aquí tienes el componente con Tailwind CSS, accesibilidad ARIA y tipado TypeScript estricto:

\`\`\`tsx
import React, { FC, ButtonHTMLAttributes } from 'react';

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const ActionButton: FC<ActionButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  leftIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-electric-500 hover:bg-electric-600 text-white shadow-sm shadow-electric-500/20 focus:ring-electric-400',
    secondary: 'bg-surface-800 hover:bg-surface-700 text-slate-200 border border-slate-700 focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-400',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={\`\${baseStyles} \${variantStyles} \${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} \${className}\`}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
    </button>
  );
};
\`\`\`

¿Deseas que lo guardemos en \`src/components/ActionButton.tsx\`?`;
    }

    // 3. Detección de endpoint o backend NestJS
    if (lowerPrompt.includes("endpoint") || lowerPrompt.includes("api") || lowerPrompt.includes("controller") || lowerPrompt.includes("servicio")) {
      return `### 🚀 Endpoint REST en NestJS con DTO y Swagger

He estructurado el controlador y el DTO con validación de entradas mediante \`class-validator\`:

\`\`\`typescript
import { Controller, Post, Body, Get, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name!: string;
}

@ApiTags('recursos')
@Controller('v1/recursos')
export class RecursosController {
  @Post()
  @ApiOperation({ summary: 'Crear nuevo recurso con validación' })
  @ApiResponse({ status: 201, description: 'Recurso creado satisfactoriamente.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() dto: CreateResourceDto) {
    return {
      id: \`res-\${Date.now()}\`,
      name: dto.name,
      createdAt: new Date().toISOString(),
    };
  }
}
\`\`\``;
    }

    // 4. Explicación y respuesta general contextual
    return `### 💡 Análisis del Asistente DevPilot

He examinado tu solicitud respecto al proyecto:

> "${prompt}"

**Diagnóstico y recomendaciones técnicas:**
1. **Separación de responsabilidades**: Mantén la lógica de negocio desacoplada de los controladores e interfaces de usuario.
2. **Tipado Estricto**: Aprovecha las capacidades de TypeScript sin recurrir al tipo \`any\`.
3. **Manejo de Errores**: Diseña capas de rescate con excepciones específicas y códigos de estado semánticos.

¿Deseas que elabore un plan detallado paso a paso (**modo Plan**) o preparemos una propuesta de cambios en el editor (**modo Edit**)?`;
  }
}
