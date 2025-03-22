
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { ShareOptions } from '@/components/ui/ShareOptions';
import { FileLink } from '@/components/ui/FileLink';
import { uploadFile, loadSettings, getUploadCountForToday } from '@/lib/fileService';
import { Layout } from '@/components/Layout';
import { toast } from 'sonner';
import { FileIcon, Share, Shield, RefreshCw, FolderUp, History } from 'lucide-react';
import { MAX_UPLOADS_PER_DAY } from '@/lib/constants';
import { Button } from '@/components/ui/button';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
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

  const { maxSizeMB, acceptedFileTypes } = loadSettings();

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
    if (files.length === 0) {
      toast.error("Dossier vide");
      return;
    }
    
    // For demonstration, we'll just select the first file for now
    // In a complete implementation, you would handle multiple files
    handleFileSelect(files[0]);
    setIsFolder(true);
  };

  const handleOptionsChange = (newOptions: {
    expiryDate: Date | null;
    password: string | null;
    visibility?: 'public' | 'private';
  }) => {
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
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
                />
              </div>
              
              {file && (
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
              )}
            </div>
            
            {file && (
              <div className="space-y-6 animate-slide-up">
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <Shield className="h-5 w-5 text-primary mr-2" />
                    <h2 className="text-xl font-medium">Options de sécurité</h2>
                  </div>
                  <ShareOptions onOptionsChange={handleOptionsChange} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Upload;
