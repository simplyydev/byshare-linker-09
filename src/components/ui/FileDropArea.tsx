
import { Upload, FolderUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropAreaProps {
  isDragActive: boolean;
  errorMessage: string | null;
  isFolderMode: boolean;
  acceptedFileTypes: string[];
  maxSizeMB: number;
}

export function FileDropArea({
  isDragActive,
  errorMessage,
  isFolderMode,
  acceptedFileTypes,
  maxSizeMB
}: FileDropAreaProps) {
  return (
    <div className={cn(
      "dropzone glass rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[300px]",
      isDragActive && "active",
      errorMessage && "border-destructive/50"
    )}>
      <div className={cn(
        "h-16 w-16 rounded-full glass-subtle flex items-center justify-center mb-4 transition-transform duration-300",
        isDragActive ? "scale-110" : "animate-float"
      )}>
        {isFolderMode ? (
          <FolderUp className="h-8 w-8 text-primary" />
        ) : (
          <Upload className="h-8 w-8 text-primary" />
        )}
      </div>
      
      <h3 className="text-xl font-medium mb-2">
        {isDragActive 
          ? "Déposez votre fichier ici" 
          : isFolderMode 
            ? "Glissez-déposez votre dossier ici"
            : "Glissez-déposez votre fichier ici"}
      </h3>
      
      <p className="text-muted-foreground mb-4 max-w-sm">
        ou <span className="text-primary font-medium">parcourez</span> vos {isFolderMode ? 'dossiers' : 'fichiers'}
        {acceptedFileTypes.length > 0 && !isFolderMode && (
          <> (formats acceptés: {acceptedFileTypes.join(', ')})</>
        )}
      </p>
      
      <p className="text-sm text-muted-foreground">
        Taille maximale: {maxSizeMB}MB
      </p>
      
      {errorMessage && (
        <div className="mt-4 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
