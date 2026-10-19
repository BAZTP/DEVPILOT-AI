import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { ProjectsService } from "../projects/projects.service";
import { SecurityError } from "../workspace-core";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly prisma: PrismaService
  ) {}

  private getManager() {
    return this.projectsService.getWorkspaceManager();
  }

  async getTree(projectId: string, subPath = "") {
    try {
      return await this.getManager().getFileTree(projectId, subPath);
    } catch (error) {
      this.handleError(error);
    }
  }

  async readFile(projectId: string, filePath: string) {
    try {
      const content = await this.getManager().readFile(projectId, filePath);
      return {
        path: filePath,
        content,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async writeFile(projectId: string, filePath: string, content: string) {
    try {
      await this.getManager().writeFile(projectId, filePath, content);
      return {
        path: filePath,
        saved: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async createFile(
    projectId: string,
    filePath: string,
    initialContent = ""
  ) {
    try {
      await this.getManager().writeFile(projectId, filePath, initialContent);
      return {
        path: filePath,
        created: true,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async createDirectory(projectId: string, dirPath: string) {
    try {
      await this.getManager().createDirectory(projectId, dirPath);
      return {
        path: dirPath,
        created: true,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteItem(projectId: string, itemPath: string) {
    try {
      await this.getManager().deleteItem(projectId, itemPath);
      return {
        path: itemPath,
        deleted: true,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async renameItem(
    projectId: string,
    oldPath: string,
    newPath: string
  ) {
    try {
      await this.getManager().renameItem(projectId, oldPath, newPath);
      return {
        oldPath,
        newPath,
        renamed: true,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async search(
    projectId: string,
    query: string,
    matchCase = false,
    useRegex = false
  ) {
    try {
      return await this.getManager().searchInFiles(
        projectId,
        query,
        matchCase,
        useRegex
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (error instanceof SecurityError) {
      throw new BadRequestException(error.message);
    }
    if (error?.code === "ENOENT") {
      throw new NotFoundException("El archivo o directorio no existe.");
    }
    this.logger.error(`Error en FilesService: ${error?.message || error}`);
    throw new BadRequestException(
      error?.message || "Error procesando operación de archivos."
    );
  }
}
