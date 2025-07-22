import 'express';
export { }

declare global {
  interface InterviewResponse {
    id: number;
    company: string;
    role: string;
    verdict: "Selected" | "Rejected" | "Pending";
    content: string;
    isAnonymous: boolean;
    memberId: string;
  }

  interface InterviewCreateInput {
    company: string;
    role: string;
    verdict: "Selected" | "Rejected" | "Pending";
    content: string;
    isAnonymous: boolean;
  }

  interface InterviewUpdateInput {
    company?: string;
    role?: string;
    verdict?: "Selected" | "Rejected" | "Pending";
    content?: string;
    isAnonymous?: boolean;
    memberId: string; // For verification, not stored again in Prisma
  }

}



