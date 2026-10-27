export type AppUpdateStatus = 'current' | 'optional' | 'required';

export type ReleaseInfo = {
  latest: string | null;
  minimum: string | null;
  releaseUrl: string;
  downloadUrl: string;
};

export type VersionInfo = ReleaseInfo & {
  status: AppUpdateStatus | null;
};

export type GitHubRelease = {
  tag_name?: string;
  body?: string | null;
  html_url?: string;
  assets?: {
    name?: string;
    browser_download_url?: string;
  }[];
};
