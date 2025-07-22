import 'express';
export { }

declare global {

  interface UpdateAchievementInput {
    title?: string;
    description?: string;
    achievedAt?: string | Date;
    imageUrl?: string;
    updatedById: string;
  };

  interface CreateAchievementInput {
    title: string;
    description: string;
    achievedAt: string | Date;
    imageUrl: string;
    memberIds: string[];
    createdById: string;
  };
}