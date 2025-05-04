
import { FileData } from './fileTypes';
import { loadFiles, saveFiles } from "./fileStorageUtils";

// Get file metadata (without content)
export const getFileMetadata = (id: string): Omit<FileData, 'content' | 'password'> | null => {
  const files = loadFiles();
  const file = files.find(f => f.id === id);
  
  if (!file) return null;
  
  // Check if file has expired
  if (file.expiryDate) {
    const expiryDate = new Date(file.expiryDate);
    if (expiryDate < new Date()) {
      // File has expired, delete and return null
      const fileIndex = files.findIndex(f => f.id === id);
      if (fileIndex !== -1) {
        files.splice(fileIndex, 1);
        saveFiles(files);
      }
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
      // File has expired, delete and return null
      const fileIndex = files.findIndex(f => f.id === id);
      if (fileIndex !== -1) {
        files.splice(fileIndex, 1);
        saveFiles(files);
      }
      return null;
    }
  }
  
  // Check password if file is password protected
  if (file.password && password !== file.password) {
    return null;
  }
  
  return file.content;
};

// Generate file preview
export const generateFilePreview = (file: FileData): string | null => {
  // For images, just return the content
  if (file.type.startsWith('image/')) {
    return file.content;
  }
  
  // For PDFs, videos, and audio, return content as is (browser can render them)
  if (file.type === 'application/pdf' || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
    return file.content;
  }
  
  // For other types, return null - no preview available
  return null;
};
