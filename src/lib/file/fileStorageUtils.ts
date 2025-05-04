
import { FileData, UserUploadHistory } from "./fileTypes";

// Helper function to generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Get client IP (simulated in browser)
export const getClientIP = (): string => {
  // In a real app, this would be determined server-side
  // For demo purposes, we'll use a localStorage key
  let ip = localStorage.getItem('byshare_client_ip');
  if (!ip) {
    ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    localStorage.setItem('byshare_client_ip', ip);
  }
  return ip;
};

// Generate a unique user ID
export const getUserId = (): string => {
  let userId = localStorage.getItem('byshare_user_id');
  if (!userId) {
    userId = generateId();
    localStorage.setItem('byshare_user_id', userId);
  }
  return userId;
};

// Load files from localStorage
export const loadFiles = (): FileData[] => {
  const files = localStorage.getItem('byshare_files');
  return files ? JSON.parse(files) : [];
};

// Save files to localStorage
export const saveFiles = (files: FileData[]): void => {
  localStorage.setItem('byshare_files', JSON.stringify(files));
};

// Get user upload history
export const getUserUploads = (): UserUploadHistory[] => {
  const userId = getUserId();
  const history = localStorage.getItem(`byshare_history_${userId}`);
  return history ? JSON.parse(history) : [];
};

// Add entry to user upload history
export const addToUserHistory = (file: FileData, url: string): void => {
  const userId = getUserId();
  const history = getUserUploads();
  
  const historyEntry: UserUploadHistory = {
    id: file.id,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    uploadDate: file.createdAt,
    expiryDate: file.expiryDate,
    hasPassword: !!file.password,
    visibility: file.visibility || 'public'
  };
  
  history.push(historyEntry);
  localStorage.setItem(`byshare_history_${userId}`, JSON.stringify(history));
};

// Get upload count for today
export const getUploadCountForToday = (): number => {
  const ip = getClientIP();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const uploadCountKey = `byshare_upload_count_${ip}_${today}`;
  const count = localStorage.getItem(uploadCountKey);
  
  return count ? parseInt(count) : 0;
};

// Increment upload count
export const incrementUploadCount = (): void => {
  const ip = getClientIP();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const uploadCountKey = `byshare_upload_count_${ip}_${today}`;
  const currentCount = getUploadCountForToday();
  
  localStorage.setItem(uploadCountKey, (currentCount + 1).toString());
};
