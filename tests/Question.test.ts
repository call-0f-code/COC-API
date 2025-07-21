import { Request,Response } from "express";
import * as questionServices from '../src/services/question.service'
import {getQuestionByTopicId,addQuestion,getQuestionByQuestionId,updateQuestion,deleteQuestion} from '../src/controllers/question.controller'
import { Question } from "../src/generated/prisma";
import { ApiError } from "../src/utils/apiError";

beforeEach(() => {
  jest.clearAllMocks();
});

const mockResponse = () =>{
    const res = {} as Response;
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res;
}

const baseMockQuestion:Question = {
    id:1,
    questionName:'demo question',
    difficulty:'Easy',
    link:'questionlink.com',
    topicId:1,
    createdById:'1',
    createdAt:new Date(),
    updatedById:'1',
    updatedAt:new Date()
}


describe('get question by Id',()=>{
    it('should respond with 200 and get the question by Id',async()=>{
        const req = {
            params:{
                topicId:1
            }
        } as unknown as Request
        
        const mockQuestions = [baseMockQuestion]
        const res = mockResponse();
        const spy = jest.spyOn(questionServices,'getQuestionByTopicId').mockResolvedValue(mockQuestions);
        await getQuestionByTopicId(req,res);

        expect(spy).toHaveBeenCalledWith(req.params.topicId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({status:"SUCCESS",questions:mockQuestions})

    })

    it('should throw error 400 for missing field',async()=>{
        const req = {
            params:{}
            
        } as unknown as Request

        const res = mockResponse();

        await expect(getQuestionByTopicId(req,res)).rejects.toThrow(new ApiError("required field missing",400));
    })
})

describe("add question",()=>{
    it("should respond with 200 and add question", async()=>{
        const req = {
            params:{
                topicId:"1"
            },
            body:{
                questionName:'demo question',
                difficulty:'Easy',
                link:'questionlink.com',
                adminId:'1'
            }
        } as unknown as Request

        const res = mockResponse();
        const spy = jest.spyOn(questionServices,'addQuestionByTopicId').mockResolvedValue(baseMockQuestion);

        await addQuestion(req,res);

        expect(spy).toHaveBeenCalledWith(req.body.adminId,parseInt(req.params.topicId),req.body.link,req.body.difficulty,req.body.questionName);

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith({
            status:"SUCCESS",
            question:baseMockQuestion
        })
        
    })

    it("should throw 400 for missing field", async()=>{
       const req = {
            params:{
                topicId:"1"
            },
            body:{
                questionName:'demo question',
                difficulty:'Easy',
                adminId:'1'
            }
        } as unknown as Request 

        const res = mockResponse();

        await expect(addQuestion(req,res)).rejects.toThrow(new ApiError("required field missing",400));
    })

})

describe('get Question by questionId',()=>{
    it('should respond with 200 and get the question by questionId',async()=>{
        const req = {
            params:{
                questionId:'1'
            }
        } as unknown as Request
        
        const res = mockResponse();
        const spy = jest.spyOn(questionServices,'getQuestionByQuestionId').mockResolvedValue(baseMockQuestion);
        await getQuestionByQuestionId(req,res);

        expect(spy).toHaveBeenCalledWith(parseInt(req.params.questionId));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({status:"SUCCESS",question:baseMockQuestion})

    })

    it('should throw error 400 for missing field',async()=>{
        const req = {
            params:{}
            
        } as unknown as Request

        const res = mockResponse();

        await expect(getQuestionByQuestionId(req,res)).rejects.toThrow(new ApiError("required field missing",400));
    })
})

describe("update question", ()=>{
    it("should respond with 200 and update question", async()=>{
        const req = {
            params:{
                questionId:"1"
            },
            body:{
                questionData:{
                    questionName:'update question',
                },
                adminId:'2'
            }
        } as unknown as Request

        const res = mockResponse();

        const updatedQuestion:Question = {
            ...baseMockQuestion,
            questionName:req.body.questionData.questionName,
            updatedAt:new Date(),
            updatedById:req.body.adminId
        }

        const spy = jest.spyOn(questionServices,'updateQuestion').mockResolvedValue(updatedQuestion);
        await updateQuestion(req,res);
        
        expect(spy).toHaveBeenCalledWith(req.body.questionData,parseInt(req.params.questionId));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({status:"SUCCESS",question:updatedQuestion})
    })

    it("should throw 400 for missing field",async()=>{
        const req = {
            params:{
                questionId:'1',
            },
            body:{
                adminId:'2'
            }
        } as unknown as Request

        const res = mockResponse();
         
        await expect(updateQuestion(req,res)).rejects.toThrow(new ApiError("required field missing",400));
    })
})

describe("delete question",()=>{
    it("should respond with 200 and delete question",async()=>{
        const req = {
            params:{
                questionId:'1',
            }
        } as unknown as Request

        const res = mockResponse();

        const spy = jest.spyOn(questionServices,'deleteQuestion').mockResolvedValue(baseMockQuestion);

        await deleteQuestion(req,res);

        expect(spy).toHaveBeenCalledWith(parseInt(req.params.questionId));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ status:"SUCCESS"})
    })

    it("should throw 400 for missing field", async()=>{
        const req = {
            params:{

            }
        } as unknown as Request

        const res = mockResponse();
        await expect(deleteQuestion(req,res)).rejects.toThrow(new ApiError("required field missing ",400))
    })
})