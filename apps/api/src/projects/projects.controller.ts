import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("projects")
@Controller("v1/projects")
export class ProjectsController {
  @Get("status")
  status() {
    return { status: "Projects module — Phase 3 implementation pending" };
  }
}
