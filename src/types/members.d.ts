import 'express';
export { }

declare global {

  interface UpdateMemberPayload {
    name?: string;
    phone?: string;
    bio?: string;
    profilePhoto?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    geeksforgeeks?: string;
    leetcode?: string;
    codechef?: string;
    codeforces?: string;
  }
}
