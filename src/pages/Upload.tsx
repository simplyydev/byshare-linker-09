
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { ShareOptions } from '@/components/ui/ShareOptions';
import { FileLink } from '@/components/ui/FileLink';
import { UserHistoryCard } from '@/components/ui/UserHistoryCard';
import { 
  uploadFile, 
  uploadFolder, 
  loadSettings, 
  getUploadCountForToday,
  UploadProgress 
} from '@/lib/fileService';
import { Layout } from '@/components/Layout';
import { toast } from 'sonner';
import { FileIcon, Share, Shield, RefreshCw, FolderUp, History } from 'lucide-react';
import { MAX_UPLOADS_PER_DAY } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import config from '@/lib/config';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [folderFiles, setFolderFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<{
    expiryDate: Date | null;
    password: string | null;
    visibility?: 'public' | 'private';
  }>({
    expiryDate: null,
    password: null,
    visibility: 'public'
  });
  const [uploadsToday, setUploadsToday] = useState(0);
  const [isFolder, setIsFolder] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | undefined>(undefined);

  const { maxSizeMB, acceptedFileTypes } = loadSettings();

  useEffect(() => {
    const count = getUploadCountForToday();
    setUploadsToday(count);
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setIsFolder(false);
    setFolderFiles([]);
    if (fileUrl) {
      setFileUrl(null);
    }
    setUploadProgress(undefined);
  };

  const handleFolderSelect = (files: File[]) => {
    if (files.length === 0) {
      toast.error("Dossier vide");
      return;
    }
    
    setFolderFiles(files);
    setIsFolder(true);
    setFile(null);
    if (fileUrl) {
      setFileUrl(null);
    }
    setUploadProgress(undefined);
  };

  const handleOptionsChange = (newOptions: {
    expiryDate: Date | null;
    password: string | null;
    visibility?: 'public' | 'private';
  }) => {
    setOptions(newOptions);
  };

  const handleUploadProgress = (progress: UploadProgress) => {
    setUploadProgress(progress.progress);
  };

  const handleUpload = async () => {
    if (!file && folderFiles.length === 0) {
      toast.error("Veuillez sélectionner un fichier ou un dossier");
      return;
    }

    if (uploadsToday >= MAX_UPLOADS_PER_DAY) {
      toast.error(`Limite de ${MAX_UPLOADS_PER_DAY} téléchargements par jour atteinte. Réessayez demain.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      let result;
      
      if (isFolder && folderFiles.length > 0) {
        // Upload folder
        result = await uploadFolder(folderFiles, options, handleUploadProgress);
      } else if (file) {
        // Upload single file
        result = await uploadFile(file, options, handleUploadProgress);
      } else {
        throw new Error("Aucun fichier à télécharger");
      }
      
      setFileUrl(result.url);
      setUploadsToday(prev => prev + 1);
      toast.success("Fichier téléchargé avec succès!");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Erreur lors du téléchargement du fichier");
    } finally {
      setIsUploading(false);
      setUploadProgress(undefined);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFolderFiles([]);
    setFileUrl(null);
    setIsFolder(false);
    setOptions({
      expiryDate: null,
      password: null,
      visibility: 'public'
    });
    setUploadProgress(undefined);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            Partager un fichier
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {MAX_UPLOADS_PER_DAY - uploadsToday} téléchargements restants aujourd'hui
          </p>
          
          <div className="mt-2">
            <Link to="/history">
              <Button variant="outline" className="mt-2">
                <History className="h-4 w-4 mr-2" />
                Voir mon historique de partage
              </Button>
            </Link>
          </div>
        </div>

        {fileUrl ? (
          <div className="space-y-6 animate-scale-in">
            <FileLink fileUrl={fileUrl} />
            
            <div className="text-center mt-8">
              <button
                onClick={handleReset}
                className="flex items-center mx-auto text-primary hover:text-primary/80 font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Partager un autre fichier
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-2xl p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {isFolder ? (
                      <FolderUp className="h-5 w-5 text-primary mr-2" />
                    ) : (
                      <FileIcon className="h-5 w-5 text-primary mr-2" />
                    )}
                    <h2 className="text-xl font-medium">
                      {isFolder ? "Dossier sélectionné" : "Sélectionner un fichier"}
                    </h2>
                  </div>
                </div>
                <FileDropzone 
                  onFileSelect={handleFileSelect}
                  onFolderSelect={handleFolderSelect}
                  maxSizeMB={maxSizeMB}
                  acceptedFileTypes={acceptedFileTypes}
                  uploadProgress={uploadProgress}
                />
              </div>
              
              {(file || folderFiles.length > 0) && (
                <>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading || uploadsToday >= MAX_UPLOADS_PER_DAY}
                    className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl flex items-center justify-center font-medium btn-hover-effect disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin mr-2">
                          <RefreshCw className="h-5 w-5" />
                        </div>
                        Téléchargement...
                      </>
                    ) : (
                      <>
                        <Share className="h-5 w-5 mr-2" />
                        Générer un lien de partage
                      </>
                    )}
                  </button>
                  
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center mb-4">
                      <Shield className="h-5 w-5 text-primary mr-2" />
                      <h2 className="text-xl font-medium">Options de sécurité</h2>
                    </div>
                    <ShareOptions onOptionsChange={handleOptionsChange} />
                  </div>
                </>
              )}
            </div>
            
            <div className="space-y-6 animate-slide-up">
              <UserHistoryCard />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Upload;
