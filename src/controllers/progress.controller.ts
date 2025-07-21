import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import * as progressServices from "../services/progress.service"

export const getCompletedQuestion = async(req:Request,res:Response)=>{
    const memberId = req.params.memberId;
    if(!memberId){
        throw new ApiError("required field is missing",400);
    }

    const completedQuestion = await progressServices.getCompletedQuestion(memberId);
    res.status(200).json({
        status:"SUCCESS",
        completedQuestion
    })

}

export const toggleQuestions = async(req:Request,res:Response) =>{
    const memberId = req.params.memberId;
    const questionId = parseInt(req.params.questionId);
    if(!memberId || !questionId){
        throw new ApiError("required field is missing",400);
    }
   
    await progressServices.markQuestion(questionId,memberId);
    res.status(200).json({
        status:"SUCCESS",
    })
    
}