import { ShareOptions } from '@/components/ui/ShareOptions';
import { FileData, UploadProgress, UserUploadHistory, ImportRecord } from './types';
import { API_BASE_URL, IS_LOCAL_MODE } from './apiConfig';
import { getUserId, incrementUploadCount, getUserUploads, saveUserUploads } from './userService';
import { isUploadLimitReached } from './configService';
import { MAX_UPLOADS_PER_DAY } from './constants';
import { toast } from 'sonner';

// Local storage keys
const FILES_STORAGE_KEY = 'byshare_files';
const IMPORTS_STORAGE_KEY = 'byshare_imports';

// Get files from localStorage
const getLocalFiles = (): Record<string, FileData> => {
  try {
    const filesJson = localStorage.getItem(FILES_STORAGE_KEY);
    return filesJson ? JSON.parse(filesJson) : {};
  } catch (error) {
    console.error('Error getting files from localStorage:', error);
    return {};
  }
};

// Save files to localStorage
const saveLocalFiles = (files: Record<string, FileData>): void => {
  try {
    localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
  } catch (error) {
    console.error('Error saving files to localStorage:', error);
  }
};

// Get imports from localStorage
const getLocalImports = (): ImportRecord[] => {
  try {
    const importsJson = localStorage.getItem(IMPORTS_STORAGE_KEY);
    return importsJson ? JSON.parse(importsJson) : [];
  } catch (error) {
    console.error('Error getting imports from localStorage:', error);
    return [];
  }
};

// Save imports to localStorage
const saveLocalImports = (imports: ImportRecord[]): void => {
  try {
    localStorage.setItem(IMPORTS_STORAGE_KEY, JSON.stringify(imports));
  } catch (error) {
    console.error('Error saving imports to localStorage:', error);
  }
};

// Add to imports history
const addToImports = (file: FileData): void => {
  try {
    const imports = getLocalImports();
    imports.push({
      id: file.id,
      fileName: file.name,
      importDate: new Date().toISOString(),
      fileSize: file.size,
      type: file.type
    });
    saveLocalImports(imports);
  } catch (error) {
    console.error('Error adding to imports:', error);
  }
};

