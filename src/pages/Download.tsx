
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PasswordProtection } from '@/components/PasswordProtection';
import { toast } from 'sonner';
import { 
  getFileFromServer, 
  ServerFile, 
  verifyFilePassword 
} from '@/lib/serverUploadService';
import { 
  Download as DownloadIcon, 
  AlertCircle, 
  FileIcon, 
  Lock, 
  Clock 
} from 'lucide-react';

const Download = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<ServerFile | null>(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Identifiant de fichier manquant");
      setIsLoading(false);
      return;
    }

    // Récupérer les infos du fichier
    const serverFile = getFileFromServer(id);
    
    if (!serverFile) {
      setError("Fichier introuvable ou expiré");
      setIsLoading(false);
      return;
    }

    // Vérifier si le fichier a expiré
    if (serverFile.expiryDate) {
      const expiryDate = new Date(serverFile.expiryDate);
      if (expiryDate < new Date()) {
        setError("Ce lien a expiré");
        setIsLoading(false);
        return;
      }
    }

    setFile(serverFile);
    setIsPasswordProtected(!!serverFile.password);
    
    // Si le fichier n'est pas protégé par mot de passe, il est directement accessible
    if (!serverFile.password) {
      setIsPasswordVerified(true);
    }
    
    setIsLoading(false);
  }, [id]);

  const handlePasswordSubmit = async (password: string): Promise<boolean> => {
    if (!id) return false;
    
    const isCorrect = verifyFilePassword(id, password);
    if (isCorrect) {
      setIsPasswordVerified(true);
    }
    
    return isCorrect;
  };

  // Télécharger le fichier (simulé)
  const handleDownload = () => {
    if (!file) return;
    
    toast.success('Téléchargement démarré');
    
    // Simuler un téléchargement
    setTimeout(() => {
      toast('Fichier téléchargé avec succès', {
        icon: <DownloadIcon className="h-4 w-4 text-green-500" />,
      });
    }, 2000);
    
    // Dans une application réelle, vous redirigeriez vers le vrai fichier
    // window.location.href = file.downloadUrl;
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-md mx-auto py-12">
          <div className="glass rounded-2xl p-8 animate-pulse text-center">
            <p>Chargement du fichier...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container max-w-md mx-auto py-12">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Erreur</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/')} className="btn-hover-effect">
              Retour à l'accueil
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isPasswordProtected && !isPasswordVerified) {
    return (
      <Layout>
        <div className="container max-w-md mx-auto py-12">
          <PasswordProtection onPasswordSubmit={handlePasswordSubmit} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-12">
        {file && (
          <Card className="p-8 animate-scale-in">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <FileIcon className="h-10 w-10 text-primary" />
              </div>

              <h2 className="text-2xl font-bold mb-2 text-center">{file.name}</h2>
              <p className="text-muted-foreground mb-6">
                {formatFileSize(file.size)}
              </p>

              {file.expiryDate && (
                <div className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md mb-4 w-full">
                  <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm">
                      Ce fichier expirera le {new Date(file.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {isPasswordProtected && (
                <div className="flex items-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md mb-4 w-full">
                  <Lock className="h-5 w-5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm">Ce fichier est protégé par un mot de passe</p>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleDownload} 
                className="w-full mt-4"
                size="lg"
              >
                <DownloadIcon className="h-5 w-5 mr-2" />
                Télécharger le fichier
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Download;
