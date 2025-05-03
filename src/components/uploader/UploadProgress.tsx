
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ServerFile } from '@/lib/serverUploadService';

interface UploadProgressProps {
  isUploading: boolean;
  uploadStatus: ServerFile['status'] | null;
  uploadProgress: number;
  onReset: () => void;
}

export function UploadProgress({ isUploading, uploadStatus, uploadProgress, onReset }: UploadProgressProps) {
  // Upload in progress
  if (isUploading && uploadStatus === 'uploading') {
    return (
      <Card className="p-6 animate-pulse shadow-md bg-white/60 dark:bg-black/60 backdrop-blur">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
              <h3 className="font-medium">Upload en cours...</h3>
            </div>
            <span className="text-sm font-bold">{uploadProgress}%</span>
          </div>
          
          <div className="relative">
            <Progress value={uploadProgress} className="h-2" />
          </div>
          
          <p className="text-sm text-muted-foreground">
            Veuillez patienter pendant l'upload de votre fichier...
          </p>
        </div>
      </Card>
    );
  }
  
  // Processing
  if (!isUploading && uploadStatus === 'processing') {
    return (
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
    );
  }

  // Error
  if (uploadStatus === 'error') {
    return (
      <Card className="p-6 border-destructive shadow-md bg-white/60 dark:bg-black/60 backdrop-blur">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-destructive mr-2" />
          <h3 className="font-medium text-destructive">Une erreur est survenue</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Impossible de compléter l'upload de votre fichier. Veuillez réessayer.
        </p>
        <Button variant="outline" className="mt-4" onClick={onReset}>
          Réessayer
        </Button>
      </Card>
    );
  }

  return null;
}
