
// Event management for server operations
import { ServerFile } from './serverTypes';

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

// Émettre un événement de progression
export const emitUploadProgressEvent = (fileId: string, progress: number): void => {
  const event = new CustomEvent('uploadProgress', { 
    detail: { fileId, progress } 
  });
  window.dispatchEvent(event);
};

// Émettre un événement de changement de statut
export const emitStatusChangeEvent = (fileId: string, status: ServerFile['status']): void => {
  const event = new CustomEvent('uploadStatusChange', {
    detail: { fileId, status }
  });
  window.dispatchEvent(event);
};
