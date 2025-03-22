
import { useState } from 'react';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { ShareOptions } from '@/components/ui/ShareOptions';
import { FileLink } from '@/components/ui/FileLink';
import { uploadFile, loadSettings } from '@/lib/fileService';
import { Layout } from '@/components/Layout';
import { toast } from 'sonner';
import { FileIcon, Share, Shield, RefreshCw } from 'lucide-react';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<{
    expiryDate: Date | null;
    password: string | null;
  }>({
    expiryDate: null,
    password: null
  });

  const { maxSizeMB, acceptedFileTypes } = loadSettings();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    // Reset file URL if a new file is selected
    if (fileUrl) {
      setFileUrl(null);
    }
  };

  const handleOptionsChange = (newOptions: {
    expiryDate: Date | null;
    password: string | null;
  }) => {
    setOptions(newOptions);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFile(file, options);
      setFileUrl(result.url);
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
      password: null
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            By'Share
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Partagez facilement vos fichiers sans inscription, en toute sécurité
          </p>
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
                <div className="flex items-center mb-4">
                  <FileIcon className="h-5 w-5 text-primary mr-2" />
                  <h2 className="text-xl font-medium">Sélectionner un fichier</h2>
                </div>
                <FileDropzone 
                  onFileSelect={handleFileSelect} 
                  maxSizeMB={maxSizeMB}
                  acceptedFileTypes={acceptedFileTypes}
                />
              </div>
              
              {file && (
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl flex items-center justify-center font-medium btn-hover-effect"
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

export default Index;
