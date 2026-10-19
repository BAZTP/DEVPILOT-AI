import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      name: "DevPilot AI API",
      version: "1.0.0",
      status: "ok",
      environment: process.env["NODE_ENV"] ?? "development",
      timestamp: new Date().toISOString(),
      docs: "/api/docs",
    };
  }
}
