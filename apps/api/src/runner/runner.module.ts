import { Module } from "@nestjs/common";
import { RunnerController } from "./runner.controller";
import { RunnerService } from "./runner.service";
import { DockerClientService } from "./docker-client.service";
import { TerminalGateway } from "./terminal.gateway";
import { ProjectsModule } from "../projects/projects.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [ProjectsModule, PrismaModule],
  controllers: [RunnerController],
  providers: [DockerClientService, RunnerService, TerminalGateway],
  exports: [RunnerService, DockerClientService],
})
export class RunnerModule {}
