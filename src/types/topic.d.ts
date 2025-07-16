import { Difficulty } from "../generated/prisma";

export {};

declare global {
    interface questionData {
        id?:number,
        questionName?:string,
        difficulty?:Difficulty,
        link?:string,
        createdBy?:string,
    }
    interface topicData {
        id?:number,
        title?:string,
        description?:string
        createdById?:string
    }
}