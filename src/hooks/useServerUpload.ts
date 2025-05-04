
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  ServerFile, 
  uploadFileToServer, 
  subscribeToUploadProgress, 
  subscribeToStatusChange,
  importFromLocalStorage 
} from '@/lib/serverUploadService';
import { getUserUploads } from '@/lib/fileService';

export function useServerUpload(maxSizeMB = 500) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<ServerFile['status'] | null>(null);
  const [serverFile, setServerFile] = useState<ServerFile | null>(null);
  const [password, setPassword] = useState<string>('');
  const [expiryDays, setExpiryDays] = useState<number>(7);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [userFiles, setUserFiles] = useState<any[]>([]);

  // Load user files for import
  useEffect(() => {
    if (showImportModal) {
      setUserFiles(getUserUploads());
    }
  }, [showImportModal]);

  // Subscribe to upload events
  useEffect(() => {
    if (!isUploading) return;
    
    const unsubscribeProgress = subscribeToUploadProgress((fileId, progress) => {
      setUploadProgress(progress);
    });
    
    const unsubscribeStatus = subscribeToStatusChange((fileId, status) => {
      setUploadStatus(status);
    });
    
    return () => {
      unsubscribeProgress();
      unsubscribeStatus();
    };
  }, [isUploading]);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Size validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Le fichier est trop volumineux. La taille maximale est de ${maxSizeMB}MB.`);
      return;
    }
    
    setSelectedFile(file);
    setServerFile(null);
    setUploadStatus(null);
    setUploadProgress(0);
    setShareUrl('');
  };

  // Upload file to server
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus('uploading');
    
    try {
      const options = {
        expiryDays: expiryDays,
        password: password.length > 0 ? password : null
      };
      
      const uploaded = await uploadFileToServer(selectedFile, options);
      setServerFile(uploaded);
      
      // Generate share URL
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/download/${uploaded.id}`;
      setShareUrl(url);
      
      toast.success('Fichier uploadé avec succès!');
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Une erreur est survenue lors de l\'upload du fichier.');
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  // Import file from localStorage
  const handleImport = async (fileId: string) => {
    setIsImporting(true);
    
    try {
      const result = await importFromLocalStorage(fileId, { 
        expiryDays: expiryDays,
        password: password.length > 0 ? password : null
      });
      
      if (result) {
        setServerFile(result);
        
        // Generate share URL
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/download/${result.id}`;
        setShareUrl(url);
        
        setShowImportModal(false);
        toast.success('Fichier importé avec succès!');
        setUploadStatus('ready');
      } else {
        toast.error('Erreur lors de l\'importation du fichier.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      toast.error('Une erreur est survenue lors de l\'importation du fichier.');
    } finally {
      setIsImporting(false);
    }
  };

  // Reset upload state
  const resetUpload = () => {
    setSelectedFile(null);
    setServerFile(null);
    setUploadStatus(null);
    setUploadProgress(0);
    setShareUrl('');
    setPassword('');
  };

  // Update upload options
  const handleOptionsChange = ({ password: newPassword, expiryDays: newExpiryDays }: { password: string | null; expiryDays: number }) => {
    if (newPassword !== null) setPassword(newPassword);
    setExpiryDays(newExpiryDays);
  };

  return {
    selectedFile,
    isUploading,
    uploadProgress,
    uploadStatus,
    serverFile,
    password,
    expiryDays,
    shareUrl,
    showImportModal,
    isImporting,
    userFiles,
    handleFileSelect,
    handleUpload,
    handleImport,
    resetUpload,
    handleOptionsChange,
    setShowImportModal
  };
}
