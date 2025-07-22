import { getInterviews, getInterviewById, createInterview, updateInterviewById, deleteInterviewById} from '../src/controllers/interview.controller';
import * as interviewService from '../src/services/interview.service';
import { ApiError } from '../src/utils/apiError';
import { Verdict } from '../src/generated/prisma';

describe('getInterviews', () => {
  it('should return 200 and all interviews', async () => {
    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockInterviews = [
      {
        id: 1,
        company: 'Google',
        role: 'SWE',
        verdict: Verdict.Selected,
        content: 'Great experience',
        isAnonymous: false,
        memberId: 'member123',
      },
    ];

    jest
      .spyOn(interviewService, 'getInterviews')
      .mockResolvedValue(mockInterviews);

    await getInterviews(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockInterviews,
    });
  });
});


describe('getInterviewById', () => {
  it('should return 200 and the interview if found', async () => {
    const req: any = {
      params: {
        id: '1',
      },
    };

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockInterview = {
      id: 1,
      company: 'Google',
      role: 'SWE',
      verdict: Verdict.Selected,
      content: 'Great interview experience',
      isAnonymous: false,
      memberId: 'user_123',
    };

    jest
      .spyOn(interviewService, 'getInterviewById')
      .mockResolvedValue(mockInterview);

    await getInterviewById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockInterview,
    });
  });

  it('should throw 400 if ID is invalid', async () => {
    const req: any = {
      params: {
        id: 'abc',
      },
    };
    const res: any = {};

    await expect(getInterviewById(req, res)).rejects.toThrow(ApiError);
  });

  it('should throw 404 if interview is not found', async () => {
    const req: any = {
      params: {
        id: '99',
      },
    };
    const res: any = {};

    jest
      .spyOn(interviewService, 'getInterviewById')
      .mockResolvedValue(null);

    await expect(getInterviewById(req, res)).rejects.toThrow(ApiError);
  });
});


describe('createInterview', () => {
  it('should return 201 and created interview', async () => {
    const req: any = {
      params: {
        memberId: 'user_123',
      },
      body: {
        company: 'Google',
        role: 'SWE',
        verdict: Verdict.Selected,
        content: 'Amazing process',
        isAnonymous: false,
      },
    };

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockInterview = {
      id: 1,
      ...req.body,
      memberId: req.params.memberId,
    };

    jest
      .spyOn(interviewService, 'createInterview')
      .mockResolvedValue(mockInterview);

    await createInterview(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockInterview,
    });
  });

  it('should throw 400 if memberId is missing', async () => {
    const req: any = {
      params: {},
      body: {
        company: 'Google',
        role: 'SWE',
        verdict: Verdict.Selected,
        content: 'Great interview',
        isAnonymous: true,
      },
    };

    const res: any = {};
    await expect(createInterview(req, res)).rejects.toThrow(ApiError);
  });

  it('should throw 400 if required fields are missing', async () => {
    const req: any = {
      params: {
        memberId: 'user_123',
      },
      body: {
        company: '',
        role: '',
        verdict: '',
        content: '',
        isAnonymous: undefined,
      },
    };

    const res: any = {};
    await expect(createInterview(req, res)).rejects.toThrow(ApiError);
  });
});


describe('updateInterviewById', () => {
  it('should return 200 and updated interview', async () => {
    const req: any = {
      params: {
        id: '1',
      },
      body: {
        memberId: 'user_123',
        company: 'Microsoft',
        content: 'Updated content',
      },
    };

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const existingInterview = {
      id: 1,
      memberId: 'user_123',
      company: 'Google',
      role: 'SDE',
      verdict: Verdict.Selected,
      content: 'Original content',
      isAnonymous: false,
    };

    const updatedInterview = {
      ...existingInterview,
      company: 'Microsoft',
      content: 'Updated content',
    };

    jest
      .spyOn(interviewService, 'getInterviewById')
      .mockResolvedValue(existingInterview);

    jest
      .spyOn(interviewService, 'updateInterviewById')
      .mockResolvedValue(updatedInterview);

    await updateInterviewById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: updatedInterview,
    });
  });

  it('should throw 400 for invalid interview ID', async () => {
    const req: any = {
      params: { id: 'abc' },
      body: {},
    };

    const res: any = {};
    await expect(updateInterviewById(req, res)).rejects.toThrow(ApiError);
  });

  it('should throw 404 if interview not found', async () => {
    const req: any = {
      params: { id: '99' },
      body: {
        memberId: 'user_123',
        company: 'Test',
      },
    };

    const res: any = {};

    jest
      .spyOn(interviewService, 'getInterviewById')
      .mockResolvedValue(null);

    await expect(updateInterviewById(req, res)).rejects.toThrow(ApiError);
  });

  it('should throw 403 if memberId does not match', async () => {
    const req: any = {
      params: { id: '1' },
      body: {
        memberId: 'wrong_user',
        company: 'Test',
      },
    };

    const res: any = {};

    jest
      .spyOn(interviewService, 'getInterviewById')
      .mockResolvedValue({
        id: 1,
        memberId: 'user_123',
        company: 'Google',
        role: 'SDE',
        verdict: Verdict.Selected,
        content: 'text',
        isAnonymous: false,
      });

    await expect(updateInterviewById(req, res)).rejects.toThrow(ApiError);
  });

  it('should throw 400 if memberId is missing', async () => {
    const req: any = {
      params: { id: '1' },
      body: {
        company: 'Test',
      },
    };

    const res: any = {};
    await expect(updateInterviewById(req, res)).rejects.toThrow(ApiError);
  });

  it('should throw 400 if no fields to update are provided', async () => {
    const req: any = {
      params: { id: '1' },
      body: {
        memberId: 'user_123',
      },
    };

    const res: any = {};
    await expect(updateInterviewById(req, res)).rejects.toThrow(ApiError);
  });
});


describe('deleteInterviewById', () => {
  it('should return 200 and success message', async () => {
    const req: any = {
      params: {
        id: '1',
      },
    };

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockInterview = {
      id: 1,
      company: 'Google',
      role: 'SDE',
      verdict: Verdict.Selected,
      content: 'Great experience',
      isAnonymous: false,
      memberId: 'user_123',
    };

    jest
      .spyOn(interviewService, 'getInterviewById')
      .mockResolvedValue(mockInterview);

    jest
      .spyOn(interviewService, 'deleteInterviewById')
      .mockResolvedValue();

    await deleteInterviewById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Interview experience deleted successfully',
    });
  });

  it('should throw 400 for invalid interview ID', async () => {
    const req: any = {
      params: { id: 'invalid' },
    };

    const res: any = {};
    await expect(deleteInterviewById(req, res)).rejects.toThrow(ApiError);
  });

  it('should throw 404 if interview not found', async () => {
    const req: any = {
      params: { id: '999' },
    };

    const res: any = {};

    jest
      .spyOn(interviewService, 'getInterviewById')
      .mockResolvedValue(null);

    await expect(deleteInterviewById(req, res)).rejects.toThrow(ApiError);
  });
});