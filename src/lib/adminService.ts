
import { API_BASE_URL, IS_LOCAL_MODE } from './apiConfig';
import { FileData } from './types';
import config from './config';

// Get files from localStorage
const getLocalFiles = (): Record<string, FileData> => {
  try {
    const filesJson = localStorage.getItem('byshare_files');
    return filesJson ? JSON.parse(filesJson) : {};
  } catch (error) {
    console.error('Error getting files from localStorage:', error);
    return {};
  }
};

// Get all files (admin function)
export const getAllFiles = async (): Promise<Omit<FileData, 'content'>[]> => {
  if (IS_LOCAL_MODE) {
    try {
      const files = getLocalFiles();
      // Convert to array and remove content field for security
      return Object.values(files).map(({ content, ...fileWithoutContent }) => fileWithoutContent);
    } catch (error) {
      console.error('Error fetching all files from localStorage:', error);
      return [];
    }
  }
  
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
  if (IS_LOCAL_MODE) {
    try {
      const files = getLocalFiles();
      // Calculate total size of all files
      return Object.values(files).reduce((total, file) => total + file.size, 0);
    } catch (error) {
      console.error('Error calculating storage usage from localStorage:', error);
      return 0;
    }
  }
  
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
