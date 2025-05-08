
import { FileIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SecurityOptions } from './SecurityOptions';

interface FileDetailsProps {
  file: File;
  onUpload: () => void;
  onCancel: () => void;
  onOptionsChange: (options: { password: string | null; expiryDays: number }) => void;
  isUploading: boolean;
  disabled?: boolean;
}

export function FileDetails({ file, onUpload, onCancel, onOptionsChange, isUploading, disabled = false }: FileDetailsProps) {
  // Formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  return (
    <Card className="p-6 shadow-md bg-white/60 dark:bg-black/60 backdrop-blur">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <FileIcon className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium truncate">{file.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
          
          <div className="space-y-4 mt-4">
            <SecurityOptions onChange={onOptionsChange} />
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onCancel} disabled={isUploading}>
                Annuler
              </Button>
              <Button 
                onClick={onUpload} 
                disabled={isUploading || disabled}
              >
                {disabled ? "Limite atteinte" : "Uploader"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
