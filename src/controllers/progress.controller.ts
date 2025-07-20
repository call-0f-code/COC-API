import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import * as progressServices from "../services/progress.service"

export const getCompletedQuestion = async(req:Request,res:Response)=>{
    const memberId = req.params.memberId;
    if(!memberId){
        throw new ApiError("required field is missing",400);
    }

    try{
        const completedQuestion = await progressServices.getCompletedQuestion(memberId);
        res.status(200).json({
            status:"SUCCESS",
            completedQuestion
        })


    }catch(error){
        throw new ApiError(error as string, 500);
    }
}

export const toggleQuestions = async(req:Request,res:Response) =>{
    const memberId = req.params.memberId;
    const questionId = parseInt(req.params.questionId);
    if(!memberId || !questionId){
        throw new ApiError("required field is missing",400);
    }
    try{
        await progressServices.markQuestion(questionId,memberId);
        res.status(200).json({
            status:"SUCCESS",
        })
    }catch(error){
        throw new ApiError(error as string, 500);
    }
}