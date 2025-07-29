import { createAchievement, getAchievements, getAchievementById, updateAchievementById, deleteAchievementById, removeMemberFromAchievement } from '../src/controllers/achievement.controller';
import * as achievementService from '../src/services/achievement.service';
import { uploadImage, deleteImage } from '../src/utils/imageUtils';
import { ApiError } from '../src/utils/apiError';

jest.mock('../src/app', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'fake-path' }, error: null }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
  },
}));


jest.mock('../src/routes/achievements', () => {
  return {
    __esModule: true,
    default: jest.fn(() => require('express').Router()),
  };
});

jest.mock('../src/utils/imageUtils', () => ({
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
}));


const mockedUploadImage = uploadImage as jest.Mock;

describe('createAchievement (with image upload)', () => {
  it('should return 201 and created achievement with uploaded image URL', async () => {
    const req: any = {
      file: {
        originalname: 'maze.png',
        buffer: Buffer.from('test'),
      },
      body: {
        achievementData: {
          title: 'Maze Master',
          description: 'Completed the final maze',
          achievedAt: '2025-07-19T10:00:00.000Z',
          createdById: 'admin_123',
          memberIds: ['user_1', 'user_2'],
        },
      },
    };

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const imageUrl = 'https://example.com/uploaded/maze.png';

    const mockAchievement = {
      id: 1,
      title: 'Maze Master',
      description: 'Completed the final maze',
      achievedAt: new Date('2025-07-19T10:00:00.000Z'),
      createdById: 'admin_123',
      imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedById: null,
      members: [
        { memberId: 'user_1' },
        { memberId: 'user_2' },
      ],
    };

    mockedUploadImage.mockResolvedValue(imageUrl);
    jest.spyOn(achievementService, 'createAchievement').mockResolvedValue(mockAchievement);

    await createAchievement(req, res);

    expect(mockedUploadImage).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockAchievement,
    });
  });

  it('should throw 400 if file is missing', async () => {
    const req: any = {
      file: undefined,
      body: {
        achievementData: {
          title: 'Maze Master',
          description: 'Completed the final maze',
          achievedAt: '2025-07-19T10:00:00.000Z',
          createdById: 'admin_123',
          memberIds: ['user_1', 'user_2'],
        },
      },
    };

    const res: any = {};
    await expect(createAchievement(req, res)).rejects.toThrow(ApiError);
  });

  it('should throw 400 if required fields are missing', async () => {
    const req: any = {
      file: {
        originalname: 'maze.png',
        buffer: Buffer.from('test'),
      },
      body: {
        achievementData: {
          title: '',
          description: '',
          achievedAt: '',
          createdById: '',
          memberIds: ['user_1'],
        },
      },
    };

    const res: any = {};
    mockedUploadImage.mockResolvedValue('https://example.com/maze.png');
    await expect(createAchievement(req, res)).rejects.toThrow(ApiError);
  });

  it('should throw 400 if memberIds is not an array', async () => {
    const req: any = {
      file: {
        originalname: 'maze.png',
        buffer: Buffer.from('test'),
      },
      body: {
        achievementData: {
          title: 'Maze Master',
          description: 'Completed the final maze',
          achievedAt: '2025-07-19T10:00:00.000Z',
          createdById: 'admin_123',
          memberIds: 'not-an-array',
        },
      },
    };

    const res: any = {};
    mockedUploadImage.mockResolvedValue('https://example.com/maze.png');
    await expect(createAchievement(req, res)).rejects.toThrow(ApiError);
  });
});


describe('getAchievements', () => {
  it('should return 200 and all achievements', async () => {
    const req: any = {};

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockAchievements = [
      {
        id: 1,
        title: 'Maze Master',
        description: 'Completed the final maze',
        achievedAt: new Date('2025-07-19T10:00:00.000Z'),
        imageUrl: 'https://example.com/maze.png',
        createdById: 'admin_123',
        createdAt: new Date(),
        updatedById: null,
        updatedAt: new Date(),
        members: [
          { memberId: 'user_1' },
          { memberId: 'user_2' },
        ],
      },
    ];

    jest.spyOn(achievementService, 'getAchievements').mockResolvedValue(mockAchievements);

    await getAchievements(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: mockAchievements.length,
      data: mockAchievements,
    });
  });
});