// Upload single file to localStorage or server with improved error handling and progress tracking
export const uploadFile = async (
  file: File, 
  options: ShareOptions,
  onProgress?: (progress: UploadProgress) => void
): Promise<{id: string, url: string}> => {
  if (isUploadLimitReached()) {
    throw new Error(`Limite de ${MAX_UPLOADS_PER_DAY} téléchargements par jour atteinte`);
  }
  
  // Validate file size before uploading
  const maxSize = parseInt(localStorage.getItem('byshare_config_maxSizeMB') || '100');
  if (file.size > maxSize * 1024 * 1024) {
    throw new Error(`Le fichier est trop volumineux. Taille maximale: ${maxSize}MB`);
  }
  
  if (IS_LOCAL_MODE) {
    // Simulate progress
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress({
          loaded: (progress / 100) * file.size,
          total: file.size,
          progress: progress
        });
        
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);
    }
    
    // Create a unique ID for the file
    const fileId = Math.random().toString(36).substring(2, 15);
    const userId = getUserId();
    
    try {
      // Read file content as data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            // Save file to localStorage
            const files = getLocalFiles();
            
            // Create file data
            const fileData = {
              id: fileId,
              name: file.name,
              size: file.size,
              type: file.type,
              password: options.password || null,
              expiryDate: options.expiryDate ? options.expiryDate.toISOString() : null,
              createdAt: new Date().toISOString(),
              reportCount: 0,
              reportReasons: [],
              uploadedBy: userId,
              userAgent: navigator.userAgent,
              content: event.target?.result as string,
              visibility: options.visibility || 'public',
              folderPath: file.webkitRelativePath || undefined,
              isFolder: !!file.webkitRelativePath
            };
            
            files[fileId] = fileData;
            saveLocalFiles(files);
            addToImports(fileData);
            
            // Add to user uploads
            const uploads = await getUserUploads();
            uploads.push({
              id: fileId,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              uploadDate: new Date().toISOString(),
              expiryDate: options.expiryDate ? options.expiryDate.toISOString() : null,
              hasPassword: !!options.password,
              visibility: options.visibility || 'public',
              isFolder: !!file.webkitRelativePath
            });
            
            saveUserUploads(uploads);
            incrementUploadCount();
            
            resolve({ 
              id: fileId, 
              url: `${window.location.origin}/files/${fileId}` 
            });
          } catch (error) {
            console.error('Error saving file to localStorage:', error);
            reject(new Error('Erreur lors du téléchargement du fichier'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Erreur lors de la lecture du fichier'));
        };
        
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
  
  // If not in local mode, use the original implementation
  const formData = new FormData();
  formData.append('file', file);
  
  const userId = getUserId();
  formData.append('userId', userId);
  
  if (options.expiryDate) {
    formData.append('expiryDate', options.expiryDate.toISOString());
  }
  
  if (options.password) {
    formData.append('password', options.password);
  }
  
  if (options.visibility) {
    formData.append('visibility', options.visibility);
  }
  
  if (file.webkitRelativePath) {
    formData.append('folderPath', file.webkitRelativePath);
    formData.append('isFolder', 'true');
  }
  
  try {
    let response;
    
    if (onProgress) {
      // Use XMLHttpRequest for progress tracking
      response = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/upload`);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress({
              loaded: event.loaded,
              total: event.total,
              progress
            });
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const responseData = JSON.parse(xhr.response);
              resolve(new Response(xhr.response, {
                status: xhr.status,
                statusText: xhr.statusText
              }));
            } catch (error) {
              reject(new Error('Réponse invalide du serveur'));
            }
          } else {
            let errorMessage = 'Échec du téléchargement';
            try {
              const errorData = JSON.parse(xhr.response);
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              // Si la réponse n'est pas du JSON valide, utiliser le message par défaut
            }
            reject(new Error(errorMessage));
          }
        };
        
        xhr.onerror = () => {
          reject(new Error('Échec du téléchargement: problème de connexion'));
        };
        
        xhr.ontimeout = () => {
          reject(new Error('Délai d\'attente dépassé lors du téléchargement'));
        };
        
        xhr.send(formData);
      });
    } else {
      // Use fetch API when progress isn't needed
      response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });
    }
    
    if (!response.ok) {
      let errorMessage = 'Échec du téléchargement';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Si la réponse n'est pas du JSON valide, utiliser le message par défaut
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    incrementUploadCount();
    
    return { 
      id: result.id, 
      url: `${window.location.origin}/files/${result.id}` 
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Upload folder to localStorage or server with improved handling
export const uploadFolder = async (
  files: File[], 
  options: ShareOptions,
  onProgress?: (progress: UploadProgress) => void
): Promise<{id: string, url: string}> => {
  if (isUploadLimitReached()) {
    throw new Error(`Limite de ${MAX_UPLOADS_PER_DAY} téléchargements par jour atteinte`);
  }
  
  if (files.length === 0) {
    throw new Error('Aucun fichier à télécharger');
  }
  
  if (IS_LOCAL_MODE) {
    // Generate folder upload ID
    const folderUploadId = Math.random().toString(36).substring(2, 15);
    const userId = getUserId();
    
    // Track overall progress
    let totalUploaded = 0;
    const totalSize = files.reduce((total, file) => total + file.size, 0);
    
    try {
      // Check if total folder size exceeds limit
      const maxSize = parseInt(localStorage.getItem('byshare_config_maxSizeMB') || '100');
      if (totalSize > maxSize * 1024 * 1024) {
        throw new Error(`Le dossier est trop volumineux. Taille maximale: ${maxSize}MB`);
      }
      
      // Create folder structure
      const filesByPath: Record<string, FileData> = {};
      const folderFiles: Array<{path: string; name: string; size: number; type: string}> = [];
      
      // Process all files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = folderUploadId + '_' + i;
        
        // Read file content as data URL
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
          reader.readAsDataURL(file);
        });
        
        // Create file data
        const fileData = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          password: options.password || null,
          expiryDate: options.expiryDate ? options.expiryDate.toISOString() : null,
          createdAt: new Date().toISOString(),
          reportCount: 0,
          reportReasons: [],
          uploadedBy: userId,
          userAgent: navigator.userAgent,
          content: content,
          visibility: options.visibility || 'public',
          folderPath: file.webkitRelativePath,
          isFolder: true
        };
        
        filesByPath[fileId] = fileData;
        addToImports(fileData);
        
        folderFiles.push({
          path: file.webkitRelativePath,
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        // Update progress
        totalUploaded += file.size;
        if (onProgress) {
          onProgress({
            loaded: totalUploaded,
            total: totalSize,
            progress: Math.round((totalUploaded / totalSize) * 100)
          });
        }
      }
      
      // Save all files to localStorage
      const existingFiles = getLocalFiles();
      const updatedFiles = { ...existingFiles, ...filesByPath };
      saveLocalFiles(updatedFiles);
      
      // Create main folder entry
      const folderName = files[0].webkitRelativePath.split('/')[0];
      updatedFiles[folderUploadId] = {
        id: folderUploadId,
        name: folderName,
        size: totalSize,
        type: 'folder',
        password: options.password || null,
        expiryDate: options.expiryDate ? options.expiryDate.toISOString() : null,
        createdAt: new Date().toISOString(),
        reportCount: 0,
        reportReasons: [],
        uploadedBy: userId,
        userAgent: navigator.userAgent,
        content: '',
        visibility: options.visibility || 'public',
        isFolder: true,
        files: folderFiles
      };
      saveLocalFiles(updatedFiles);
      
      // Add to user uploads
      const uploads = await getUserUploads();
      uploads.push({
        id: folderUploadId,
        fileName: folderName,
        fileSize: totalSize,
        fileType: 'folder',
        uploadDate: new Date().toISOString(),
        expiryDate: options.expiryDate ? options.expiryDate.toISOString() : null,
        hasPassword: !!options.password,
        visibility: options.visibility || 'public',
        isFolder: true
      });
      
      saveUserUploads(uploads);
      incrementUploadCount();
      
      return { 
        id: folderUploadId, 
        url: `${window.location.origin}/files/${folderUploadId}` 
      };
    } catch (error) {
      console.error('Folder upload error:', error);
      throw error;
    }
  }
  
  // If not in local mode, use the original implementation
  if (isUploadLimitReached()) {
    throw new Error(`Limite de ${MAX_UPLOADS_PER_DAY} téléchargements par jour atteinte`);
  }
  
  if (files.length === 0) {
    throw new Error('Aucun fichier à télécharger');
  }
  
  // Generate folder upload ID
  const folderUploadId = Math.random().toString(36).substring(2, 15);
  const userId = getUserId();
  
  // Track overall progress
  let totalUploaded = 0;
  const totalSize = files.reduce((total, file) => total + file.size, 0);
  
  try {
    // Check if total folder size exceeds limit
    const maxSize = parseInt(localStorage.getItem('byshare_config_maxSizeMB') || '100');
    if (totalSize > maxSize * 1024 * 1024) {
      throw new Error(`Le dossier est trop volumineux. Taille maximale: ${maxSize}MB`);
    }

    // Group files by path to maintain folder structure
    const filesByPath = new Map<string, File[]>();
    
    files.forEach(file => {
      const path = file.webkitRelativePath.split('/').slice(0, -1).join('/');
      if (!filesByPath.has(path)) {
        filesByPath.set(path, []);
      }
      filesByPath.get(path)?.push(file);
    });
    
    // Upload files by path group
    const paths = Array.from(filesByPath.keys());
    
    // Upload files one by one
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('folderUploadId', folderUploadId);
      formData.append('isFolder', 'true');
      
      if (file.webkitRelativePath) {
        formData.append('folderPath', file.webkitRelativePath);
      }
      
      if (options.expiryDate) {
        formData.append('expiryDate', options.expiryDate.toISOString());
      }
      
      if (options.password) {
        formData.append('password', options.password);
      }
      
      if (options.visibility) {
        formData.append('visibility', options.visibility);
      }
      
      let retryCount = 0;
      const maxRetries = 3;
      let success = false;
      
      while (!success && retryCount < maxRetries) {
        try {
          const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            let errorMessage = 'Échec du téléchargement';
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              // Si la réponse n'est pas du JSON valide, utiliser le message par défaut
            }
            
            if (retryCount < maxRetries - 1) {
              // Attendre avant de réessayer
              await new Promise(resolve => setTimeout(resolve, 1000));
              retryCount++;
              continue;
            }
            
            throw new Error(errorMessage);
          }
          
          success = true;
        } catch (error) {
          if (retryCount < maxRetries - 1) {
            retryCount++;
            continue;
          }
          throw error;
        }
      }
      
      // Update progress
      totalUploaded += file.size;
      if (onProgress) {
        onProgress({
          loaded: totalUploaded,
          total: totalSize,
          progress: Math.round((totalUploaded / totalSize) * 100)
        });
      }
      
      // Update folder upload progress on server
      try {
        await fetch(`${API_BASE_URL}/upload/folder/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            folderUploadId,
            total: files.length,
            current: i + 1
          })
        });
      } catch (error) {
        // Non-critical error, log but continue
        console.warn('Failed to update folder progress:', error);
      }
    }
    
    // Only increment counter once for folder upload
    incrementUploadCount();
    
    return { 
      id: folderUploadId, 
      url: `${window.location.origin}/files/${folderUploadId}` 
    };
  } catch (error) {
    console.error('Folder upload error:', error);
    throw error;
  }
};

