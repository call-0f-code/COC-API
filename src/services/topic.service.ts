import { prisma } from "../db/client";


export const getTopics = async() => {

    return await prisma.topic.findMany();

}
 // ask about the error handling here 
export const createTopics = async(title:string,description:string,adminId:string)=>{

    return await prisma.topic.create({
        data: {
            title,
            description,
            createdById:adminId,
        }
    })
    

}
// remeber to add updatedBy in topics and question
export const updateTopic = async(topicId:number,updateData:topicData)=>{
    try{
        const updatedTopic = await prisma.topic.update({
            where:{id:topicId},
            data:{
                ...(updateData.title && {title:updateData.title}),
                ...(updateData.description && {description:updateData.description}),
            }
        })
        return updatedTopic;
    }catch(error){
        throw new Error(error as string);
    }
}

export const deleteTopic =  async(topicId:number)=>{
    try{
        const topic = await prisma.topic.delete({
            where: {id:topicId}
        });
        return topic
    }catch(error){
        throw new Error(error as string);
    }
}
