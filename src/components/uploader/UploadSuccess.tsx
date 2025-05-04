
import { CheckCircle, Clock, Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { ServerFile } from '@/lib/serverUploadService';
import { getAbsoluteDownloadUrl } from '@/lib/serverUploadService';

interface UploadSuccessProps {
  serverFile: ServerFile;
  shareUrl: string;
  expiryDays: number;
  onReset: () => void;
}

export function UploadSuccess({ serverFile, shareUrl, expiryDays, onReset }: UploadSuccessProps) {
  // Assurer que l'URL est absolue
  const absoluteShareUrl = shareUrl.startsWith('http') 
    ? shareUrl 
    : getAbsoluteDownloadUrl(serverFile.id);

  const copyShareLink = () => {
    navigator.clipboard.writeText(absoluteShareUrl);
    toast.success('Lien copié dans le presse-papier');
  };

  return (
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
            {absoluteShareUrl}
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
          <Button variant="outline" onClick={onReset}>
            Uploader un autre fichier
          </Button>
          <Button onClick={copyShareLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copier le lien
          </Button>
        </div>
      </div>
    </Card>
  );
}
