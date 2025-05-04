
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { uploadFile, getUploadCountForToday } from '@/lib/fileService';
import { MAX_UPLOADS_PER_DAY } from '@/lib/constants';

interface FileUploadOptions {
  expiryDate: Date | null;
  password: string | null;
  visibility?: 'public' | 'private';
}

export const useFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<FileUploadOptions>({
    expiryDate: null,
    password: null,
    visibility: 'public'
  });
  const [uploadsToday, setUploadsToday] = useState(0);
  const [isFolder, setIsFolder] = useState(false);

  useEffect(() => {
    const count = getUploadCountForToday();
    setUploadsToday(count);
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    // Reset file URL if a new file is selected
    if (fileUrl) {
      setFileUrl(null);
    }
  };

  const handleFolderSelect = (files: File[]) => {
    setIsFolder(true);
  };

  const handleOptionsChange = (newOptions: FileUploadOptions) => {
    setOptions(newOptions);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    if (uploadsToday >= MAX_UPLOADS_PER_DAY) {
      toast.error(`Limite de ${MAX_UPLOADS_PER_DAY} téléchargements par jour atteinte. Réessayez demain.`);
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFile(file, options);
      setFileUrl(result.url);
      setUploadsToday(prev => prev + 1);
      toast.success("Fichier téléchargé avec succès!");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Erreur lors du téléchargement du fichier");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileUrl(null);
    setOptions({
      expiryDate: null,
      password: null,
      visibility: 'public'
    });
    setIsFolder(false);
  };

  return {
    file,
    isUploading,
    fileUrl,
    options,
    uploadsToday,
    isFolder,
    handleFileSelect,
    handleFolderSelect,
    handleOptionsChange,
    handleUpload,
    handleReset
  };
};
