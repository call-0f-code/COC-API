import { prisma } from "../db/client"
import { Difficulty} from "../generated/prisma";


export const getQuestionByTopicId = async(TopicId:number) =>{
    try{
        const questions = await prisma.question.findMany({
            where: {topicId:TopicId}
        })
        return questions
    }catch(error){
        throw Error(error as string);
    }
}

export const getQuestionByQuestionId = async(questionId:number) =>{
    try{
        const question = await prisma.question.findUnique({
            where: {id:questionId}
        })
        return question;
    }catch(error){
        throw new Error(error as string); 
    }
    
}
// refactor this logic with type logic
export const addQuestionByTopicId = async(adminId:string,TopicId:number,link:string,difficulty:Difficulty,questionName:string)=>{
    try{
        const question = await prisma.question.create({
            data: {
                questionName,
                difficulty,
                link,
                topicId:TopicId,
                createdById:adminId,
            }
        })
        return question
    }catch(error){
        throw new Error(error as string);
    }
}
// rembeer to add updatedBy field here 
export const updateQuestion = async(questionData:questionData)=>{
    try{
        const question  = await prisma.question.update({
            where: {id:questionData.id},
            data:{
                ...(questionData.questionName && {questionName:questionData.questionName}),
                ...(questionData.difficulty && {difficulty:questionData.difficulty}),
                ...(questionData.link && {link:questionData.link}),                                
            }
        })
        return question;
    }catch(error){
        throw new Error(error as string);
    }
}

export const deleteQuestion = async(questionId:number)=>{
    try{
        const question = await prisma.question.delete({
            where : {id:questionId}
        })
        return question
    }catch(error){
        throw new Error(error as string);
    }
}

export const getCompletedQuestion = async(memeberId:string)=>{
    return await prisma.completedQuestion.findMany({
        where:{memberId:memeberId}
    })
}

export const markQuestion = async(questionId:number,memberId:string)=>{
   try{
        const existing = await prisma.completedQuestion.findUnique({
            where:{
                memberId_questionId:{
                    memberId,
                    questionId
                }
                
            }
        })
        if(existing){
            return await prisma.completedQuestion.delete({
                where:{
                    memberId_questionId:{ 
                        memberId:memberId,
                        questionId:questionId
                    }
                }
            })
        }else{
            return await prisma.completedQuestion.create({
                data:{
                    memberId,
                    questionId
                }
            })
        }
   }catch(error){
        throw new Error(error as string)
   }
}





