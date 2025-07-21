import { Difficulty } from "../generated/prisma";

export {};

declare global {
  interface questionData {
    questionName?: string;
    difficulty?: Difficulty;
    link?: string;
    updatedById?: string;
    createdById?: string;
  }
  interface topicData {
    id?: number;
    title?: string;
    description?: string;
    updatedById?: string;
    createdById?: string;
  }
}
