import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("ai")
@Controller("v1/ai")
export class AiController {
  @Get("status")
  status() {
    return { status: "AI module — Phase 4 implementation pending" };
  }
}
