import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { execFile } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import { ProjectsService } from "../projects/projects.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  GitStatusSummary,
  GitFileStatus,
  GitBranchInfo,
  GitCommitInfo,
} from "./git.types";

const execFileAsync = promisify(execFile);

@Injectable()
export class GitService {
  private readonly logger = new Logger(GitService.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Obtiene la ruta absoluta y canónica del proyecto asegurando aislamiento.
   */
  private getProjectPath(projectId: string): string {
    return this.projectsService.getWorkspaceManager().getProjectDirectory(projectId);
  }

  /**
   * Ejecuta un comando Git en el directorio del proyecto de manera segura.
   */
  private async execGit(
    projectId: string,
    args: string[],
  ): Promise<{ stdout: string; stderr: string }> {
    const cwd = this.getProjectPath(projectId);
    try {
      return await execFileAsync("git", args, { cwd });
    } catch (err: any) {
      throw new BadRequestException(
        `Error de Git (${args.join(" ")}): ${err.stderr || err.message}`,
      );
    }
  }

  /**
   * Inicializa un repositorio Git si la carpeta no lo tiene aún.
   */
  async ensureGitRepo(projectId: string): Promise<void> {
    const cwd = this.getProjectPath(projectId);
    const gitDir = path.join(cwd, ".git");
    try {
      await fs.access(gitDir);
    } catch {
      this.logger.log(`Inicializando nuevo repositorio Git en: ${cwd}`);
      await execFileAsync("git", ["init", "-b", "main"], { cwd });
      await execFileAsync("git", ["config", "user.name", "DevPilot AI"], { cwd });
      await execFileAsync("git", ["config", "user.email", "bot@devpilot.ai"], { cwd });
    }
  }

  /**
   * Obtiene el estado detallado de Git del proyecto.
   */
  async getStatus(projectId: string): Promise<GitStatusSummary> {
    await this.ensureGitRepo(projectId);

    const { stdout } = await this.execGit(projectId, ["status", "--porcelain=v1", "-b"]);
    const lines = stdout.split("\n").filter((l) => l.trim().length > 0);

    let branch = "main";
    let ahead = 0;
    let behind = 0;
    const stagedFiles: GitFileStatus[] = [];
    const unstagedFiles: GitFileStatus[] = [];
    const untrackedFiles: GitFileStatus[] = [];

    for (const line of lines) {
      if (line.startsWith("## ")) {
        // Cabecera de rama: ## main...origin/main [ahead 1, behind 2]
        const branchPart = line.slice(3);
        const nameMatch = branchPart.match(/^([^\s\.]+)/);
        if (nameMatch) branch = nameMatch[1]!;

        const aheadMatch = branchPart.match(/ahead (\d+)/);
        if (aheadMatch) ahead = parseInt(aheadMatch[1]!, 10);

        const behindMatch = branchPart.match(/behind (\d+)/);
        if (behindMatch) behind = parseInt(behindMatch[1]!, 10);
        continue;
      }

      const x = line[0];
      const y = line[1];
      const filePath = line.slice(3).trim();

      // Untracked
      if (x === "?" && y === "?") {
        untrackedFiles.push({
          path: filePath,
          status: "untracked",
          staged: false,
        });
        continue;
      }

      // Staged
      if (x && x !== " " && x !== "?") {
        let status: GitFileStatus["status"] = "modified";
        if (x === "A") status = "added";
        if (x === "D") status = "deleted";
        if (x === "R") status = "renamed";
        stagedFiles.push({ path: filePath, status, staged: true });
      }

      // Unstaged
      if (y && y !== " " && y !== "?") {
        let status: GitFileStatus["status"] = "modified";
        if (y === "D") status = "deleted";
        unstagedFiles.push({ path: filePath, status, staged: false });
      }
    }

    const isClean =
      stagedFiles.length === 0 &&
      unstagedFiles.length === 0 &&
      untrackedFiles.length === 0;

    return {
      branch,
      isClean,
      ahead,
      behind,
      stagedFiles,
      unstagedFiles,
      untrackedFiles,
    };
  }

  /**
   * Prepara archivos para commit (git add).
   */
  async stageFiles(projectId: string, files?: string[]): Promise<GitStatusSummary> {
    await this.ensureGitRepo(projectId);

    if (files && files.length > 0) {
      await this.execGit(projectId, ["add", "--", ...files]);
    } else {
      await this.execGit(projectId, ["add", "-A"]);
    }

    return this.getStatus(projectId);
  }

  /**
   * Deshace la preparación de archivos (git restore --staged).
   */
  async unstageFiles(projectId: string, files?: string[]): Promise<GitStatusSummary> {
    await this.ensureGitRepo(projectId);

    if (files && files.length > 0) {
      await this.execGit(projectId, ["restore", "--staged", "--", ...files]);
    } else {
      await this.execGit(projectId, ["restore", "--staged", "."]);
    }

    return this.getStatus(projectId);
  }

  /**
   * Crea un commit con mensaje y registro de auditoría.
   */
  async createCommit(
    projectId: string,
    message: string,
    authorName?: string,
    authorEmail?: string,
    userId = "system",
  ): Promise<{ commitSha: string; summary: string }> {
    await this.ensureGitRepo(projectId);

    const args = ["commit", "-m", message];
    if (authorName && authorEmail) {
      args.push(`--author=${authorName} <${authorEmail}>`);
    }

    const { stdout } = await this.execGit(projectId, args);
    const shaMatch = stdout.match(/\[(?:[^\s]+)\s+([a-f0-9]+)\]/i);
    const commitSha = shaMatch ? shaMatch[1]! : "unknown";

    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: "GIT_COMMIT",
          resource: `project:${projectId}`,
          metadata: { message, commitSha },
        },
      });
    } catch {
      // Ignorar si BD está offline
    }

    return {
      commitSha,
      summary: stdout.split("\n")[0] || "Commit creado con éxito.",
    };
  }

  /**
   * Lista las ramas del repositorio.
   */
  async getBranches(projectId: string): Promise<GitBranchInfo[]> {
    await this.ensureGitRepo(projectId);

    const { stdout } = await this.execGit(projectId, ["branch", "--format=%(refname:short)|%(HEAD)"]);
    const lines = stdout.split("\n").filter((l) => l.trim().length > 0);

    return lines.map((line) => {
      const [name, head] = line.split("|");
      return {
        name: name || "main",
        isCurrent: head === "*",
      };
    });
  }

  /**
   * Crea o cambia de rama.
   */
  async switchBranch(projectId: string, branchName: string, createNew = false): Promise<void> {
    await this.ensureGitRepo(projectId);
    const cleanName = branchName.trim();

    if (createNew) {
      await this.execGit(projectId, ["checkout", "-b", cleanName]);
    } else {
      await this.execGit(projectId, ["checkout", cleanName]);
    }
  }

  /**
   * Obtiene la diferencia de cambios en formato Unified Diff.
   */
  async getDiff(projectId: string, filePath?: string): Promise<string> {
    await this.ensureGitRepo(projectId);

    const args = ["diff", "HEAD"];
    if (filePath) {
      args.push("--", filePath);
    }

    try {
      const { stdout } = await this.execGit(projectId, args);
      return stdout;
    } catch {
      // Si HEAD aún no tiene commits, mostrar diff contra el árbol de trabajo
      const { stdout } = await this.execGit(projectId, ["diff"]);
      return stdout;
    }
  }

  /**
   * Realiza push remoto con CONFIRMACIÓN EXPLÍCITA obligatoria.
   */
  async push(
    projectId: string,
    confirmed: boolean,
    remote = "origin",
    branch?: string,
    userId = "system",
  ): Promise<{ success: boolean; message: string }> {
    if (!confirmed) {
      throw new BadRequestException(
        "Se requiere confirmación explícita del usuario para realizar operaciones de push remoto.",
      );
    }

    await this.ensureGitRepo(projectId);
    const status = await this.getStatus(projectId);
    const targetBranch = branch || status.branch;

    const { stdout, stderr } = await this.execGit(projectId, ["push", remote, targetBranch]);

    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: "GIT_PUSH",
          resource: `project:${projectId}`,
          metadata: { remote, targetBranch },
        },
      });
    } catch {
      // Ignorar si BD está offline
    }

    return {
      success: true,
      message: stdout || stderr || `Push exitoso a ${remote}/${targetBranch}`,
    };
  }

  /**
   * Clona un repositorio de Git en el workspace del usuario.
   */
  async cloneRepository(
    cloneUrl: string,
    projectName: string,
    githubToken?: string,
    userId = "system",
  ): Promise<{ projectId: string; path: string }> {
    const cleanProjectName = projectName.trim().replace(/[^a-zA-Z0-9_-]/g, "-");
    const manager = this.projectsService.getWorkspaceManager();
    const targetDir = manager.getProjectDirectory(cleanProjectName);

    // Si se proporciona un token de acceso, inyectarlo en la URL de forma segura sin loguearlo
    let authenticatedUrl = cloneUrl;
    if (githubToken && cloneUrl.startsWith("https://github.com/")) {
      authenticatedUrl = cloneUrl.replace(
        "https://github.com/",
        `https://x-access-token:${githubToken}@github.com/`,
      );
    }

    this.logger.log(`Clonando repositorio en: ${targetDir}`);
    await execFileAsync("git", ["clone", authenticatedUrl, targetDir]);

    // Crear registro en Prisma
    const project = await this.projectsService.createProject(userId, {
      name: cleanProjectName,
      description: `Repositorio clonado desde ${cloneUrl}`,
      template: "BLANK",
    });

    return {
      projectId: project.id,
      path: cleanProjectName,
    };
  }
}
