import { Request, Response } from 'express'
import * as topicServices from '../services/topic.service'
import { ApiError } from '../utils/apiError';


export const getTopics = async(req:Request,res:Response) => {
    try{
        const topics = await topicServices.getTopics();
        res.status(201).json(topics)
    }catch(error){
        throw new ApiError((error as Error).message || "Internal Server Error", 500);
    }
}



export const createTopic = async(req:Request,res:Response) =>{
    const {title,description} = req.body
    
    const adminId = req.body.adminId
    if(!title || !description || !adminId){
        throw new ApiError("missing required fields",400);
    }
    try{
        const topic = await topicServices.createTopics(title,description,adminId);
        res.status(201).json(topic);
    }catch(error){
        throw new ApiError((error as Error).message || "Internal Server Error", 500)
    }
}



export const updateTopic = async(req:Request,res:Response) =>{
    const topicId = parseInt(req.params.topicId);

    const adminId = req.body.adminId

    const updateData:topicData = req.body.updateData

    if(!updateData||JSON.stringify(updateData) === '{}' || !adminId){
        throw new ApiError("missing required fields",400);
    }

    try{
        const updatedTopic = await topicServices.updateTopic(topicId,updateData,adminId);
        res.status(200).json(updatedTopic)
    }catch(error){
        throw new ApiError((error as Error).message || "Internal Server Error", 500);
    }

}

export const deleteTopic = async(req:Request,res:Response)=>{
    const topicId = parseInt(req.params.topicId);
    if(!topicId){
        throw new ApiError("missing required fields",400);
    }
    try{
        await topicServices.deleteTopic(topicId);
        res.status(200).json({
            status:"SUCCESS"
        })
    }catch(error){
        throw new ApiError((error as Error).message || "Internal Server Error", 500);
    }
}

