import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { GitService } from "./git.service";
import { GitHubService } from "./github.service";
import {
  CommitDto,
  StageFilesDto,
  PushDto,
  BranchDto,
  CloneRepoDto,
  CreatePullRequestDto,
} from "./dto/git.dto";

@ApiTags("git")
@Controller("v1/git")
export class GitController {
  constructor(
    private readonly gitService: GitService,
    private readonly githubService: GitHubService,
  ) {}

  @Get("status/:projectId")
  @ApiOperation({ summary: "Obtiene el estado de control de versiones Git del proyecto" })
  async getStatus(@Param("projectId") projectId: string) {
    return this.gitService.getStatus(projectId);
  }

  @Post("stage/:projectId")
  @ApiOperation({ summary: "Prepara archivos para commit (git add)" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async stageFiles(
    @Param("projectId") projectId: string,
    @Body() dto: StageFilesDto,
  ) {
    return this.gitService.stageFiles(projectId, dto.files);
  }

  @Post("unstage/:projectId")
  @ApiOperation({ summary: "Deshace la preparación de archivos (git restore --staged)" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async unstageFiles(
    @Param("projectId") projectId: string,
    @Body() dto: StageFilesDto,
  ) {
    return this.gitService.unstageFiles(projectId, dto.files);
  }

  @Post("commit/:projectId")
  @ApiOperation({ summary: "Crea un commit con mensaje verificado y auditoría" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async commit(
    @Param("projectId") projectId: string,
    @Body() dto: CommitDto,
  ) {
    return this.gitService.createCommit(
      projectId,
      dto.message,
      dto.authorName,
      dto.authorEmail,
    );
  }

  @Get("branches/:projectId")
  @ApiOperation({ summary: "Lista las ramas del repositorio local" })
  async getBranches(@Param("projectId") projectId: string) {
    return this.gitService.getBranches(projectId);
  }

  @Post("branch/:projectId")
  @ApiOperation({ summary: "Cambia de rama o crea una nueva rama" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async switchBranch(
    @Param("projectId") projectId: string,
    @Body() dto: BranchDto,
  ) {
    await this.gitService.switchBranch(projectId, dto.branchName, dto.create);
    return { success: true, branch: dto.branchName };
  }

  @Get("diff/:projectId")
  @ApiOperation({ summary: "Genera el diff de cambios sin commitear" })
  async getDiff(
    @Param("projectId") projectId: string,
    @Query("file") filePath?: string,
  ) {
    const diff = await this.gitService.getDiff(projectId, filePath);
    return { diff };
  }

  @Post("push/:projectId")
  @ApiOperation({ summary: "Envía commits a repositorio remoto con confirmación explícita" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async push(
    @Param("projectId") projectId: string,
    @Body() dto: PushDto,
  ) {
    return this.gitService.push(
      projectId,
      dto.confirmed,
      dto.remote || "origin",
      dto.branch,
    );
  }

  @Post("clone")
  @ApiOperation({ summary: "Clona un repositorio remoto dentro del workspace" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async clone(@Body() dto: CloneRepoDto) {
    return this.gitService.cloneRepository(
      dto.cloneUrl,
      dto.projectName,
      dto.githubToken,
    );
  }

  @Get("github/repos")
  @ApiOperation({ summary: "Lista repositorios accesibles en la cuenta de GitHub" })
  async listGitHubRepos(@Query("token") token?: string) {
    return this.githubService.listUserRepos(token);
  }

  @Get("github/pulls")
  @ApiOperation({ summary: "Consulta pull requests de un repositorio GitHub" })
  async listPullRequests(
    @Query("owner") owner: string,
    @Query("repo") repo: string,
    @Query("token") token?: string,
  ) {
    return this.githubService.listPullRequests(owner, repo, token);
  }

  @Post("github/pulls")
  @ApiOperation({ summary: "Crea un Pull Request en GitHub" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createPullRequest(@Body() dto: CreatePullRequestDto) {
    return this.githubService.createPullRequest(
      dto.owner,
      dto.repo,
      dto.title,
      dto.head,
      dto.base,
      dto.body,
    );
  }
}
