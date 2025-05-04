
import { X, Check } from 'lucide-react';
import { getFileIcon } from '@/lib/file-utils';

interface FilePreviewProps {
  file: File;
  previewUrl?: string;
  onRemove: () => void;
}

export function FilePreview({ file, previewUrl, onRemove }: FilePreviewProps) {
  return (
    <div className="glass rounded-2xl p-6 animate-scale-in">
      <div className="flex flex-col items-center">
        <div className="mb-4 relative">
          {previewUrl ? (
            <div className="relative overflow-hidden rounded-xl w-64 h-48">
              <img 
                src={previewUrl}
                alt="Preview" 
                className="object-contain w-full h-full" 
              />
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl glass-subtle w-64 h-48">
              {getFileIcon(file.type)}
            </div>
          )}
          
          <button 
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-center space-y-1">
          <p className="font-medium truncate max-w-xs">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        
        <div className="mt-4 flex items-center">
          <Check className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-sm text-green-500">Fichier prêt à être partagé</span>
        </div>
      </div>
    </div>
  );
}
