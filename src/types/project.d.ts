import "express";
export {};

declare global {
  type projectContent = {
    name: string;
    imageUrl: string;
    githubUrl: string;
    deployUrl: string;
  };

    type projectContent = {
        name: string,
        imageUrl: string ,
        githubUrl: string,
        deployUrl: string?,
        AdminId : string
    }

  type addMembersData = {
    memberId: string;
    projectId: number;
  };

  type removedMemberData = {
    memberId: string;
    projectId: number;
  };

    interface updateContent {
            id        : number,                 
            name      : string,
            imageUrl  : string, 
            githubUrl : string, 
            deployUrl : string, 
            updatedById : string

        }
}
