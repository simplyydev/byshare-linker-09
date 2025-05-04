
// Core file operations for server
import { ServerFile, UploadOptions } from './serverTypes';
import { getUploadsFromServer, saveUploadsToServer, generateId, getAbsoluteDownloadUrl } from './serverStorageUtils';
import { emitUploadProgressEvent, emitStatusChangeEvent } from './serverEventManager';
import { getFileContent, getFileMetadata } from '../fileService';

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

// Supprimer un fichier du "serveur"
export const deleteFileFromServer = (fileId: string): boolean => {
  const uploads = getUploadsFromServer();
  const index = uploads.findIndex(file => file.id === fileId);
  
  if (index === -1) return false;
  
  uploads.splice(index, 1);
  saveUploadsToServer(uploads);
  return true;
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
    
    // Créer un nouvel objet ServerFile
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
    emitStatusChangeEvent(serverFile.id, 'processing');
    
    // Simuler un traitement serveur
    setTimeout(() => {
      // L'importation est terminée
      serverFile.status = 'ready';
      serverFile.downloadUrl = getAbsoluteDownloadUrl(serverFile.id);
      
      // Sauvegarder dans la "base de données" côté serveur
      const uploads = getUploadsFromServer();
      uploads.push(serverFile);
      saveUploadsToServer(uploads);
      
      // Notifier que le fichier est prêt
      emitStatusChangeEvent(serverFile.id, 'ready');
      
      resolve(serverFile);
    }, 1200);
  });
};
