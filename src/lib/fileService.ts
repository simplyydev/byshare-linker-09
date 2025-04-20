
// Re-export all functionality from separate modules
// This maintains backward compatibility with existing imports

// Types
export type { FileData, UserUploadHistory, UploadProgress, ImportRecord } from './types';

// User services
export { 
  getUserId,
  getUserUploads,
  getUploadCountForToday,
  incrementUploadCount
} from './userService';

// Config services
export {
  loadSettings,
  saveSettings,
  isUploadLimitReached
} from './configService';

// File operations
export {
  uploadFile,
  uploadFolder,
  deleteFile,
  getFileMetadata,
  isFilePasswordProtected,
  verifyFilePassword,
  getFileContent,
  updateFileVisibility,
  updateFileExpiryDate,
  reportFile,
  getImports
} from './fileOperations';

// Admin services
export {
  getAllFiles,
  getTotalStorageUsage,
  verifyAdminCredentials
} from './adminService';
