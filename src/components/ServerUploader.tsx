
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ImportIcon } from 'lucide-react';
import { toast } from 'sonner';
import { 
  uploadFileToServer, 
  ServerFile, 
  subscribeToUploadProgress, 
  subscribeToStatusChange,
  importFromLocalStorage 
} from '@/lib/serverUploadService';
import { getUserUploads } from '@/lib/fileService';
import { FileSelector } from './uploader/FileSelector';
import { FileDetails } from './uploader/FileDetails';
import { UploadProgress } from './uploader/UploadProgress';
import { UploadSuccess } from './uploader/UploadSuccess';
import { ImportModal } from './uploader/ImportModal';

interface ServerUploaderProps {
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
}

export function ServerUploader({ 
  maxSizeMB = 500, 
  acceptedFileTypes = ['*'] 
}: ServerUploaderProps) {
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

  // Charger les fichiers de l'utilisateur pour l'importation
  useEffect(() => {
    if (showImportModal) {
      setUserFiles(getUserUploads());
    }
  }, [showImportModal]);

  // Gérer la sélection de fichier
  const handleFileSelect = (file: File) => {
    // Vérifier la taille du fichier
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Le fichier est trop volumineux. La taille maximale est de ${maxSizeMB}MB.`);
      return;
    }
    
    // Vérifier le type de fichier si des restrictions sont définies
    if (acceptedFileTypes[0] !== '*') {
      const isAccepted = acceptedFileTypes.some(type => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return file.type.startsWith(category + '/');
        }
        return file.type === type;
      });
      
      if (!isAccepted) {
        toast.error('Ce type de fichier n\'est pas accepté.');
        return;
      }
    }

    setSelectedFile(file);
    setServerFile(null);
    setUploadStatus(null);
    setUploadProgress(0);
    setShareUrl('');
  };

  // Upload du fichier vers le "serveur"
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
      
      // Générer l'URL de partage
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

  // Importer un fichier depuis localStorage vers le serveur
  const handleImport = async (fileId: string) => {
    setIsImporting(true);
    
    try {
      const result = await importFromLocalStorage(fileId, { 
        expiryDays: expiryDays,
        password: password.length > 0 ? password : null
      });
      
      if (result) {
        setServerFile(result);
        
        // Générer l'URL de partage
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

  // S'abonner aux mises à jour de progression
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

  // Réinitialiser le formulaire pour un nouvel upload
  const resetUpload = () => {
    setSelectedFile(null);
    setServerFile(null);
    setUploadStatus(null);
    setUploadProgress(0);
    setShareUrl('');
    setPassword('');
  };

  // Gérer les changements d'options
  const handleOptionsChange = ({ password: newPassword, expiryDays: newExpiryDays }: { password: string | null; expiryDays: number }) => {
    if (newPassword !== null) setPassword(newPassword);
    setExpiryDays(newExpiryDays);
  };

  return (
    <div className="space-y-6">
      {/* Interface de sélection de fichier */}
      {!selectedFile && !serverFile && (
        <>
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowImportModal(true)}
              className="gap-2"
            >
              <ImportIcon className="h-4 w-4" />
              Importer depuis l'historique local
            </Button>
          </div>
          
          <FileSelector 
            onFileSelect={handleFileSelect}
            maxSizeMB={maxSizeMB}
            acceptedFileTypes={acceptedFileTypes}
          />
        </>
      )}

      {/* Affichage du fichier sélectionné */}
      {selectedFile && !isUploading && uploadStatus !== 'ready' && (
        <FileDetails 
          file={selectedFile}
          onUpload={handleUpload}
          onCancel={resetUpload}
          onOptionsChange={handleOptionsChange}
          isUploading={isUploading}
        />
      )}

      {/* Affichage de la progression et des états */}
      <UploadProgress 
        isUploading={isUploading}
        uploadStatus={uploadStatus}
        uploadProgress={uploadProgress}
        onReset={resetUpload}
      />

      {/* Affichage du succès et du lien de partage */}
      {uploadStatus === 'ready' && serverFile && (
        <UploadSuccess 
          serverFile={serverFile}
          shareUrl={shareUrl}
          expiryDays={expiryDays}
          onReset={resetUpload}
        />
      )}

      {/* Modal d'importation */}
      <ImportModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        userFiles={userFiles}
        onImport={handleImport}
        isImporting={isImporting}
      />
    </div>
  );
}
