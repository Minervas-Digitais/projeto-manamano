import { User } from '@prisma/client';

export type UserPublicFields = {
  id: string;
  fullName: string;
  bio?: string;
  enterprise?: string;
  expertise?: string;
  neighborhood?: string;
  ethnicity?: string;
  birthday?: Date;
  profilePictureId?: string | null;
};

export type UserPrivateFields = Omit<User, 'hash'>;
