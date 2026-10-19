import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { ContextCollectorService } from "./context-collector.service";
import { KeyManagerService } from "./key-manager.service";
import { AIToolsService } from "./tools.service";
import { GeminiProvider } from "./providers/gemini.provider";
import { AnthropicProvider } from "./providers/anthropic.provider";
import { OpenAIProvider } from "./providers/openai.provider";
import { OllamaProvider } from "./providers/ollama.provider";
import { LocalEngineProvider } from "./providers/local-engine.provider";
import { FilesModule } from "../files/files.module";
import { ProjectsModule } from "../projects/projects.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [FilesModule, ProjectsModule, PrismaModule],
  controllers: [AiController],
  providers: [
    AiService,
    ContextCollectorService,
    KeyManagerService,
    AIToolsService,
    GeminiProvider,
    AnthropicProvider,
    OpenAIProvider,
    OllamaProvider,
    LocalEngineProvider,
  ],
  exports: [AiService, KeyManagerService],
})
export class AiModule {}
