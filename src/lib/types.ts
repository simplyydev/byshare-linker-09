
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
  uploadedBy: string; // User ID or IP
  userAgent?: string; // Browser info
  folderPath?: string; // For folder uploads
  visibility?: 'public' | 'private'; // Visibility option
  isFolder?: boolean; // Whether this is a folder
  files?: Array<{path: string; name: string; size: number; type: string}>; // Files in folder
  content?: string; // File content stored as base64 or data URL
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
  isFolder?: boolean;
}

// Upload progress type
export interface UploadProgress {
  loaded: number;
  total: number;
  progress: number;
}
