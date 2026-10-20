import { Module } from "@nestjs/common";
import { GitController } from "./git.controller";
import { GitService } from "./git.service";
import { GitHubService } from "./github.service";
import { ProjectsModule } from "../projects/projects.module";
import { PrismaModule } from "../prisma/prisma.module";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [ProjectsModule, PrismaModule, AiModule],
  controllers: [GitController],
  providers: [GitService, GitHubService],
  exports: [GitService, GitHubService],
})
export class GitModule {}
