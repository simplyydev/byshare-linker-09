
import { FileData } from './fileTypes';
import { 
  loadFiles, 
  saveFiles, 
  getUserId, 
  getUserUploads 
} from "./fileStorageUtils";

// Update file visibility
export const updateFileVisibility = (
  fileId: string, 
  visibility: 'public' | 'private'
): boolean => {
  const files = loadFiles();
  const fileIndex = files.findIndex(f => f.id === fileId);
  
  if (fileIndex === -1) return false;
  
  files[fileIndex].visibility = visibility;
  saveFiles(files);
  
  // Update history entry
  const userId = getUserId();
  const history = getUserUploads();
  const historyIndex = history.findIndex(h => h.id === fileId);
  
  if (historyIndex !== -1) {
    history[historyIndex].visibility = visibility;
    localStorage.setItem(`byshare_history_${userId}`, JSON.stringify(history));
  }
  
  return true;
};

// Update file expiry date
export const updateFileExpiryDate = (
  fileId: string, 
  expiryDate: Date | null
): boolean => {
  const files = loadFiles();
  const fileIndex = files.findIndex(f => f.id === fileId);
  
  if (fileIndex === -1) return false;
  
  files[fileIndex].expiryDate = expiryDate ? expiryDate.toISOString() : null;
  saveFiles(files);
  
  // Update history entry
  const userId = getUserId();
  const history = getUserUploads();
  const historyIndex = history.findIndex(h => h.id === fileId);
  
  if (historyIndex !== -1) {
    history[historyIndex].expiryDate = expiryDate ? expiryDate.toISOString() : null;
    localStorage.setItem(`byshare_history_${userId}`, JSON.stringify(history));
  }
  
  return true;
};

// Delete file
export const deleteFile = (id: string): boolean => {
  const files = loadFiles();
  const fileIndex = files.findIndex(f => f.id === id);
  
  if (fileIndex === -1) return false;
  
  files.splice(fileIndex, 1);
  saveFiles(files);
  
  // Remove from user history if exists
  const userId = getUserId();
  const history = getUserUploads();
  const historyIndex = history.findIndex(h => h.id === id);
  
  if (historyIndex !== -1) {
    history.splice(historyIndex, 1);
    localStorage.setItem(`byshare_history_${userId}`, JSON.stringify(history));
  }
  
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
