
import { ShareOptions } from '@/components/ui/ShareOptions';

// Type definitions
export interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string; // Base64 encoded content
  password: string | null;
  expiryDate: string | null; // ISO string
  createdAt: string; // ISO string
  reportCount: number;
  reportReasons: string[];
}

// Helper function to generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Load files from localStorage
const loadFiles = (): FileData[] => {
  const files = localStorage.getItem('byshare_files');
  return files ? JSON.parse(files) : [];
};

// Save files to localStorage
const saveFiles = (files: FileData[]): void => {
  localStorage.setItem('byshare_files', JSON.stringify(files));
};

// Load settings from localStorage
export const loadSettings = (): {
  maxSizeMB: number;
  acceptedFileTypes: string[];
} => {
  const settings = localStorage.getItem('byshare_settings');
  if (settings) {
    return JSON.parse(settings);
  }
  // Default settings
  return {
    maxSizeMB: 100,
    acceptedFileTypes: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
      'video/*',
      'audio/*'
    ]
  };
};

// Save settings to localStorage
export const saveSettings = (settings: {
  maxSizeMB: number;
  acceptedFileTypes: string[];
}): void => {
  localStorage.setItem('byshare_settings', JSON.stringify(settings));
};

// Upload file
export const uploadFile = async (
  file: File, 
  options: ShareOptions
): Promise<{id: string, url: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const files = loadFiles();
        const id = generateId();
        
        const newFile: FileData = {
          id,
          name: file.name,
          size: file.size,
          type: file.type,
          content: reader.result as string,
          password: options.password,
          expiryDate: options.expiryDate ? options.expiryDate.toISOString() : null,
          createdAt: new Date().toISOString(),
          reportCount: 0,
          reportReasons: []
        };
        
        files.push(newFile);
        saveFiles(files);
        
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/files/${id}`;
        
        resolve({ id, url });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Get file metadata (without content)
export const getFileMetadata = (id: string): Omit<FileData, 'content' | 'password'> | null => {
  const files = loadFiles();
  const file = files.find(f => f.id === id);
  
  if (!file) return null;
  
  // Check if file has expired
  if (file.expiryDate) {
    const expiryDate = new Date(file.expiryDate);
    if (expiryDate < new Date()) {
      // File has expired, delete it
      deleteFile(id);
      return null;
    }
  }
  
  const { content, password, ...metadata } = file;
  return metadata;
};

// Check if file is password protected
export const isFilePasswordProtected = (id: string): boolean => {
  const files = loadFiles();
  const file = files.find(f => f.id === id);
  return !!file?.password;
};

// Verify file password
export const verifyFilePassword = (id: string, password: string): boolean => {
  const files = loadFiles();
  const file = files.find(f => f.id === id);
  
  if (!file || !file.password) return false;
  return file.password === password;
};

// Get file content
export const getFileContent = (id: string, password?: string): string | null => {
  const files = loadFiles();
  const file = files.find(f => f.id === id);
  
  if (!file) return null;
  
  // Check if file has expired
  if (file.expiryDate) {
    const expiryDate = new Date(file.expiryDate);
    if (expiryDate < new Date()) {
      // File has expired, delete it
      deleteFile(id);
      return null;
    }
  }
  
  // Check password if file is password protected
  if (file.password && password !== file.password) {
    return null;
  }
  
  return file.content;
};

// Delete file
export const deleteFile = (id: string): boolean => {
  const files = loadFiles();
  const fileIndex = files.findIndex(f => f.id === id);
  
  if (fileIndex === -1) return false;
  
  files.splice(fileIndex, 1);
  saveFiles(files);
  return true;
};

// Report file
export const reportFile = (id: string, reason: string): boolean => {
  const files = loadFiles();
  const fileIndex = files.findIndex(f => f.id === id);
  
  if (fileIndex === -1) return false;
  
  files[fileIndex].reportCount++;
  files[fileIndex].reportReasons.push(reason);
  
  saveFiles(files);
  return true;
};

// Get all files (admin function)
export const getAllFiles = (): Omit<FileData, 'content'>[] => {
  const files = loadFiles();
  return files.map(({ content, ...file }) => file);
};

// Calculate total storage usage in bytes
export const getTotalStorageUsage = (): number => {
  const files = loadFiles();
  return files.reduce((total, file) => total + file.size, 0);
};
