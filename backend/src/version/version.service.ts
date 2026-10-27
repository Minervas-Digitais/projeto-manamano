import { Injectable, Logger } from '@nestjs/common';
import { AppUpdateStatus, GitHubRelease, ReleaseInfo, VersionInfo } from './version.types';

const GITHUB_REPOSITORY = 'Minervas-Digitais/projeto-manamano';
const LATEST_RELEASE_URL = `https://api.github.com/repos/${GITHUB_REPOSITORY}/releases/latest`;
const RELEASES_PAGE_URL = `https://github.com/${GITHUB_REPOSITORY}/releases/latest`;

const REQUEST_TIMEOUT_MS = 10000;
const SUCCESS_CACHE_TTL_MS = 10 * 60 * 1000;
const FAILURE_CACHE_TTL_MS = 60 * 60 * 1000;

const SEMVER_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;
const MINIMUM_VERSION_PATTERN =
  /(?:vers[aã]o\s+m[ií]nima\s+suportada|minimum)[^\n\d]{0,40}v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/i;

type ParsedVersion = {
  major: number;
  minor: number;
  patch: number;
  prerelease: string[];
};

function parseVersion(version: string): ParsedVersion | null {
  const match = SEMVER_PATTERN.exec(version.trim());

  if (!match) return null;

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ? match[4].split('.') : [],
  };
}

function comparePrerelease(left: string[], right: string[]): number {
  if (left.length === 0 && right.length === 0) return 0;
  if (left.length === 0) return 1;
  if (right.length === 0) return -1;

  for (let index = 0; index < left.length; index += 1) {
    if (index >= right.length) return 1;

    const leftPart = left[index];
    const rightPart = right[index];
    const leftIsNumeric = /^\d+$/.test(leftPart);
    const rightIsNumeric = /^\d+$/.test(rightPart);

    if (leftIsNumeric && rightIsNumeric) {
      const difference = Number(leftPart) - Number(rightPart);
      if (difference !== 0) return difference < 0 ? -1 : 1;
    } else if (leftIsNumeric) {
      return -1;
    } else if (rightIsNumeric) {
      return 1;
    } else if (leftPart !== rightPart) {
      return leftPart < rightPart ? -1 : 1;
    }
  }

  return left.length === right.length ? 0 : -1;
}

function compareVersions(left: string, right: string): number | null {
  const parsedLeft = parseVersion(left);
  const parsedRight = parseVersion(right);

  if (!parsedLeft || !parsedRight) return null;

  const coreDifference =
    parsedLeft.major - parsedRight.major ||
    parsedLeft.minor - parsedRight.minor ||
    parsedLeft.patch - parsedRight.patch;

  if (coreDifference !== 0) return coreDifference < 0 ? -1 : 1;

  return comparePrerelease(parsedLeft.prerelease, parsedRight.prerelease);
}

function normalizeVersion(value?: string | null): string | null {
  if (!value) return null;

  const normalized = value.trim().replace(/^v/i, '');

  return parseVersion(normalized) ? normalized : null;
}

function parseMinimumVersion(body?: string | null): string | null {
  if (!body) return null;

  const match = MINIMUM_VERSION_PATTERN.exec(body);

  return normalizeVersion(match?.[1]);
}

function evaluateStatus(release: ReleaseInfo, currentVersion?: string): AppUpdateStatus | null {
  const installedVersion = normalizeVersion(currentVersion);

  if (!installedVersion || !release.latest) return null;

  const latestComparison = compareVersions(installedVersion, release.latest);

  if (latestComparison === null || latestComparison >= 0) return 'current';

  const minimumVersion =
    release.minimum && compareVersions(release.minimum, release.latest) === 1
      ? release.latest
      : release.minimum;
  const minimumComparison = minimumVersion
    ? compareVersions(installedVersion, minimumVersion)
    : null;

  return minimumComparison !== null && minimumComparison < 0 ? 'required' : 'optional';
}

@Injectable()
export class VersionService {
  private readonly logger = new Logger(VersionService.name);

  private cachedRelease: ReleaseInfo | null = null;

  private cacheExpiresAt = 0;

  private inFlightRequest: Promise<ReleaseInfo> | null = null;

  async getLatest(currentVersion?: string): Promise<VersionInfo> {
    const release = await this.getRelease();

    return {
      ...release,
      status: evaluateStatus(release, currentVersion),
    };
  }

  private async getRelease(): Promise<ReleaseInfo> {
    if (this.cachedRelease && Date.now() < this.cacheExpiresAt) {
      return this.cachedRelease;
    }

    if (!this.inFlightRequest) {
      this.inFlightRequest = this.loadRelease().finally(() => {
        this.inFlightRequest = null;
      });
    }

    return this.inFlightRequest;
  }

  private async loadRelease(): Promise<ReleaseInfo> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(LATEST_RELEASE_URL, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'manamano-backend',
        },
        signal: controller.signal,
      });

      if (response.status === 404) {
        const emptyRelease = this.emptyRelease();
        this.cacheRelease(emptyRelease, FAILURE_CACHE_TTL_MS);
        return emptyRelease;
      }

      if (!response.ok) {
        throw new Error(`GitHub respondeu com status ${response.status}`);
      }

      const release = (await response.json()) as GitHubRelease;
      const releaseInfo = this.toReleaseInfo(release);

      this.cacheRelease(releaseInfo, SUCCESS_CACHE_TTL_MS);

      return releaseInfo;
    } catch (error) {
      this.logger.warn(`Falha ao consultar a release mais recente: ${String(error)}`);

      if (this.cachedRelease) {
        this.cacheExpiresAt = Date.now() + FAILURE_CACHE_TTL_MS;
        return this.cachedRelease;
      }

      const emptyRelease = this.emptyRelease();
      this.cacheRelease(emptyRelease, FAILURE_CACHE_TTL_MS);
      return emptyRelease;
    } finally {
      clearTimeout(timeout);
    }
  }

  private toReleaseInfo(release: GitHubRelease): ReleaseInfo {
    const releaseUrl = release.html_url ?? RELEASES_PAGE_URL;
    const apkAsset = release.assets?.find((asset) => asset.name?.toLowerCase().endsWith('.apk'));

    return {
      latest: normalizeVersion(release.tag_name),
      minimum: parseMinimumVersion(release.body),
      releaseUrl,
      downloadUrl: apkAsset?.browser_download_url ?? releaseUrl,
    };
  }

  private emptyRelease(): ReleaseInfo {
    return {
      latest: null,
      minimum: null,
      releaseUrl: RELEASES_PAGE_URL,
      downloadUrl: RELEASES_PAGE_URL,
    };
  }

  private cacheRelease(release: ReleaseInfo, ttlMs: number) {
    this.cachedRelease = release;
    this.cacheExpiresAt = Date.now() + ttlMs;
  }
}
