import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { KeyManagerService } from "../ai/key-manager.service";
import { GitHubRepoItem, GitHubPullRequestItem } from "./git.types";

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);

  constructor(private readonly keyManager: KeyManagerService) {}

  private async resolveToken(explicitToken?: string): Promise<string | null> {
    if (explicitToken) return explicitToken;
    const envToken = process.env["GITHUB_TOKEN"];
    if (envToken) return envToken;
    return null;
  }

  /**
   * Lista los repositorios del usuario autenticado en GitHub.
   */
  async listUserRepos(explicitToken?: string): Promise<GitHubRepoItem[]> {
    const token = await this.resolveToken(explicitToken);
    if (!token) {
      return [
        {
          id: 101,
          name: "DEVPILOT-AI",
          fullName: "BAZTP/DEVPILOT-AI",
          isPrivate: false,
          defaultBranch: "master",
          cloneUrl: "https://github.com/BAZTP/DEVPILOT-AI.git",
          htmlUrl: "https://github.com/BAZTP/DEVPILOT-AI",
          description: "Entorno de desarrollo inteligente DevPilot AI",
        },
      ];
    }

    try {
      const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=30", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "DevPilot-AI-IDE",
        },
      });

      if (!res.ok) {
        throw new Error(`GitHub API error ${res.status}`);
      }

      const repos = (await res.json()) as any[];
      return repos.map((r: any) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        isPrivate: r.private,
        defaultBranch: r.default_branch,
        cloneUrl: r.clone_url,
        htmlUrl: r.html_url,
        description: r.description,
      }));
    } catch (err: any) {
      this.logger.warn(`No se pudo consultar GitHub: ${err.message}`);
      return [];
    }
  }

  /**
   * Lista Pull Requests para un repositorio en GitHub.
   */
  async listPullRequests(owner: string, repo: string, explicitToken?: string): Promise<GitHubPullRequestItem[]> {
    const token = await this.resolveToken(explicitToken);

    try {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "DevPilot-AI-IDE",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=15`, {
        headers,
      });

      if (!res.ok) return [];

      const pulls = (await res.json()) as any[];
      return pulls.map((p: any) => ({
        id: p.id,
        number: p.number,
        title: p.title,
        state: p.state,
        htmlUrl: p.html_url,
        author: p.user?.login || "unknown",
        createdAt: p.created_at,
        headBranch: p.head?.ref || "",
        baseBranch: p.base?.ref || "",
      }));
    } catch {
      return [];
    }
  }

  /**
   * Crea un nuevo Pull Request en GitHub.
   */
  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body = "",
    explicitToken?: string,
  ): Promise<GitHubPullRequestItem> {
    const token = await this.resolveToken(explicitToken);
    if (!token) {
      throw new BadRequestException(
        "Se requiere un token de GitHub o conexión OAuth para crear Pull Requests.",
      );
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "DevPilot-AI-IDE",
      },
      body: JSON.stringify({ title, head, base, body }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new BadRequestException(`Error al crear PR en GitHub: ${err}`);
    }

    const p = (await res.json()) as any;
    return {
      id: p.id,
      number: p.number,
      title: p.title,
      state: p.state,
      htmlUrl: p.html_url,
      author: p.user?.login || "unknown",
      createdAt: p.created_at,
      headBranch: p.head?.ref || head,
      baseBranch: p.base?.ref || base,
    };
  }
}