// Delete file from localStorage or server
export const deleteFile = async (id: string): Promise<boolean> => {
  if (IS_LOCAL_MODE) {
    try {
      // Remove file from localStorage
      const files = getLocalFiles();
      
      // Check if it's a folder and remove all associated files
      const file = files[id];
      if (file && file.isFolder) {
        // Delete all files in the folder
        Object.keys(files).forEach(fileId => {
          if (fileId.startsWith(id + '_')) {
            delete files[fileId];
          }
        });
      }
      
      // Delete the main file/folder
      delete files[id];
      saveLocalFiles(files);
      
      // Remove from user uploads
      const userId = getUserId();
      const uploads = await getUserUploads();
      const updatedUploads = uploads.filter(upload => upload.id !== id);
      saveUserUploads(updatedUploads);
      
      return true;
    } catch (error) {
      console.error('Error deleting file from localStorage:', error);
      return false;
    }
  }
  
  // If not in local mode, use the original implementation
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/files/${id}?userId=${userId}`, {
      method: 'DELETE'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get file metadata from localStorage or server
export const getFileMetadata = async (id: string): Promise<Omit<FileData, 'password'> | null> => {
  if (IS_LOCAL_MODE) {
    try {
      const files = getLocalFiles();
      const file = files[id];
      
      if (!file) {
        return null;
      }
      
      // Remove password from response for security
      const { password, ...metadata } = file;
      return metadata;
    } catch (error) {
      console.error('Error fetching file metadata from localStorage:', error);
      return null;
    }
  }
  
  // If not in local mode, use the original implementation
  try {
    const response = await fetch(`${API_BASE_URL}/files/${id}/metadata`);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching file metadata:', error);
    return null;
  }
};

// Check if file is password protected
export const isFilePasswordProtected = async (id: string): Promise<boolean> => {
  if (IS_LOCAL_MODE) {
    try {
      const files = getLocalFiles();
      const file = files[id];
      return file && !!file.password;
    } catch (error) {
      console.error('Error checking if file is password protected:', error);
      return false;
    }
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/files/${id}/metadata`);
    
    if (!response.ok) {
      return false;
    }
    
    const metadata = await response.json();
    return metadata && metadata.hasPassword === true;
  } catch (error) {
    console.error('Error checking if file is password protected:', error);
    return false;
  }
};

