
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { 
  Upload, 
  File as FileIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Link as LinkIcon 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  uploadFileToServer, 
  ServerFile, 
  subscribeToUploadProgress, 
  subscribeToStatusChange 
} from '@/lib/serverUploadService';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Gérer la sélection de fichier
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
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

  // Copier le lien de partage dans le presse-papier
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Lien copié dans le presse-papier');
  };

  // Réinitialiser le formulaire pour un nouvel upload
  const resetUpload = () => {
    setSelectedFile(null);
    setServerFile(null);
    setUploadStatus(null);
    setUploadProgress(0);
    setShareUrl('');
    setPassword('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  return (
    <div className="space-y-6">
      {/* Interface de sélection de fichier */}
      {!selectedFile && !serverFile && (
        <div 
          className="border-2 border-dashed border-primary/30 rounded-xl p-10 text-center 
          cursor-pointer hover:border-primary/60 transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Déposez votre fichier ici</h3>
            <p className="text-muted-foreground mb-4">
              ou cliquez pour sélectionner un fichier
            </p>
            <Button variant="outline">Sélectionner un fichier</Button>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept={acceptedFileTypes.join(',')}
            />
            
            <p className="text-xs text-muted-foreground mt-4">
              Taille maximale: {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}

      {/* Affichage du fichier sélectionné */}
      {selectedFile && !isUploading && uploadStatus !== 'ready' && (
        <Card className="p-6 shadow-md bg-white/60 dark:bg-black/60 backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <FileIcon className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-medium truncate">{selectedFile.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
              
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Protection par mot de passe (optionnel)</label>
                  <input
                    type="password"
                    placeholder="Laisser vide pour aucun mot de passe"
                    className="w-full p-2 rounded-md border border-input bg-transparent"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">Expiration du fichier</label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-transparent"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                  >
                    <option value={1}>1 jour</option>
                    <option value={7}>7 jours</option>
                    <option value={30}>30 jours</option>
                    <option value={90}>90 jours</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={resetUpload}>
                    Annuler
                  </Button>
                  <Button onClick={handleUpload}>
                    Uploader
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Affichage de la progression */}
      {isUploading && uploadStatus === 'uploading' && (
        <Card className="p-6 animate-pulse shadow-md bg-white/60 dark:bg-black/60 backdrop-blur">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
                <h3 className="font-medium">Upload en cours...</h3>
              </div>
              <span className="text-sm font-bold">{uploadProgress}%</span>
            </div>
            
            <div ref={progressRef} className="relative">
              <Progress value={uploadProgress} className="h-2" />
            </div>
            
            <p className="text-sm text-muted-foreground">
              Veuillez patienter pendant l'upload de votre fichier...
            </p>
          </div>
        </Card>
      )}

      {/* Affichage du traitement */}
      {!isUploading && uploadStatus === 'processing' && (
        <Card className="p-6 shadow-md bg-white/60 dark:bg-black/60 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
              <h3 className="font-medium">Traitement du fichier...</h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Votre fichier est en cours de traitement par nos serveurs...
          </p>
        </Card>
      )}

      {/* Affichage de l'erreur */}
      {uploadStatus === 'error' && (
        <Card className="p-6 border-destructive shadow-md bg-white/60 dark:bg-black/60 backdrop-blur">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-destructive mr-2" />
            <h3 className="font-medium text-destructive">Une erreur est survenue</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Impossible de compléter l'upload de votre fichier. Veuillez réessayer.
          </p>
          <Button variant="outline" className="mt-4" onClick={resetUpload}>
            Réessayer
          </Button>
        </Card>
      )}

      {/* Affichage du succès et du lien de partage */}
      {uploadStatus === 'ready' && serverFile && (
        <Card className="p-6 shadow-md bg-white/60 dark:bg-black/60 backdrop-blur">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="font-medium text-green-700 dark:text-green-500">
              Upload terminé avec succès!
            </h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm">
              Votre fichier est maintenant disponible pour le partage. Utilisez le lien ci-dessous:
            </p>
            
            <div className="flex items-center">
              <div className="flex-1 bg-muted p-3 rounded-l-md truncate text-sm">
                {shareUrl}
              </div>
              <button 
                className="bg-primary text-primary-foreground p-3 rounded-r-md hover:bg-primary/90"
                onClick={copyShareLink}
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
            
            {serverFile.password && (
              <div className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                <Clock className="h-5 w-5 mr-2" />
                <div>
                  <p className="text-sm font-medium">Fichier protégé par mot de passe</p>
                  <p className="text-xs">Les destinataires auront besoin du mot de passe pour accéder au fichier</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md">
              <Clock className="h-5 w-5 mr-2" />
              <div>
                <p className="text-sm font-medium">Expiration du fichier</p>
                <p className="text-xs">Le lien expirera dans {expiryDays} jour{expiryDays > 1 ? 's' : ''}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={resetUpload}>
                Uploader un autre fichier
              </Button>
              <Button onClick={copyShareLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copier le lien
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
