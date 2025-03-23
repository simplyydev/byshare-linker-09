
import { API_BASE_URL } from './apiConfig';
import { FileData } from './types';
import config from './config';

// Get all files (admin function)
export const getAllFiles = async (): Promise<Omit<FileData, 'content'>[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/files`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching all files:', error);
    return [];
  }
};

// Calculate total storage usage in bytes
export const getTotalStorageUsage = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/storage/usage`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch storage usage');
    }
    
    const data = await response.json();
    return data.usage || 0;
  } catch (error) {
    console.error('Error fetching storage usage:', error);
    return 0;
  }
};

// Verify admin credentials
export const verifyAdminCredentials = (username: string, password: string): boolean => {
  const adminCreds = config.get('app.adminCredentials');
  return username === adminCreds.username && password === adminCreds.password;
};