describe('getAchievementById', () => {
  it('should return 200 and the achievement with given ID', async () => {
    const req: any = {
      params: {
        achievementId: '1',
      },
    };

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockAchievement = {
      id: 1,
      title: 'Maze Master',
      description: 'Completed the final maze',
      achievedAt: new Date('2025-07-19T10:00:00.000Z'),
      imageUrl: 'https://example.com/maze.png',
      createdById: 'admin_123',
      createdAt: new Date(),
      updatedById: null,
      updatedAt: new Date(),
      createdBy: {
        id: 'admin_123',
        name: 'Admin',
      },
      updatedBy: null,
      members: [
        {
          member: {
            id: 'user_1',
            name: 'User One',
            email: 'user1@example.com',
            profilePhoto: null,
          },
        },
        {
          member: {
            id: 'user_2',
            name: 'User Two',
            email: 'user2@example.com',
            profilePhoto: null,
          },
        },
      ],
    };

    jest
      .spyOn(achievementService, 'getAchievementById')
      .mockResolvedValue(mockAchievement);

    await getAchievementById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockAchievement,
    });
  });

  it('should throw 400 for invalid ID', async () => {
    const req: any = {
      params: {
        achievementId: 'abc', 
      },
    };

    const res: any = {};

    await expect(getAchievementById(req, res)).rejects.toThrow(ApiError);
  });

  it('should throw 404 if achievement not found', async () => {
    const req: any = {
      params: {
        achievementId: '999',
      },
    };

    const res: any = {};

    jest
      .spyOn(achievementService, 'getAchievementById')
      .mockResolvedValue(null);

    await expect(getAchievementById(req, res)).rejects.toThrow(ApiError);
  });
});

describe('updateAchievementById', () => {
  const baseAchievement = {
    id: 1,
    title: 'Old Title',
    description: 'Old Description',
    achievedAt: new Date('2025-07-10T00:00:00.000Z'),
    imageUrl: 'https://example.com/old-image.png',
    createdById: 'admin_123',
    updatedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: { id: 'admin_123', name: 'Admin' },
    updatedBy: null,
    members: [],
  };

  const mockRes: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update all fields successfully (200)', async () => {
    const updatedAchievement = { ...baseAchievement, title: 'Updated', updatedById: 'admin_456' };
    const mockReq: any = {
      params: { achievementId: '1' },
      file: { originalname: 'img.png', buffer: Buffer.from('123') },
      body: {
        achievementData: JSON.stringify({
          title: 'Updated',
          updatedById: 'admin_456',
          memberIds: ['user_2'],
        }),
      },
    };

    mockedUploadImage.mockResolvedValue('https://updated.com/img.png');
    jest.spyOn(achievementService, 'getAchievementById').mockResolvedValue(baseAchievement);
    jest.spyOn(achievementService, 'updateAchievementById').mockResolvedValue(updatedAchievement);
    jest.spyOn(achievementService, 'addMembersToAchievement').mockResolvedValue(undefined);

    await updateAchievementById(mockReq, mockRes);

    expect(mockedUploadImage).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: updatedAchievement,
    });
  });

  it('should update only title', async () => {
    const mockReq: any = {
      params: { achievementId: '1' },
      body: {
        achievementData: JSON.stringify({ title: 'New Title', updatedById: 'admin_456' }),
      },
    };

    jest.spyOn(achievementService, 'getAchievementById').mockResolvedValue(baseAchievement);
    jest.spyOn(achievementService, 'updateAchievementById').mockResolvedValue({
      ...baseAchievement,
      title: 'New Title',
    });

    await updateAchievementById(mockReq, mockRes);
    expect(achievementService.updateAchievementById).toHaveBeenCalledWith(1, expect.objectContaining({
      title: 'New Title',
      updatedById: 'admin_456',
    }));
  });

  it('should update only image', async () => {
    const mockReq: any = {
      params: { achievementId: '1' },
      file: { originalname: 'img.png', buffer: Buffer.from('abc') },
      body: {
        achievementData: JSON.stringify({ updatedById: 'admin_456' }),
      },
    };

    mockedUploadImage.mockResolvedValue('https://updated.com/img.png');
    jest.spyOn(achievementService, 'getAchievementById').mockResolvedValue(baseAchievement);
    jest.spyOn(achievementService, 'updateAchievementById').mockResolvedValue({
      ...baseAchievement,
      imageUrl: 'https://updated.com/img.png',
      updatedById: 'admin_456',
    });

    await updateAchievementById(mockReq, mockRes);
    expect(mockedUploadImage).toHaveBeenCalled();
  });

  it('should update only memberIds', async () => {
    const mockReq: any = {
      params: { achievementId: '1' },
      body: {
        achievementData: JSON.stringify({ updatedById: 'admin_456', memberIds: ['user_3'] }),
      },
    };

    jest.spyOn(achievementService, 'getAchievementById').mockResolvedValue(baseAchievement);
    jest.spyOn(achievementService, 'updateAchievementById').mockResolvedValue({
      ...baseAchievement,
      updatedById: 'admin_456',
    });
    jest.spyOn(achievementService, 'addMembersToAchievement').mockResolvedValue(undefined);

    await updateAchievementById(mockReq, mockRes);
    expect(achievementService.addMembersToAchievement).toHaveBeenCalledWith(1, ['user_3']);
  });

  it('should return 400 if updatedById is missing', async () => {
    const mockReq: any = {
      params: { achievementId: '1' },
      body: {
        achievementData: JSON.stringify({ title: 'No Updater' }),
      },
    };

    await expect(updateAchievementById(mockReq, mockRes)).rejects.toThrow(ApiError);
  });

  it('should return 400 if achievementId is invalid', async () => {
    const mockReq: any = {
      params: { achievementId: 'abc' },
      body: {
        achievementData: JSON.stringify({ title: 'Updated', updatedById: 'admin_456' }),
      },
    };

    await expect(updateAchievementById(mockReq, mockRes)).rejects.toThrow(ApiError);
  });

  it('should return 404 if achievement not found', async () => {
    const mockReq: any = {
      params: { achievementId: '999' },
      body: {
        achievementData: JSON.stringify({ title: 'Missing', updatedById: 'admin_456' }),
      },
    };

    jest.spyOn(achievementService, 'getAchievementById').mockResolvedValue(null);

    await expect(updateAchievementById(mockReq, mockRes)).rejects.toThrow(ApiError);
  });

  it('should return 400 if no fields are provided for update', async () => {
    const mockReq: any = {
      params: { achievementId: '1' },
      body: {
        achievementData: JSON.stringify({ updatedById: 'admin_456' }),
      },
    };

    jest.spyOn(achievementService, 'getAchievementById').mockResolvedValue(baseAchievement);

    await expect(updateAchievementById(mockReq, mockRes)).rejects.toThrow(ApiError);
  });

  it('should return 400 if achievementData is invalid JSON', async () => {
    const mockReq: any = {
      params: { achievementId: '1' },
      body: {
        achievementData: '{ invalid JSON }',
      },
    };

    await expect(updateAchievementById(mockReq, mockRes)).rejects.toThrow(ApiError);
  });
});

