
import { Download, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFileIcon } from '@/lib/file-utils';

interface FileDisplayCardProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  previewUrl?: string;
  isProtected?: boolean;
  onDownload: () => void;
  className?: string;
}

export function FileDisplayCard({ 
  fileName, 
  fileSize, 
  fileType, 
  previewUrl, 
  isProtected,
  onDownload,
  className
}: FileDisplayCardProps) {
  return (
    <div className={cn(
      "glass rounded-2xl p-6 file-preview", 
      className
    )}>
      <div className="flex flex-col items-center">
        <div className="mb-4 relative w-full">
          {previewUrl ? (
            <div className="relative overflow-hidden rounded-xl w-full aspect-video">
              <img 
                src={previewUrl}
                alt={fileName} 
                className="object-contain w-full h-full" 
              />
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl glass-subtle w-full aspect-video">
              {getFileIcon(fileType)}
            </div>
          )}
          
          {isProtected && (
            <div className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm text-white rounded-full p-1.5">
              <Lock className="h-4 w-4" />
            </div>
          )}
        </div>
        
        <div className="text-center space-y-1 w-full">
          <p className="font-medium truncate max-w-full">{fileName}</p>
          <p className="text-sm text-muted-foreground">
            {(fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        
        <button
          onClick={onDownload}
          className="mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg w-full btn-hover-effect"
        >
          <Download className="h-4 w-4" />
          <span>Télécharger</span>
        </button>
      </div>
    </div>
  );
}
