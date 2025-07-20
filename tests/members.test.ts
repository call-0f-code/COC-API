import { describe, it, expect, jest } from '@jest/globals';
import * as memberController from '../src/controllers/member.controller';
import * as memberService from '../src/services/member.service';
import { ApiError } from '../src/utils/apiError';

// Mock res
const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Member Controller', () => {
  describe('createAMember', () => {
    it('should return 200 with created member on valid input', async () => {
      const req: any = {
        body: {
          name: 'Shruti',
          email: 'shruti@gmail.com',
          passoutYear: '2027',
          password: 'shruti@123',
        },
      };
      const res = mockRes();

      const mockMember = {
        id: 'uuid',
        name: 'Shruti',
        email: req.body.email,
        passoutYear: new Date('2027'),
        isApproved: false,
        isManager: false,
      };

      jest
        .spyOn(memberService, 'createMember')
        .mockResolvedValue(mockMember);

      await memberController.createAMember(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, user: mockMember });
    });

    it('should throw error if required fields are missing', async () => {
      const req: any = { body: {} };
      const res = mockRes();

      await expect(memberController.createAMember(req, res)).rejects.toThrow(ApiError);
    });
  });

  describe('getUserDetails', () => {
    it('should return user details with valid memberId', async () => {
      const req: any = { params: { memberId: 'abc-123' } };
      const res = mockRes();

      const mockUser = { id: 'abc-123', name: 'Shruti' };

      jest
        .spyOn(memberService, 'getDetails')
        .mockResolvedValue(mockUser);

      await memberController.getUserDetails(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: mockUser,
        message: 'Fetched user details',
      });
    });

    it('should throw error if memberId not provided', async () => {
      const req: any = { params: {} };
      const res = mockRes();

      await expect(memberController.getUserDetails(req, res)).rejects.toThrow(ApiError);
    });
  });

  describe('updateAMember', () => {
    it('should return 200 after successful update', async () => {
      const req: any = {
        params: { memberId: 'abc-123' },
        body: { github: 'https://github.com/shrutiiiyet' },
      };
      const res = mockRes();

      jest.spyOn(memberService, 'updateMember').mockResolvedValueOnce({});

      await memberController.updateAMember(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Updated member details succesfully',
      });
    });
  });

  describe('getUserAchievements', () => {
    it('should return achievements for valid memberId', async () => {
      const req: any = { params: { memberId: 'abc-123' } };
      const res = mockRes();

      const mockAchievements = [{ title: 'Winner' }];
      jest.spyOn(memberService, 'getAchievements').mockResolvedValue(mockAchievements);

      await memberController.getUserAchievements(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        achievements: mockAchievements,
      });
    });

    it('should throw error if memberId not provided', async () => {
      const req: any = { params: {} };
      const res = mockRes();

      await expect(memberController.getUserAchievements(req, res)).rejects.toThrow(ApiError);
    });
  });

  describe('getUserProjects', () => {
    it('should return projects for valid memberId', async () => {
      const req: any = { params: { memberId: 'abc-123' } };
      const res = mockRes();

      const mockProjects = [{ name: 'EventHub' }];
      jest.spyOn(memberService, 'getProjects').mockResolvedValue(mockProjects);

      await memberController.getUserProjects(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        projects: mockProjects,
      });
    });
  });

  describe('getUnapprovedMembers', () => {
    it('should return all unapproved members', async () => {
      const req: any = {};
      const res = mockRes();

      const mockList = [{ id: 'u1', name: 'Shruti' }];
      jest.spyOn(memberService, 'unapprovedMembers').mockResolvedValue(mockList);

      await memberController.getUnapprovedMembers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        unapprovedMembers: mockList,
      });
    });
  });

  describe('updateRequest', () => {
    it('should update approval status', async () => {
      const req: any = {
        params: { memberId: 'abc-123' },
        body: { isApproved: true, adminId: 'admin-123' },
      };
      const res = mockRes();

      const mockUpdate = { success: true };
      jest.spyOn(memberService, 'approveRequest').mockResolvedValue(mockUpdate);
      jest.spyOn(memberService, 'updateMember').mockResolvedValue({});

      await memberController.updateRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        update: mockUpdate,
        message: 'Approve Request Checked',
      });
    });

    it('should throw error if required fields missing', async () => {
      const req: any = {
        params: {},
        body: { isApproved: true },
      };
      const res = mockRes();

      await expect(memberController.updateRequest(req, res)).rejects.toThrow(ApiError);
    });
  });
});
