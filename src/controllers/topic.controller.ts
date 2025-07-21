import { Request, Response } from 'express'
import * as topicServices from '../services/topic.service'
import { ApiError } from '../utils/apiError';


export const getTopics = async (req: Request, res: Response) => {

    const topics = await topicServices.getTopics();

    res.status(201).json(topics)

}



export const createTopic = async (req: Request, res: Response) => {
    const { title, description } = req.body

    const adminId = req.body.adminId
    if (!title || !description || !adminId) {
        throw new ApiError("missing required fields", 400);
    }
    const topic = await topicServices.createTopics(title, description, adminId);
    res.status(201).json(topic);

}



export const updateTopic = async (req: Request, res: Response) => {
    const topicId = parseInt(req.params.topicId);

    const adminId = req.body.adminId

    const updateData: topicData = req.body.updateData

    if (!updateData || JSON.stringify(updateData) === '{}' || !adminId) {
        throw new ApiError("missing required fields", 400);
    }


    const updatedTopic = await topicServices.updateTopic(topicId, updateData, adminId);
    res.status(200).json(updatedTopic)


}

export const deleteTopic = async (req: Request, res: Response) => {
    const topicId = parseInt(req.params.topicId);
    if (!topicId) {
        throw new ApiError("missing required fields", 400);
    }

    await topicServices.deleteTopic(topicId);
    res.status(200).json({
        status: "SUCCESS"
    })

}

