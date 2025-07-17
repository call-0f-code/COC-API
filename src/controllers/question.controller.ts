import { Request, Response } from 'express'
import * as questionServices from '../services/question.service'
import { ApiError } from '../utils/apiError';


export const getQuestionByTopicId = async(req:Request,res:Response)=>{
    const topicId = parseInt(req.params.topicId);
    if(!topicId){
        throw new ApiError("required field missing",400);
    }

    try{
        const questions = await questionServices.getQuestionByTopicId(topicId);
        res.status(200).json({
            status:"SUCCESS",
            questions
        })
    }catch(error){
        throw new ApiError(error as string);
    }
}

export const addQuestion = async(req:Request,res:Response)=>{
    const topicId = parseInt(req.params.topicId);
    const {questionName,difficulty,link} = req.body
    const adminId = req.body.adminId;
    if(!questionName || !difficulty || !link || !adminId || !topicId){
        throw new ApiError("required field missing",400);
    }

    try{
        const question = await questionServices.addQuestionByTopicId(adminId,topicId,link,difficulty,questionName);
        res.status(200).json({
            status:"SUCCESS",
            question
        })
    }catch(error){
        throw new ApiError(error as string ,500);
    }

}

export const getQuestionByQuestionId = async(req:Request,res:Response)=>{
    const questionId = parseInt(req.params.questionId);
    if( !questionId){
        throw new ApiError("required field missing",400);
    }

    try{
        const question = await questionServices.getQuestionByQuestionId(questionId);
        res.status(200).json({
            status:"SUCCESS",
            question
        })
    }catch(error){
        throw new ApiError(error as string ,500)
    }

}


export const updateQuestion = async(req:Request,res:Response)=>{
    const questionId = parseInt(req.params.questionId);
    // req.body.adminId -> req.body
    const adminId = req.body.adminId;
    const questionData:questionData = req.body;
    questionData.id = questionId
console.log(questionData + " " + adminId)
    if(!questionData || adminId){
        throw new ApiError("required field missing",400);
    }

    try{
        const question  = await questionServices.updateQuestion(questionData);
        res.status(200).json({
            status:"SUCCESS",
            question
        })
    }catch(error){
        throw new ApiError(error as string ,500)
    }
}

export const deleteQuestion = async(req:Request , res:Response) =>{
    const questionId = parseInt(req.body.questionId);
    if(!questionId){
        throw new ApiError("required field missing ",400);
    }

    try{
        await questionServices.deleteQuestion(questionId);
        res.status(200).json({
            status:"SUCCESS"
        })
    }catch(error){
        throw new ApiError(error as string,500);
    }
}

export const getCompletedQuestion = async(req:Request,res:Response)=>{
    const memberId = req.params.memberId;
    if(!memberId){
        throw new ApiError("required field is missing",400);
    }

    try{
        const completedQuestion = await questionServices.getCompletedQuestion(memberId);
        res.status(200).json({
            status:"SUCCESS",
            completedQuestion
        })
    }catch(error){
        throw new ApiError(error as string, 500);
    }
}

export const toggleQuestions = async(req:Request,res:Response) =>{
    const {memberId} = req.params;
    const questionId = parseInt(req.params.questionId);
    if(!memberId || !questionId){
        throw new ApiError("required field is missing",400);
    }
    try{
        await questionServices.markQuestion(questionId,memberId);
        res.status(200).json({
            status:"SUCCESS",
        })
    }catch(error){
        throw new ApiError(error as string, 500);
    }
}