
// Admin settings management
import { loadSettings, saveSettings } from '@/lib/file/fileSettingsService';
import { toast } from 'sonner';

// Update max file size setting
export const updateMaxFileSizeSetting = (maxSizeMB: number): boolean => {
  try {
    const settings = loadSettings();
    settings.maxSizeMB = maxSizeMB;
    saveSettings(settings);
    toast.success('Taille maximale mise à jour avec succès');
    return true;
  } catch (error) {
    toast.error('Erreur lors de la mise à jour de la taille maximale');
    return false;
  }
};

// Add a file type to accepted types
export const addAcceptedFileType = (fileType: string): boolean => {
  try {
    const settings = loadSettings();
    if (!settings.acceptedFileTypes.includes(fileType)) {
      settings.acceptedFileTypes.push(fileType);
      saveSettings(settings);
      toast.success('Type de fichier ajouté avec succès');
    }
    return true;
  } catch (error) {
    toast.error('Erreur lors de l\'ajout du type de fichier');
    return false;
  }
};

// Remove a file type from accepted types
export const removeAcceptedFileType = (fileType: string): boolean => {
  try {
    const settings = loadSettings();
    settings.acceptedFileTypes = settings.acceptedFileTypes.filter(type => type !== fileType);
    saveSettings(settings);
    toast.success('Type de fichier supprimé avec succès');
    return true;
  } catch (error) {
    toast.error('Erreur lors de la suppression du type de fichier');
    return false;
  }
};

// Get current settings
export const getCurrentSettings = () => {
  return loadSettings();
};
