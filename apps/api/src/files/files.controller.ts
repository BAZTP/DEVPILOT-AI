import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("files")
@Controller("v1/files")
export class FilesController {
  @Get("status")
  status() {
    return { status: "Files module — Phase 3 implementation pending" };
  }
}
