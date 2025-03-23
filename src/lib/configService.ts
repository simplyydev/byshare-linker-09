
import config from './config';
import { MAX_UPLOADS_PER_DAY } from './constants';
import { getUploadCountForToday } from './userService';

// Load settings from config
export const loadSettings = (): {
  maxSizeMB: number;
  acceptedFileTypes: string[];
} => {
  return {
    maxSizeMB: config.get('upload.maxSizeMB'),
    acceptedFileTypes: config.get('upload.acceptedFileTypes')
  };
};

// Save settings to config
export const saveSettings = (settings: {
  maxSizeMB: number;
  acceptedFileTypes: string[];
}): void => {
  config.set('upload.maxSizeMB', settings.maxSizeMB);
  config.set('upload.acceptedFileTypes', settings.acceptedFileTypes);
};

// Check if upload limit reached
export const isUploadLimitReached = (): boolean => {
  return getUploadCountForToday() >= MAX_UPLOADS_PER_DAY;
};
