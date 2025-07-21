import {
  getCompletedQuestion,
  toggleQuestions,
} from "../src/controllers/progress.controller";
import * as progressServices from "../src/services/progress.service";
import { Request, Response } from "express";
import { CompletedQuestion } from "../src/generated/prisma";
import { ApiError } from "../src/utils/apiError";

beforeEach(() => {
  jest.clearAllMocks();
});

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

const baseMockCompletedQuestion: CompletedQuestion = {
  questionId: 1,
  memberId: "1",
};

describe("get coompleted questions for a member", () => {
  it("should response with 200 and mark question completed for member", async () => {
    const req = {
      params: {
        memberId: "1",
      },
    } as unknown as Request;

    const res = mockResponse();

    const spy = jest
      .spyOn(progressServices, "getCompletedQuestion")
      .mockResolvedValue([
        { questionId: baseMockCompletedQuestion.questionId },
      ]);
    await getCompletedQuestion(req, res);
    expect(spy).toHaveBeenCalledWith(req.params.memberId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "SUCCESS",
      completedQuestion: [{ questionId: baseMockCompletedQuestion.questionId }],
    });
  });

  it("should throw 400 for missing required field", async () => {
    const req = {
      params: {},
    } as unknown as Request;

    const res = mockResponse();

    await expect(getCompletedQuestion(req, res)).rejects.toThrow(
      new ApiError("required field is missing", 400),
    );
  });
});

describe("toggle questions", () => {
  it("should respond with 200 and toggle completed question ", async () => {
    const req = {
      params: {
        memberId: "1",
        questionId: "1",
      },
    } as unknown as Request;

    const res = mockResponse();
    const spy = jest
      .spyOn(progressServices, "markQuestion")
      .mockResolvedValue(baseMockCompletedQuestion);
    await toggleQuestions(req, res);
    expect(spy).toHaveBeenCalledWith(
      parseInt(req.params.questionId),
      req.params.memberId,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: "SUCCESS" });
  });

  it("should throw 400 for missing required field", async () => {
    const req = {
      params: {},
    } as unknown as Request;
    const res = mockResponse();
    await expect(toggleQuestions(req, res)).rejects.toThrow(
      new ApiError("required field is missing", 400),
    );
  });
});
