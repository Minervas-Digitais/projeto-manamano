import { Injectable } from '@nestjs/common';
import { UpdateVersionDto } from './update-version-dto';
import { PrismaService } from './prisma/prisma.service';
import { AppVersion } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  getHello(): string {
    return 'Hello World!';
  }

  async getVersion(): Promise<AppVersion | null> {
    return this.prisma.appVersion.findFirst({
      where: { isActive: true },
    });
  }

  async updateVersion(data: UpdateVersionDto) {
    await this.prisma.appVersion.updateMany({
      data: { isActive: false },
    });

    const newVersion = await this.prisma.appVersion.create({
      data: {
        version: data.version,
        build: data.build,
        mandatory: data.mandatory,
        easBuildId: data.easBuildId,
        notes: data.notes ?? [],
        isActive: true,
      },
    });

    const all = await this.prisma.appVersion.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const toDelete = all.slice(3);

    await this.prisma.appVersion.deleteMany({
      where: {
        id: { in: toDelete.map((v) => v.id) },
      },
    });

    return newVersion;
  }

  async checkVersion(build: number) {
    const latest = await this.getVersion();

    if (!latest) return { update: false };

    return {
      update: build < latest.build,
      latest,
    };
  }
}