// Verify file password
export const verifyFilePassword = async (id: string, password: string): Promise<boolean> => {
  if (IS_LOCAL_MODE) {
    try {
      const files = getLocalFiles();
      const file = files[id];
      return file && file.password === password;
    } catch (error) {
      console.error('Error verifying file password:', error);
      return false;
    }
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/files/${id}/verify-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    return result.isValid === true;
  } catch (error) {
    console.error('Error verifying file password:', error);
    return false;
  }
};

// Get file content from localStorage or server
export const getFileContent = async (id: string, password?: string): Promise<string | null> => {
  if (IS_LOCAL_MODE) {
    try {
      const files = getLocalFiles();
      const file = files[id];
      
      if (!file) {
        return null;
      }
      
      // Check password if required
      if (file.password && file.password !== password) {
        toast.error('Mot de passe incorrect');
        return null;
      }
      
      // Check expiry date
      if (file.expiryDate) {
        const expiryDate = new Date(file.expiryDate);
        if (expiryDate < new Date()) {
          toast.error('Ce fichier a expiré');
          return null;
        }
      }
      
      if (file.isFolder) {
        // For folders, return an object URL to a JSON file containing folder info
        const folderInfo = {
          name: file.name,
          files: file.files || []
        };
        const blob = new Blob([JSON.stringify(folderInfo)], { type: 'application/json' });
        return URL.createObjectURL(blob);
      }
      
      // For simple files, return the content directly
      return file.content;
    } catch (error) {
      console.error('Error fetching file content from localStorage:', error);
      toast.error('Erreur lors du téléchargement du fichier');
      return null;
    }
  }
  
  try {
    let url = `${API_BASE_URL}/files/${id}/download`;
    
    if (password) {
      url += `?password=${encodeURIComponent(password)}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      let errorMessage = 'Échec du téléchargement';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Si la réponse n'est pas du JSON valide, utiliser le message par défaut
      }
      
      toast.error(errorMessage);
      return null;
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching file content:', error);
    toast.error('Erreur lors du téléchargement du fichier');
    return null;
  }
};

// Update file visibility in localStorage or on server
export const updateFileVisibility = async (
  fileId: string, 
  visibility: 'public' | 'private'
): Promise<boolean> => {
  if (IS_LOCAL_MODE) {
    try {
      const files = getLocalFiles();
      const file = files[fileId];
      
      if (!file) {
        return false;
      }
      
      // Update visibility
      file.visibility = visibility;
      saveLocalFiles(files);
      
      // Update in user uploads
      const uploads = await getUserUploads();
      const upload = uploads.find(u => u.id === fileId);
      if (upload) {
        upload.visibility = visibility;
        saveUserUploads(uploads);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating file visibility in localStorage:', error);
      return false;
    }
  }
  
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/visibility`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        visibility,
        userId
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error updating file visibility:', error);
    return false;
  }
};

// Update file expiry date in localStorage or on server
export const updateFileExpiryDate = async (
  fileId: string, 
  expiryDate: Date | null
): Promise<boolean> => {
  if (IS_LOCAL_MODE) {
    try {
      const files = getLocalFiles();
      const file = files[fileId];
      
      if (!file) {
        return false;
      }
      
      // Update expiry date
      file.expiryDate = expiryDate ? expiryDate.toISOString() : null;
      saveLocalFiles(files);
      
      // Update in user uploads
      const uploads = await getUserUploads();
      const upload = uploads.find(u => u.id === fileId);
      if (upload) {
        upload.expiryDate = expiryDate ? expiryDate.toISOString() : null;
        saveUserUploads(uploads);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating file expiry date in localStorage:', error);
      return false;
    }
  }
  
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/expiry`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expiryDate: expiryDate ? expiryDate.toISOString() : null,
        userId
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error updating file expiry date:', error);
    return false;
  }
};

// Report file
export const reportFile = async (id: string, reason: string): Promise<boolean> => {
  if (IS_LOCAL_MODE) {
    try {
      const files = getLocalFiles();
      const file = files[id];
      
      if (!file) {
        return false;
      }
      
      // Increment report count
      file.reportCount = (file.reportCount || 0) + 1;
      file.reportReasons = [...(file.reportReasons || []), reason];
      saveLocalFiles(files);
      
      return true;
    } catch (error) {
      console.error('Error reporting file in localStorage:', error);
      return false;
    }
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/files/${id}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error reporting file:', error);
    return false;
  }
};

// Export the imports functions
export const getImports = getLocalImports;
