import { Request, Response } from "express";
import {
  createTopic,
  updateTopic,
  deleteTopic,
} from "../src/controllers/topic.controller";
import * as topicServices from "../src/services/topic.service";
import { ApiError } from "../src/utils/apiError";
import { Topic } from "../src/generated/prisma/browser";

beforeEach(() => {
  jest.clearAllMocks();
});

const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

const baseMockTopic: Topic = {
  id: 1,
  title: "Original Title",
  description: "Original Description",
  createdById: "1",
  createdAt: new Date("2024-01-01"),
  updatedById: "1",
  updatedAt: new Date("2025-07-19"),
};

describe("Create topic", () => {
  it("should repond with 201 and create topic", async () => {
    const req = {
      body: {
        title: "demo",
        description: "demo test to check is everything is working or not",
        adminId: "1",
      },
    } as Request;

    const res = mockResponse();

    const mockTopic: Topic = {
      id: 1,
      title: "demo",
      description: "demo test to check is everything is working or not",
      createdById: req.body.adminId,
      createdAt: new Date(),
      updatedById: req.body.adminId,
      updatedAt: new Date(),
    };

    const spy = jest
      .spyOn(topicServices, "createTopics")
      .mockResolvedValue(mockTopic);

    await createTopic(req, res);

    expect(spy).toHaveBeenCalledWith(
      req.body.title,
      req.body.description,
      req.body.adminId,
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockTopic);
  });

  it("should throw 400 for missing fields", async () => {
    const req = {
      body: {},
    } as Request;

    const res = mockResponse();

    await expect(createTopic(req, res)).rejects.toThrow(
      new ApiError("missing required fields", 400),
    );
  });
});

describe("update Topic", () => {
  it("should respond with 200 and should update topic", async () => {
    const req = {
      params: {
        topicId: 1,
      },
      body: {
        adminId: "2",
        updateData: {
          title: "updated title",
        },
      },
    } as unknown as Request;

    const res = mockResponse();

    const mockUpdated: Topic = {
      ...baseMockTopic,
      title: "updated title",
      updatedAt: new Date(),
      updatedById: req.body.adminId,
    };

    const spy = jest
      .spyOn(topicServices, "updateTopic")
      .mockResolvedValue(mockUpdated);

    await updateTopic(req, res);

    expect(spy).toHaveBeenCalledWith(
      req.params.topicId,
      req.body.updateData,
      req.body.adminId,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdated);
  });

  it("should throw 400 for missing required field", async () => {
    const req = {
      params: {
        topicId: 1,
      },
      body: {
        adminId: "2",
      },
    } as unknown as Request;
    const res = mockResponse();
    await expect(updateTopic(req, res)).rejects.toThrow(
      new ApiError("missing required fields", 400),
    );
  });
});

describe("delete topic", () => {
  it("should respond with 200 and delete topic", async () => {
    const req = {
      params: {
        topicId: 1,
      },
    } as unknown as Request;
    const res = mockResponse();

    const spy = jest
      .spyOn(topicServices, "deleteTopic")
      .mockResolvedValue(baseMockTopic);
    await deleteTopic(req, res);
    expect(spy).toHaveBeenCalledWith(req.params.topicId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: "SUCCESS" });
  });

  it("should throw 400 for missing required field", async () => {
    const req = { params: {} } as Request;
    const res = mockResponse();
    await expect(deleteTopic(req, res)).rejects.toThrow(
      new ApiError("missing required fields", 400),
    );
  });
});
