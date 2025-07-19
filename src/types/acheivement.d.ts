

import 'express';
export { }

declare global {

  interface UpdateAchievementInput {
    title?: string;
    achievedAt?: string | Date;
    imageUrl?: string;
  }

  interface CreateAchievementInput {
    title: string;
    achievedAt: string | Date;
    imageUrl?: string;
    memberIds: string[];
  }
}