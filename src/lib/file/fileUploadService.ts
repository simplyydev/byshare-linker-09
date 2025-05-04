
import { ShareOptions } from "@/components/ui/ShareOptions";
import { FileData } from "./fileTypes";
import { 
  generateId, 
  getClientIP, 
  loadFiles, 
  saveFiles, 
  addToUserHistory,
  incrementUploadCount,
  getUploadCountForToday
} from "./fileStorageUtils";
import { MAX_UPLOADS_PER_DAY } from "../constants";

// Check if upload limit reached
export const isUploadLimitReached = (): boolean => {
  return getUploadCountForToday() >= MAX_UPLOADS_PER_DAY;
};

// Upload file
export const uploadFile = async (
  file: File, 
  options: ShareOptions
): Promise<{id: string, url: string}> => {
  return new Promise((resolve, reject) => {
    if (isUploadLimitReached()) {
      reject(new Error(`Limite de ${MAX_UPLOADS_PER_DAY} téléchargements par jour atteinte`));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const files = loadFiles();
        const id = generateId();
        const ip = getClientIP();
        
        // Ensure expiry date is within limits (max 1 year)
        let expiryDate = options.expiryDate;
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        
        if (expiryDate && expiryDate > oneYearFromNow) {
          expiryDate = oneYearFromNow;
        }
        
        const newFile: FileData = {
          id,
          name: file.name,
          size: file.size,
          type: file.type,
          content: reader.result as string,
          password: options.password,
          expiryDate: expiryDate ? expiryDate.toISOString() : null,
          createdAt: new Date().toISOString(),
          reportCount: 0,
          reportReasons: [],
          uploadedBy: ip,
          folderPath: file.webkitRelativePath || undefined,
          visibility: options.visibility || 'public'
        };
        
        files.push(newFile);
        saveFiles(files);
        incrementUploadCount();
        
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/files/${id}`;
        
        // Add to user's upload history
        addToUserHistory(newFile, url);
        
        resolve({ id, url });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};
