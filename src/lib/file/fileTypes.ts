
// Types related to file operations

import { ShareOptions } from "@/components/ui/ShareOptions";

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
  uploadedBy: string; // IP address or identifier
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
