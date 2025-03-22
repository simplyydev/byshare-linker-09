
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { FileDisplay } from '@/components/ui/FileDropzone';
import { PasswordProtection } from '@/components/PasswordProtection';
import { ReportModal } from '@/components/ReportModal';
import { 
  getFileMetadata, 
  getFileContent, 
  isFilePasswordProtected,
  verifyFilePassword,
  reportFile
} from '@/lib/fileService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const FileView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<{
    id: string;
    name: string;
    size: number;
    type: string;
    content: string;
  } | null>(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Identifiant de fichier manquant");
      setIsLoading(false);
      return;
    }

    // Check if file exists and if it's password protected
    const metadata = getFileMetadata(id);
    if (!metadata) {
      setError("Fichier non trouvé ou expiré");
      setIsLoading(false);
      return;
    }

    setIsPasswordProtected(isFilePasswordProtected(id));
    
    // If file is not password protected, load content immediately
    if (!isFilePasswordProtected(id)) {
      const content = getFileContent(id);
      if (content) {
        setFile({
          id,
          name: metadata.name,
          size: metadata.size,
          type: metadata.type,
          content
        });
        setIsPasswordVerified(true);
      } else {
        setError("Impossible de charger le contenu du fichier");
      }
    }
    
    setIsLoading(false);
  }, [id]);

  const handlePasswordSubmit = async (password: string): Promise<boolean> => {
    if (!id) return false;
    
    const isCorrect = verifyFilePassword(id, password);
    if (isCorrect) {
      const metadata = getFileMetadata(id);
      const content = getFileContent(id, password);
      
      if (metadata && content) {
        setFile({
          id,
          name: metadata.name,
          size: metadata.size,
          type: metadata.type,
          content
        });
        setIsPasswordVerified(true);
      }
    }
    
    return isCorrect;
  };

  const handleDownload = () => {
    if (!file) return;
    
    // For data URLs, we can directly create a link and trigger download
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReport = async (fileId: string, reason: string): Promise<void> => {
    const success = reportFile(fileId, reason);
    if (!success) {
      throw new Error("Failed to report file");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="glass rounded-2xl p-10 text-center animate-pulse">
          <p>Chargement du fichier...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="glass rounded-2xl p-10 text-center">
          <div className="w-16 h-16 glass-subtle rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Erreur</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/')} className="btn-hover-effect">
            Retour à l'accueil
          </Button>
        </div>
      );
    }

    if (isPasswordProtected && !isPasswordVerified) {
      return <PasswordProtection onPasswordSubmit={handlePasswordSubmit} />;
    }

    if (file) {
      // Determine if we can show a preview
      let previewUrl = undefined;
      if (file.type.startsWith('image/')) {
        previewUrl = file.content;
      }

      return (
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour à l'accueil
            </Button>
          </div>
          
          <div className="glass rounded-2xl p-6 animate-scale-in mb-6">
            <h2 className="text-xl font-medium mb-6 text-center">Aperçu du fichier</h2>
            <FileDisplay
              fileName={file.name}
              fileSize={file.size}
              fileType={file.type}
              previewUrl={previewUrl}
              isProtected={isPasswordProtected}
              onDownload={handleDownload}
            />
          </div>
          
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setIsReportModalOpen(true)}
              className="glass-subtle text-muted-foreground hover:text-destructive"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Signaler un contenu inapproprié
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-6">
        {renderContent()}
        
        {file && (
          <ReportModal
            fileId={file.id}
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            onReport={handleReport}
          />
        )}
      </div>
    </Layout>
  );
};

export default FileView;
