export interface GitFileStatus {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed" | "untracked";
  staged: boolean;
}

export interface GitStatusSummary {
  branch: string;
  isClean: boolean;
  ahead: number;
  behind: number;
  stagedFiles: GitFileStatus[];
  unstagedFiles: GitFileStatus[];
  untrackedFiles: GitFileStatus[];
}

export interface GitBranchInfo {
  name: string;
  isCurrent: boolean;
  commitSha?: string | undefined;
}

export interface GitCommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface GitHubRepoItem {
  id: number;
  name: string;
  fullName: string;
  isPrivate: boolean;
  defaultBranch: string;
  cloneUrl: string;
  htmlUrl: string;
  description?: string | undefined;
}

export interface GitHubPullRequestItem {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  htmlUrl: string;
  author: string;
  createdAt: string;
  headBranch: string;
  baseBranch: string;
}
