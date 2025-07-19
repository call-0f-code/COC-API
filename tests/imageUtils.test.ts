import { uploadImage, deleteImage } from '../src/utils/imageUtils';
import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { ApiError } from '../src/utils/apiError';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid');
const mockedUuid = uuidv4 as jest.Mock;
mockedUuid.mockReturnValue('test-uuid');

describe('imageUtils', () => {
  let mockSupabase: Partial<SupabaseClient>;
  let storageMock: any;

  const dummyFile = {
    buffer: Buffer.from('test'),
    mimetype: 'image/png',
  } as Express.Multer.File;

  beforeEach(() => {
    storageMock = {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
      remove: jest.fn(),
    };

    mockSupabase = {
      storage: storageMock,
    };
  });

  describe('uploadImage', () => {
    it('uploads an image successfully and returns public URL', async () => {
      storageMock.upload.mockResolvedValue({ error: null });
      storageMock.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://public.url/file.png' } });

      const url = await uploadImage(mockSupabase as SupabaseClient, dummyFile, 'test-folder');
      expect(storageMock.from).toHaveBeenCalledWith('images');
      expect(storageMock.upload).toHaveBeenCalledWith('test-folder/test-uuid.png', dummyFile.buffer, {
        contentType: dummyFile.mimetype,
        upsert: true,
      });
      expect(url).toBe('https://public.url/file.png');
    });

    it('uses existing filename from fileUrl if provided', async () => {
      // Simulate providing an existing URL so the helper extracts the filename
      const existingUrl = 'https://xyz.supabase.co/storage/v1/object/public/images/folder/existing.png';
      storageMock.upload.mockResolvedValue({ error: null });
      storageMock.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://public.url/existing.png' } });

      const url = await uploadImage(
        mockSupabase as SupabaseClient,
        dummyFile,
        'folder',
        existingUrl
      );
      // Should use filename 'existing.png' instead of generating with uuid
      expect(storageMock.upload).toHaveBeenCalledWith(
        'folder/existing.png',
        dummyFile.buffer,
        { contentType: dummyFile.mimetype, upsert: true }
      );
      expect(url).toBe('https://public.url/existing.png');
    });

    it('throws ApiError for missing mimetype', async () => {
      const badFile = { ...dummyFile, mimetype: '' };
      await expect(
        uploadImage(mockSupabase as SupabaseClient, badFile as any, 'folder')
      ).rejects.toThrow(ApiError);
    });

    it('throws ApiError for invalid mimetype', async () => {
      const badFile = { ...dummyFile, mimetype: 'text/plain' };
      await expect(
        uploadImage(mockSupabase as SupabaseClient, badFile as any, 'folder')
      ).rejects.toThrow(ApiError);
    });

    it('throws ApiError when upload fails', async () => {
      storageMock.upload.mockResolvedValue({ error: { message: 'fail' } as PostgrestError });
      await expect(
        uploadImage(mockSupabase as SupabaseClient, dummyFile, 'folder')
      ).rejects.toThrow(/Image upload failed/);
    });

    it('throws ApiError when publicUrl missing', async () => {
      storageMock.upload.mockResolvedValue({ error: null });
      storageMock.getPublicUrl.mockReturnValue({ data: { publicUrl: '' } });
      await expect(
        uploadImage(mockSupabase as SupabaseClient, dummyFile, 'folder')
      ).rejects.toThrow(/Failed to get public URL/);
    });
  });

  describe('deleteImage', () => {
    it('deletes an image successfully', async () => {
      const publicUrl = 'https://xyz.supabase.co/storage/v1/object/public/images/folder/file.png';
      storageMock.remove.mockResolvedValue({ error: null });

      await expect(
        deleteImage(mockSupabase as SupabaseClient, publicUrl)
      ).resolves.toBeUndefined();
      expect(storageMock.from).toHaveBeenCalledWith('images');
      expect(storageMock.remove).toHaveBeenCalledWith(['folder/file.png']);
    });

    it('throws ApiError for invalid URL', async () => {
      await expect(
        deleteImage(mockSupabase as SupabaseClient, 'https://invalid.url')
      ).rejects.toThrow(ApiError);
    });

    it('throws ApiError when delete fails', async () => {
      const publicUrl = 'https://xyz.supabase.co/storage/v1/object/public/images/folder/file.png';
      storageMock.remove.mockResolvedValue({ error: { message: 'delete fail' } as PostgrestError });

      await expect(
        deleteImage(mockSupabase as SupabaseClient, publicUrl)
      ).rejects.toThrow(/Image deletion failed/);
    });
  });
});
