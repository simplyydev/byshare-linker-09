
import { ShareOptions } from '@/components/ui/ShareOptions';
import { MAX_UPLOADS_PER_DAY } from './constants';

// Type definitions
export interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  password: string | null;
  expiryDate: string | null; // ISO string
  createdAt: string; // ISO string
  reportCount: number;
  reportReasons: string[];
  uploadedBy: string; // User ID
  folderPath?: string; // For folder uploads
  visibility?: 'public' | 'private'; // Visibility option
}

// User history type
export interface UserUploadHistory {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  expiryDate: string | null;
  hasPassword: boolean;
  visibility: 'public' | 'private';
}

// API base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to generate a unique user ID
const getUserId = (): string => {
  let userId = localStorage.getItem('byshare_user_id');
  if (!userId) {
    userId = Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    localStorage.setItem('byshare_user_id', userId);
  }
  return userId;
};

// Get upload count for today
export const getUploadCountForToday = (): number => {
  const userId = getUserId();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const uploadCountKey = `byshare_upload_count_${userId}_${today}`;
  const count = localStorage.getItem(uploadCountKey);
  
  return count ? parseInt(count) : 0;
};

// Increment upload count
const incrementUploadCount = (): void => {
  const userId = getUserId();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const uploadCountKey = `byshare_upload_count_${userId}_${today}`;
  const currentCount = getUploadCountForToday();
  
  localStorage.setItem(uploadCountKey, (currentCount + 1).toString());
};

// Check if upload limit reached
export const isUploadLimitReached = (): boolean => {
  return getUploadCountForToday() >= MAX_UPLOADS_PER_DAY;
};

// Get user upload history from server
export const getUserUploads = async (): Promise<UserUploadHistory[]> => {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/users/${userId}/uploads`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user uploads');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user uploads:', error);
    return [];
  }
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

// Upload file to server
export const uploadFile = async (
  file: File, 
  options: ShareOptions
): Promise<{id: string, url: string}> => {
  if (isUploadLimitReached()) {
    throw new Error(`Limite de ${MAX_UPLOADS_PER_DAY} téléchargements par jour atteinte`);
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  const userId = getUserId();
  formData.append('userId', userId);
  
  if (options.expiryDate) {
    formData.append('expiryDate', options.expiryDate.toISOString());
  }
  
  if (options.password) {
    formData.append('password', options.password);
  }
  
  if (options.visibility) {
    formData.append('visibility', options.visibility);
  }
  
  if (file.webkitRelativePath) {
    formData.append('folderPath', file.webkitRelativePath);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }
    
    const result = await response.json();
    incrementUploadCount();
    
    return { 
      id: result.id, 
      url: `${window.location.origin}/files/${result.id}` 
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Get file metadata from server
export const getFileMetadata = async (id: string): Promise<Omit<FileData, 'content' | 'password'> | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${id}/metadata`);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching file metadata:', error);
    return null;
  }
};

// Check if file is password protected
export const isFilePasswordProtected = async (id: string): Promise<boolean> => {
  try {
    const metadata = await getFileMetadata(id);
    return metadata ? !!metadata.password : false;
  } catch (error) {
    console.error('Error checking if file is password protected:', error);
    return false;
  }
};

// Get file content from server
export const getFileContent = async (id: string, password?: string): Promise<string | null> => {
  try {
    let url = `${API_BASE_URL}/files/${id}/download`;
    
    if (password) {
      url += `?password=${encodeURIComponent(password)}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching file content:', error);
    return null;
  }
};

// Delete file from server
export const deleteFile = async (id: string): Promise<boolean> => {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/files/${id}?userId=${userId}`, {
      method: 'DELETE'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Update file visibility on server
export const updateFileVisibility = async (
  fileId: string, 
  visibility: 'public' | 'private'
): Promise<boolean> => {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/visibility`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        visibility,
        userId
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error updating file visibility:', error);
    return false;
  }
};

// Update file expiry date on server
export const updateFileExpiryDate = async (
  fileId: string, 
  expiryDate: Date | null
): Promise<boolean> => {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/expiry`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expiryDate: expiryDate ? expiryDate.toISOString() : null,
        userId
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error updating file expiry date:', error);
    return false;
  }
};

// Report file
export const reportFile = async (id: string, reason: string): Promise<boolean> => {
  // Not implemented in this version
  return false;
};

// Get all files (admin function)
export const getAllFiles = async (): Promise<Omit<FileData, 'content'>[]> => {
  // Not implemented in this version
  return [];
};

// Calculate total storage usage in bytes
export const getTotalStorageUsage = async (): Promise<number> => {
  // Not implemented in this version
  return 0;
};

// Verify admin credentials
export const verifyAdminCredentials = (username: string, password: string): boolean => {
  // In a real app, this would check against a securely stored credential
  // For demo purposes, we'll use hardcoded values (very insecure!)
  return username === 'admin' && password === 'byshare2024';
};

// Verify file password
export const verifyFilePassword = async (id: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${id}/download?password=${encodeURIComponent(password)}`);
    return response.ok;
  } catch (error) {
    console.error('Error verifying file password:', error);
    return false;
  }
};

// Generate file preview
export const generateFilePreview = async (fileId: string): Promise<string | null> => {
  // For this implementation, we'll just return the download URL
  return `${API_BASE_URL}/files/${fileId}/download`;
};
