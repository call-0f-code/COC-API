import { Request, Response } from 'express';
import { createAMember, updateAMember, ghostMember, getDeadZoneMembers } from '../src/controllers/member.controller';
import * as memberService from '../src/services/member.service';
import { ApiError } from '../src/utils/apiError';
import { SupabaseClient } from '@supabase/supabase-js';
import { uploadImage } from '../src/utils/imageUtils';
import { Role } from '../src/db/client';


jest.mock('../src/db/client', () => ({
  ...jest.requireActual('../src/db/client'),
  prisma: {
    member: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    account: {
      findFirst: jest.fn(),
      update: jest.fn(),
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
        provider: 'credentials'
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
      body: { memberData: JSON.stringify({ github: 'https://github.com/shrutii' }) },
      file: undefined,
    } as unknown as Request;

    const res = mockResponse();

    const role = Role.MEMBER
    const updatedMember = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      github: 'https://github.com/shrutii',
      birth_date: null,
      profilePhoto: null,
      phone: null,
      bio: null,
      linkedin: null,
      twitter: null,
      leetcode: null,
      codeforces: null,
      codechef: null,
      gfg: null,
      geeksforgeeks: null,
      passoutYear: new Date('2025-05-31'),
      role: role,
      isApproved: false,
      approvedById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isGhosted: false,
      ghostedById: null,
      ghostedAt: null,
    };

    jest.spyOn(memberService, 'updateMember').mockResolvedValue(updatedMember);
    jest.spyOn(memberService, 'getDetails').mockResolvedValue(updatedMember);

    const handler = updateAMember(mockSupabase);
    await handler(req, res);

    expect(memberService.updateMember).toHaveBeenCalledWith('abc-123', { github: 'https://github.com/shrutii' });
    expect(memberService.getDetails).toHaveBeenCalledTimes(1);
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

    const role = Role.MEMBER
    const oldMember = {
      id: '123',
      name: 'Old User',
      email: 'old@example.com',
      phone: null,
      birth_date: null,
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
      role: role,
      isApproved: false,
      approvedById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isGhosted: false,
      ghostedById: null,
      ghostedAt: null,
    };

    const updatedMember = {
      ...oldMember,
      profilePhoto: 'https://new.url/image.png',
    };

    (uploadImage as jest.Mock).mockResolvedValueOnce('https://new.url/image.png');

    jest.spyOn(memberService, 'getDetails')
      .mockResolvedValueOnce(oldMember)
      .mockResolvedValueOnce(updatedMember);

    jest.spyOn(memberService, 'updateMember')
      .mockResolvedValue(updatedMember);

    const handler = updateAMember(mockSupabase);
    await handler(req, res);

    expect(uploadImage).toHaveBeenCalledWith(
      mockSupabase,
      req.file,
      'members',
      'https://old.url/image.png'
    );

    expect(memberService.updateMember).toHaveBeenCalledWith('abc-123', {
      profilePhoto: 'https://new.url/image.png',
    });


    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: updatedMember,
    });
  });

   it('should update password when password is provided in memberData', async () => {
    const req = {
      params: { memberId: 'abc-123' },
      body: { memberData: JSON.stringify({ password: 'newSecurePass123' }) },
      file: undefined,
    } as unknown as Request;

    const res = mockResponse();

    const role:Role = Role.MEMBER
    const updatedMember = {
      id: '123',
      name: 'Updated User',
      email: 'updated@example.com',
      profilePhoto: null,
      birth_date: null,
      github: null,
      phone: null,
      bio: null,
      linkedin: null,
      twitter: null,
      leetcode: null,
      codeforces: null,
      codechef: null,
      gfg: null,
      geeksforgeeks: null,
      passoutYear: new Date('2025-05-31'),
      role: role,
      isApproved: false,
      approvedById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isGhosted: false,
      ghostedById: null,
      ghostedAt: null,
    };

    // Mock updatePassword and getDetails
    jest.spyOn(memberService, 'updatePassword').mockResolvedValue({} as any);
    jest.spyOn(memberService, 'getDetails').mockResolvedValue(updatedMember);

    const handler = updateAMember(mockSupabase);
    await handler(req, res);

    expect(memberService.updatePassword).toHaveBeenCalledWith('abc-123', 'newSecurePass123');
    expect(memberService.getDetails).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: updatedMember,
    });
  });
});

