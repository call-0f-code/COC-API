import { Request, Response } from 'express';
import { createAMember, updateAMember } from '../src/controllers/member.controller';
import * as memberService from '../src/services/member.service';
import { ApiError } from '../src/utils/apiError';
import { SupabaseClient } from '@supabase/supabase-js';
import { uploadImage } from '../src/utils/imageUtils';

jest.mock('../src/db/client', () => ({
  prisma: {
    member: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('../src/utils/imageUtils');
const mockSupabase = {} as SupabaseClient;

const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('Member Controller, createAMember', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with 201 and created member', async () => { 
    const req = {
      body: {
        email: 'shruti@example.com',
        name: 'Shruti',
        password: 'password123',
        passoutYear: '2026',
      },
      file: undefined,
    } as unknown as Request;

    const res = mockResponse();

    const mockUser = { id: '1', ...req.body };
    jest.spyOn(memberService, 'createMember').mockResolvedValue(mockUser);

    const handler = createAMember(mockSupabase);
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(201); 
    expect(res.json).toHaveBeenCalledWith({ success: true, user: mockUser });
  });

  it('should throw 402 if required fields are missing', async () => {
    const req = { body: {} } as Request;
    const res = mockResponse();
    const handler = createAMember(mockSupabase);

    await expect(handler(req, res)).rejects.toThrow(new ApiError('Required fields absent', 402));
  });
});

describe('Member Controller - updateAMember', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update member and return updated data (no image)', async () => {
    const req = {
      params: { memberId: 'abc-123' },
      body: { memberData: JSON.stringify({ github: 'https://github.com/shrutii' })  },
      file: undefined,
    } as unknown as Request;

    const res = mockResponse();

    const updatedMember = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      phone: null,
      bio: null,
      profilePhoto: null,
      github: 'https://github.com/shrutii',
      linkedin: null,
      twitter: null,
      leetcode: null,
      codeforces: null,
      codechef: null,
      gfg: null,
      geeksforgeeks: null,
      passoutYear: new Date('2025-05-31'),
      isManager: false,
      isApproved: false,
      approvedById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const spyUpdate = jest.spyOn(memberService, 'updateMember').mockResolvedValue(updatedMember);
    const spyGet = jest.spyOn(memberService, 'getDetails').mockResolvedValue(updatedMember);

    const handler = updateAMember(mockSupabase);
    await handler(req, res);

    expect(spyUpdate).toHaveBeenCalledWith('abc-123', { github: 'https://github.com/shrutii' });
    expect(spyGet).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: updatedMember,
    });
  });

  it('should upload new image, handle old image, update member, and return updated data', async () => {
    const req = {
      params: { memberId: 'abc-123' },
      body: { memberData: JSON.stringify({}) },
      file: { buffer: Buffer.from('fake-image-data') },
    } as unknown as Request;

    const res = mockResponse();

    const oldMember = {
      id: '123',
      name: 'Old User',
      email: 'old@example.com',
      phone: null,
      bio: null,
      profilePhoto: 'https://old.url/image.png',
      github: null,
      linkedin: null,
      twitter: null,
      leetcode: null,
      codeforces: null,
      codechef: null,
      gfg: null,
      geeksforgeeks: null,
      passoutYear: new Date('2025-05-31'),
      isManager: false,
      isApproved: false,
      approvedById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedMember = {
      ...oldMember,
      profilePhoto: 'https://new.url/image.png',
    };

    (uploadImage as jest.Mock)
      .mockResolvedValueOnce('https://new.url/image.png'); 

    jest.spyOn(memberService, 'getDetails')
      .mockResolvedValueOnce(oldMember) 
      .mockResolvedValueOnce(updatedMember); 

    const spyUpdate = jest
      .spyOn(memberService, 'updateMember')
      .mockResolvedValue(updatedMember);

    const handler = updateAMember(mockSupabase);
    await handler(req, res);

    expect(uploadImage).toHaveBeenCalledWith(
      mockSupabase,
      req.file,
      'members',
      'https://old.url/image.png'
    );


    expect(spyUpdate).toHaveBeenCalledWith('abc-123', {

    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: updatedMember,
    });
  });
});
