import { Request, Response } from 'express'
import * as questionServices from '../services/question.service'
import { ApiError } from '../utils/apiError';


export const getQuestionByTopicId = async (req: Request, res: Response) => {
    const topicId = parseInt(req.params.topicId);
    if (!topicId) {
        throw new ApiError("required field missing", 400);
    }
    
    const questions = await questionServices.getQuestionByTopicId(topicId);

    res.status(200).json({
        status: "SUCCESS",
        questions
    })


}


export const addQuestion = async (req: Request, res: Response) => {

    const topicId = parseInt(req.params.topicId);
    const { questionName, difficulty, link } = req.body
    const adminId = req.body.adminId;

    if (!questionName || !difficulty || !link || !adminId || !topicId) {
        throw new ApiError("required field missing", 400);
    }

    const question = await questionServices.addQuestionByTopicId(adminId, topicId, link, difficulty, questionName);
    res.status(201).json({
        status: "SUCCESS",
        question
    })


}

export const getQuestionByQuestionId = async (req: Request, res: Response) => {
    const questionId = parseInt(req.params.questionId);
    if (!questionId) {
        throw new ApiError("required field missing", 400);
    }

    const question = await questionServices.getQuestionByQuestionId(questionId);

    if (!question) {
        throw new ApiError("No question found with this ID", 404);
    }
    res.status(200).json({
        status: "SUCCESS",
        question
    })



}


export const updateQuestion = async (req: Request, res: Response) => {
    const questionId = parseInt(req.params.questionId);

    const adminId = req.body.adminId;
    const questionData: questionData = req.body.questionData;

    if (!questionData || JSON.stringify(questionData) === "{}" || !adminId) {
        throw new ApiError("required field missing", 400);
    }
    questionData.updatedById = adminId;

    const question = await questionServices.updateQuestion(questionData, questionId);

    if (!question) {
        throw new ApiError("No question found with this ID", 404);
    }

    res.status(200).json({
        status: "SUCCESS",
        question
    })

}

export const deleteQuestion = async (req: Request, res: Response) => {
    const questionId = parseInt(req.params.questionId);
    if (!questionId) {
        throw new ApiError("required field missing ", 400);
    }


    await questionServices.deleteQuestion(questionId);

    res.status(200).json({
        status: "SUCCESS"
    })

}