// Dead Zone (Ghost) feature
const makeBaseMember = (overrides: Record<string, unknown> = {}) => ({
  id: 'member-123',
  name: 'Test User',
  email: 'test@example.com',
  birth_date: null,
  phone: null,
  bio: null,
  profilePhoto: null,
  github: null,
  linkedin: null,
  twitter: null,
  leetcode: null,
  codeforces: null,
  codechef: null,
  gfg: null,
  geeksforgeeks: null,
  passoutYear: new Date('2025-05-31'),
  role: Role.MEMBER,
  isApproved: false,
  isGhosted: false,
  approvedById: null,
  ghostedById: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('Member Controller - ghostMember', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should ghost a member and return 200', async () => {
    const req = {
      params: { memberId: 'member-123' },
      body: { adminId: 'admin-456', ghost: true },
    } as unknown as Request;
    const res = mockResponse();

    const ghosted = makeBaseMember({ isGhosted: true, ghostedById: 'admin-456' });
    jest.spyOn(memberService, 'ghostMember').mockResolvedValue(ghosted);

    await ghostMember(req, res);

    expect(memberService.ghostMember).toHaveBeenCalledWith('admin-456', 'member-123', true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: ghosted,
      message: 'Member ghosted and moved to Dead Zone',
    });
  });

  it('should unghost a member when ghost=false', async () => {
    const req = {
      params: { memberId: 'member-123' },
      body: { adminId: 'admin-456', ghost: false },
    } as unknown as Request;
    const res = mockResponse();

    const restored = makeBaseMember({ isGhosted: false, ghostedById: null });
    jest.spyOn(memberService, 'ghostMember').mockResolvedValue(restored);

    await ghostMember(req, res);

    expect(memberService.ghostMember).toHaveBeenCalledWith('admin-456', 'member-123', false);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: restored,
      message: 'Member unghosted and restored from Dead Zone',
    });
  });

  it('should throw 400 if memberId or adminId is missing', async () => {
    const req = {
      params: { memberId: 'member-123' },
      body: {},
    } as unknown as Request;
    const res = mockResponse();

    await expect(ghostMember(req, res)).rejects.toThrow(
      new ApiError('memberId and adminId are required', 400),
    );
  });

  it('should throw 400 if ghost is not a boolean', async () => {
    const req = {
      params: { memberId: 'member-123' },
      body: { adminId: 'admin-456', ghost: 'yes' },
    } as unknown as Request;
    const res = mockResponse();

    await expect(ghostMember(req, res)).rejects.toThrow(
      new ApiError('"ghost" must be a boolean', 400),
    );
  });

  it('should propagate 403 when service rejects non-admin requester', async () => {
    const req = {
      params: { memberId: 'member-123' },
      body: { adminId: 'non-admin-id', ghost: true },
    } as unknown as Request;
    const res = mockResponse();

    jest.spyOn(memberService, 'ghostMember').mockRejectedValue(
      new ApiError('Forbidden: only Admins and Super Admins can ghost members', 403),
    );

    await expect(ghostMember(req, res)).rejects.toThrow(
      new ApiError('Forbidden: only Admins and Super Admins can ghost members', 403),
    );
  });
});

describe('Member Controller - getDeadZoneMembers', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return all ghosted members with 200', async () => {
    const req = {} as Request;
    const res = mockResponse();

    const ghostedList = [
      makeBaseMember({ isGhosted: true, ghostedById: 'admin-456' }),
      makeBaseMember({ id: 'member-789', isGhosted: true, ghostedById: 'admin-456' }),
    ];

    jest.spyOn(memberService, 'deadZoneMembers').mockResolvedValue(ghostedList as any);

    await getDeadZoneMembers(req, res);

    expect(memberService.deadZoneMembers).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, members: ghostedList });
  });
});

