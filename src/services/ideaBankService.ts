import { ApiResponse } from '@/types';

export interface IdeaBankFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  data: string; // Base64 encoded file data
}

const STORAGE_KEY = 'vave_idea_bank_files';

class IdeaBankService {
  // Get all idea bank files
  async getAllFiles(): Promise<ApiResponse<IdeaBankFile[]>> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const files: IdeaBankFile[] = stored ? JSON.parse(stored) : [];
      
      // Convert date strings back to Date objects
      files.forEach(file => {
        file.uploadedAt = new Date(file.uploadedAt);
      });
      
      return {
        success: true,
        data: files,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch idea bank files',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Upload a new file
  async uploadFile(
    file: File,
    fileData: string,
    uploadedBy: string
  ): Promise<ApiResponse<IdeaBankFile>> {
    try {
      const newFile: IdeaBankFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        uploadedBy,
        data: fileData,
      };

      const stored = localStorage.getItem(STORAGE_KEY);
      const files: IdeaBankFile[] = stored ? JSON.parse(stored) : [];
      files.unshift(newFile); // Add to beginning
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));

      return {
        success: true,
        data: newFile,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Failed to upload file',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Delete a file
  async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const files: IdeaBankFile[] = stored ? JSON.parse(stored) : [];
      
      const updatedFiles = files.filter(f => f.id !== fileId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));

      return {
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete file',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const ideaBankService = new IdeaBankService();
