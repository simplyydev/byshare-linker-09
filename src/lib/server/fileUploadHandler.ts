
import { ServerFile, UploadOptions } from './serverTypes';
import { getUploadsFromServer, saveUploadsToServer, generateId, getAbsoluteDownloadUrl } from './serverStorageUtils';
import { emitUploadProgressEvent, emitStatusChangeEvent } from './serverEventManager';
import { formatFileSize } from '../file-utils';
import { MAX_UPLOADS_PER_DAY } from '../constants';
import { toast } from 'sonner';

// Check if user has reached their upload limit for the day
export const checkUploadLimit = (): boolean => {
  const todayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const uploadsToday = localStorage.getItem(`byshare_uploads_${todayKey}`);
  return uploadsToday ? parseInt(uploadsToday) >= MAX_UPLOADS_PER_DAY : false;
};

// Save file to the server (in this case, simulating by saving to localStorage and creating a virtual path)
export const saveFileToServer = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create a FileReader to get file contents
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        // Generate a file path in the /uploads directory
        const fileExtension = file.name.split('.').pop() || '';
        const fileName = `${generateId()}.${fileExtension}`;
        const filePath = `/uploads/${fileName}`;
        
        // Store the file in localStorage (in a real server, this would write to disk)
        localStorage.setItem(`byshare_file_${fileName}`, reader.result as string);
        
        // Return the virtual file path
        resolve(filePath);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    // Start reading the file as a data URL
    reader.readAsDataURL(file);
  });
};

// Increment the upload count for today
export const incrementUploadCount = (): void => {
  const todayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const uploadsToday = localStorage.getItem(`byshare_uploads_${todayKey}`);
  const newCount = uploadsToday ? parseInt(uploadsToday) + 1 : 1;
  localStorage.setItem(`byshare_uploads_${todayKey}`, newCount.toString());
};

// Upload file to server with progress tracking
export const uploadFileToServer = async (
  file: File, 
  options: UploadOptions = {}
): Promise<ServerFile> => {
  return new Promise((resolve, reject) => {
    // Check if upload limit reached
    if (checkUploadLimit()) {
      toast.error(`Limite de ${MAX_UPLOADS_PER_DAY} téléchargements par jour atteinte`);
      reject(new Error(`Upload limit of ${MAX_UPLOADS_PER_DAY} files per day reached`));
      return;
    }
    
    // Create a new server file object
    const serverFile: ServerFile = {
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      expiryDate: options.expiryDays 
        ? new Date(Date.now() + options.expiryDays * 24 * 60 * 60 * 1000).toISOString() 
        : null,
      downloadUrl: '',
      password: options.password || null,
      uploadProgress: 0,
      status: 'uploading',
      filePath: ''
    };

    // Simulate upload progress
    const totalChunks = 100;
    let currentChunk = 0;
    
    const progressInterval = setInterval(() => {
      currentChunk++;
      serverFile.uploadProgress = Math.floor((currentChunk / totalChunks) * 100);
      
      // Notify progress listeners
      emitUploadProgressEvent(serverFile.id, serverFile.uploadProgress);
      
      if (currentChunk >= totalChunks) {
        clearInterval(progressInterval);
        
        // File is fully uploaded, now process it
        serverFile.status = 'processing';
        emitStatusChangeEvent(serverFile.id, 'processing');
        
        // Save file to server
        saveFileToServer(file)
          .then(filePath => {
            // Update server file with path and status
            serverFile.filePath = filePath;
            serverFile.status = 'ready';
            serverFile.downloadUrl = getAbsoluteDownloadUrl(serverFile.id);
            
            // Save to server database
            const uploads = getUploadsFromServer();
            uploads.push(serverFile);
            saveUploadsToServer(uploads);
            
            // Increment upload count
            incrementUploadCount();
            
            // Notify status listeners
            emitStatusChangeEvent(serverFile.id, 'ready');
            
            resolve(serverFile);
          })
          .catch(error => {
            serverFile.status = 'error';
            emitStatusChangeEvent(serverFile.id, 'error');
            reject(error);
          });
      }
    }, 50);
  });
};

// Get uploads count for today
export const getUploadsCountForToday = (): number => {
  const todayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const uploadsToday = localStorage.getItem(`byshare_uploads_${todayKey}`);
  return uploadsToday ? parseInt(uploadsToday) : 0;
};
