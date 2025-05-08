
// Types related to server file operations

export interface ServerFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  expiryDate: string | null;
  downloadUrl: string;
  password: string | null;
  uploadProgress?: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  filePath?: string; // Path to file on server
}

export interface UploadOptions {
  expiryDays?: number;
  password?: string | null;
}
