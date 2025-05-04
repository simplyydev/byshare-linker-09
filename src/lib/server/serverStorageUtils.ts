
// Utilities for server storage operations
import { ServerFile } from './serverTypes';

// Récupérer tous les uploads du "serveur"
export const getUploadsFromServer = (): ServerFile[] => {
  const uploadsJson = sessionStorage.getItem('server_uploads');
  return uploadsJson ? JSON.parse(uploadsJson) : [];
};

// Sauvegarder les uploads sur le "serveur"
export const saveUploadsToServer = (uploads: ServerFile[]): void => {
  sessionStorage.setItem('server_uploads', JSON.stringify(uploads));
};

// Générer un identifiant unique
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Générer une URL absolue pour le téléchargement
export const getAbsoluteDownloadUrl = (fileId: string): string => {
  return `${window.location.origin}/download/${fileId}`;
};
