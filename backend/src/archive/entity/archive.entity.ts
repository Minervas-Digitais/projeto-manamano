export class ArchiveEntity {
    id: string;
    name: string;
    mimeType: string;
    contentBase64: string;
    userId?: string | null;
    groupId?: string | null;
    uploadDate: Date;
  
    constructor(partial: Partial<ArchiveEntity>) {
      Object.assign(this, partial);
    }
  }
  