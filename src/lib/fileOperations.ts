
import { ShareOptions } from '@/components/ui/ShareOptions';
import { FileData, UploadProgress } from './types';
import { API_BASE_URL } from './apiConfig';
import { getUserId, incrementUploadCount } from './userService';
import { isUploadLimitReached } from './configService';
import { MAX_UPLOADS_PER_DAY } from './constants';
import { toast } from 'sonner';

// Upload single file to server with improved error handling and progress tracking
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

// Upload folder to server with improved handling
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

// Delete file from server
export const deleteFile = async (id: string): Promise<boolean> => {
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

// Get file metadata from server
export const getFileMetadata = async (id: string): Promise<Omit<FileData, 'password'> | null> => {
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

// Get file content from server
export const getFileContent = async (id: string, password?: string): Promise<string | null> => {
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

// Update file visibility on server
export const updateFileVisibility = async (
  fileId: string, 
  visibility: 'public' | 'private'
): Promise<boolean> => {
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

// Update file expiry date on server
export const updateFileExpiryDate = async (
  fileId: string, 
  expiryDate: Date | null
): Promise<boolean> => {
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
