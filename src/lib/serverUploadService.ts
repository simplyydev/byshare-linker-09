// Ce service simule l'upload de fichiers vers un serveur plutôt que de les stocker dans le localStorage

import { getFileContent, getFileMetadata } from './fileService';

// Types
export interface ServerFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  expiryDate: string | null;
  downloadUrl: string;
  password: string | null;
  uploadProgress?: number; // Pour simuler la progression de l'upload
  status: 'uploading' | 'processing' | 'ready' | 'error';
}

interface UploadOptions {
  expiryDays?: number;
  password?: string | null;
}

// Générer un identifiant unique
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Générer une URL absolue pour le téléchargement
export const getAbsoluteDownloadUrl = (fileId: string): string => {
  return `${window.location.origin}/download/${fileId}`;
};

// Simuler l'upload d'un fichier sur un serveur avec progression
export const uploadFileToServer = (
  file: File, 
  options: UploadOptions = {}
): Promise<ServerFile> => {
  return new Promise((resolve, reject) => {
    // Créer un nouvel objet ServeurFile
    const serverFile: ServerFile = {
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      expiryDate: options.expiryDays 
        ? new Date(Date.now() + options.expiryDays * 24 * 60 * 60 * 1000).toISOString() 
        : null,
      downloadUrl: '', // Sera défini après "l'upload"
      password: options.password || null,
      uploadProgress: 0,
      status: 'uploading'
    };

    // Simuler la progression d'upload en temps réel
    const totalChunks = 100; // Diviser l'upload en 100 "morceaux" pour simuler la progression
    let currentChunk = 0;
    
    // Tracker de progression
    const progressInterval = setInterval(() => {
      currentChunk++;
      serverFile.uploadProgress = Math.floor((currentChunk / totalChunks) * 100);
      
      // Notifier les écouteurs de progression
      const event = new CustomEvent('uploadProgress', { 
        detail: { fileId: serverFile.id, progress: serverFile.uploadProgress } 
      });
      window.dispatchEvent(event);
      
      if (currentChunk >= totalChunks) {
        clearInterval(progressInterval);
        
        // Simuler un traitement serveur après l'upload
        serverFile.status = 'processing';
        const processingEvent = new CustomEvent('uploadStatusChange', {
          detail: { fileId: serverFile.id, status: 'processing' }
        });
        window.dispatchEvent(processingEvent);
        
        setTimeout(() => {
          // L'upload est terminé
          serverFile.status = 'ready';
          serverFile.downloadUrl = getAbsoluteDownloadUrl(serverFile.id);
          
          // Sauvegarder dans une "base de données" côté serveur (simulé avec sessionStorage)
          const uploads = getUploadsFromServer();
          uploads.push(serverFile);
          saveUploadsToServer(uploads);
          
          // Notifier que le fichier est prêt
          const readyEvent = new CustomEvent('uploadStatusChange', {
            detail: { fileId: serverFile.id, status: 'ready' }
          });
          window.dispatchEvent(readyEvent);
          
          resolve(serverFile);
        }, 1500); // Simuler un temps de traitement serveur
      }
    }, 50); // Mettre à jour la progression toutes les 50ms
  });
};

// Importer un fichier depuis localStorage vers le serveur
export const importFromLocalStorage = async (
  fileId: string, 
  options: UploadOptions = {}
): Promise<ServerFile | null> => {
  return new Promise((resolve, reject) => {
    // Récupérer les données du fichier depuis localStorage
    const fileMetadata = getFileMetadata(fileId);
    const fileContent = getFileContent(fileId);
    
    if (!fileMetadata || !fileContent) {
      reject(new Error("Fichier non trouvé dans le stockage local"));
      return;
    }
    
    // Créer un nouvel objet ServeurFile
    const serverFile: ServerFile = {
      id: generateId(), // Nouveau ID sur le serveur
      name: fileMetadata.name,
      size: fileMetadata.size,
      type: fileMetadata.type,
      uploadDate: new Date().toISOString(),
      expiryDate: options.expiryDays 
        ? new Date(Date.now() + options.expiryDays * 24 * 60 * 60 * 1000).toISOString() 
        : null,
      downloadUrl: '',
      password: options.password || null,
      status: 'processing'
    };
    
    // Notifier les écouteurs du statut
    const processingEvent = new CustomEvent('uploadStatusChange', {
      detail: { fileId: serverFile.id, status: 'processing' }
    });
    window.dispatchEvent(processingEvent);
    
    // Simuler un traitement serveur
    setTimeout(() => {
      // L'importation est terminée
      serverFile.status = 'ready';
      serverFile.downloadUrl = `/download/${serverFile.id}`;
      
      // Sauvegarder dans la "base de données" côté serveur
      const uploads = getUploadsFromServer();
      uploads.push(serverFile);
      saveUploadsToServer(uploads);
      
      // Notifier que le fichier est prêt
      const readyEvent = new CustomEvent('uploadStatusChange', {
        detail: { fileId: serverFile.id, status: 'ready' }
      });
      window.dispatchEvent(readyEvent);
      
      resolve(serverFile);
    }, 1200);
  });
};

// Récupérer un fichier depuis le "serveur" par son ID
export const getFileFromServer = (fileId: string): ServerFile | null => {
  const uploads = getUploadsFromServer();
  return uploads.find(file => file.id === fileId) || null;
};

// Vérifier le mot de passe d'un fichier
export const verifyFilePassword = (fileId: string, password: string): boolean => {
  const file = getFileFromServer(fileId);
  if (!file || !file.password) return false;
  return file.password === password;
};

// Récupérer tous les uploads du "serveur"
export const getUploadsFromServer = (): ServerFile[] => {
  const uploadsJson = sessionStorage.getItem('server_uploads');
  return uploadsJson ? JSON.parse(uploadsJson) : [];
};

// Sauvegarder les uploads sur le "serveur"
const saveUploadsToServer = (uploads: ServerFile[]): void => {
  sessionStorage.setItem('server_uploads', JSON.stringify(uploads));
};

// Supprimer un fichier du "serveur"
export const deleteFileFromServer = (fileId: string): boolean => {
  const uploads = getUploadsFromServer();
  const index = uploads.findIndex(file => file.id === fileId);
  
  if (index === -1) return false;
  
  uploads.splice(index, 1);
  saveUploadsToServer(uploads);
  return true;
};

// S'abonner aux changements de progression
export const subscribeToUploadProgress = (
  callback: (fileId: string, progress: number) => void
): () => void => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail.fileId, customEvent.detail.progress);
  };
  
  window.addEventListener('uploadProgress', handler);
  
  // Retourner une fonction pour se désabonner
  return () => {
    window.removeEventListener('uploadProgress', handler);
  };
};

// S'abonner aux changements de statut
export const subscribeToStatusChange = (
  callback: (fileId: string, status: ServerFile['status']) => void
): () => void => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail.fileId, customEvent.detail.status);
  };
  
  window.addEventListener('uploadStatusChange', handler);
  
  // Retourner une fonction pour se désabonner
  return () => {
    window.removeEventListener('uploadStatusChange', handler);
  };
};