const mockedDeleteImage = deleteImage as jest.Mock;

describe('deleteAchievementById', () => {
  it('should delete the achievement and return 200 success message', async () => {
    const req: any = {
      params: {
        achievementId: '1',
      },
    };

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockDeletedAchievement = {
      id: 1,
      title: 'Maze Master',
      description: 'Completed the final maze',
      achievedAt: new Date('2025-07-19T10:00:00.000Z'),
      imageUrl: 'https://example.com/maze.png',
      createdById: 'admin_123',
      createdAt: new Date(),
      updatedById: null,
      updatedAt: new Date(),

      createdBy: { id: 'admin_123', name: 'Admin' },
      updatedBy: null,
      members: [],
    };

    jest
      .spyOn(achievementService, 'getAchievementById')
      .mockResolvedValue(mockDeletedAchievement);

    jest
      .spyOn(achievementService, 'deleteAchievementById')
      .mockResolvedValue(mockDeletedAchievement);

    mockedDeleteImage.mockResolvedValue(undefined);

    await deleteAchievementById(req, res);

    expect(achievementService.getAchievementById).toHaveBeenCalledWith(1);
    expect(mockedDeleteImage).toHaveBeenCalledWith(expect.anything(), mockDeletedAchievement.imageUrl);
    expect(achievementService.deleteAchievementById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Achievement deleted successfully',
    });
  });

  it('should throw 400 if achievementId is invalid', async () => {
    const req: any = {
      params: {
        achievementId: 'invalid',
      },
    };
    const res: any = {};

    await expect(deleteAchievementById(req, res)).rejects.toThrow(ApiError);
  });
});


describe('removeMemberFromAchievement', () => {
  it('should remove a member from achievement and return 200', async () => {
    const req: any = {
      params: {
        achievementId: '1',
        memberId: 'user_1',
      },
    };

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
      .spyOn(achievementService, 'removeMemberFromAchievement')
      .mockResolvedValue({
        memberId: 'user_1',
        achievementId: 1,
      });

    await removeMemberFromAchievement(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Member removed from achievement successfully',
    });
  });

  it('should throw 400 for invalid achievement ID', async () => {
    const req: any = {
      params: {
        achievementId: 'invalid',
        memberId: 'user_1',
      },
    };

    const res: any = {};

    await expect(removeMemberFromAchievement(req, res)).rejects.toThrow(ApiError);
  });

  it('should throw 400 if member ID is missing', async () => {
    const req: any = {
      params: {
        achievementId: '1',
        memberId: '', 
      },
    };

    const res: any = {};

    await expect(removeMemberFromAchievement(req, res)).rejects.toThrow(ApiError);
  });
});
