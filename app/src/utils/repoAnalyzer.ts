import { type GitHubRepo } from "@/types/github";

const ABANDONED_REPO_LIMIT = 4;

export function calculateDaysAbandoned(pushedAt: string): number {
  const pushedDate = new Date(pushedAt);
  const now = Date.now();
  const diff = now - pushedDate.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function rankReposByAbandonment(repos: GitHubRepo[]): GitHubRepo[] {
  return [...repos].sort((repoA, repoB) => {
    const repoADays = calculateDaysAbandoned(repoA.pushed_at ?? repoA.created_at);
    const repoBDays = calculateDaysAbandoned(repoB.pushed_at ?? repoB.created_at);
    return repoBDays - repoADays;
  });
}

export function selectMostAbandonedRepos(repos: GitHubRepo[]): GitHubRepo[] {
  const ownRepos = repos.filter((repo) => !repo.fork);
  return rankReposByAbandonment(ownRepos).slice(0, ABANDONED_REPO_LIMIT);
}
