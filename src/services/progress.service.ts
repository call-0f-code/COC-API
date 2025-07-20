import { prisma } from "../db/client"


export const getCompletedQuestion = async(memeberId:string)=>{
    return await prisma.completedQuestion.findMany({
        where:{memberId:memeberId}
    })
}

export const markQuestion = async(questionId:number,memberId:string)=>{
   
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
   
}