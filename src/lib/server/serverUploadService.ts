
// Service principal pour l'upload de fichiers vers le serveur
import { ServerFile, UploadOptions } from './serverTypes';
import { getUploadsFromServer, saveUploadsToServer, generateId, getAbsoluteDownloadUrl } from './serverStorageUtils';
import { emitUploadProgressEvent, emitStatusChangeEvent } from './serverEventManager';

// Simuler l'upload d'un fichier sur un serveur avec progression
export const uploadFileToServer = (
  file: File, 
  options: UploadOptions = {}
): Promise<ServerFile> => {
  return new Promise((resolve) => {
    // Créer un nouvel objet ServerFile
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
      emitUploadProgressEvent(serverFile.id, serverFile.uploadProgress);
      
      if (currentChunk >= totalChunks) {
        clearInterval(progressInterval);
        
        // Simuler un traitement serveur après l'upload
        serverFile.status = 'processing';
        emitStatusChangeEvent(serverFile.id, 'processing');
        
        setTimeout(() => {
          // L'upload est terminé
          serverFile.status = 'ready';
          serverFile.downloadUrl = getAbsoluteDownloadUrl(serverFile.id);
          
          // Sauvegarder dans une "base de données" côté serveur (simulé avec sessionStorage)
          const uploads = getUploadsFromServer();
          uploads.push(serverFile);
          saveUploadsToServer(uploads);
          
          // Notifier que le fichier est prêt
          emitStatusChangeEvent(serverFile.id, 'ready');
          
          resolve(serverFile);
        }, 1500); // Simuler un temps de traitement serveur
      }
    }, 50); // Mettre à jour la progression toutes les 50ms
  });
};
