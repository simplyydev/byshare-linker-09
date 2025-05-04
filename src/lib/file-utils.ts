
// File utilities for handling file previews, validation, and icon selection

/**
 * Get the appropriate file icon based on file type
 */
import { Image, File as FileIcon, Film, Music, Archive, FileText } from 'lucide-react';

export const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <Image className="h-10 w-10 text-primary" />;
  if (fileType.startsWith('video/')) return <Film className="h-10 w-10 text-primary" />;
  if (fileType.startsWith('audio/')) return <Music className="h-10 w-10 text-primary" />;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar') || fileType.includes('7z')) 
    return <Archive className="h-10 w-10 text-primary" />;
  if (fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('txt')) 
    return <FileText className="h-10 w-10 text-primary" />;
  return <FileIcon className="h-10 w-10 text-primary" />;
};

/**
 * Format file size to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' MB';
  }
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};
