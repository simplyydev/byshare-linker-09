
import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileSelectorProps {
  onFileSelect: (file: File) => void;
  maxSizeMB: number;
  acceptedFileTypes: string[];
  disabled?: boolean;
}

export function FileSelector({ onFileSelect, maxSizeMB, acceptedFileTypes, disabled = false }: FileSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    onFileSelect(files[0]);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-xl p-10 text-center transition-all",
        disabled 
          ? "border-muted-foreground/30 bg-muted/10 cursor-not-allowed" 
          : "border-primary/30 cursor-pointer hover:border-primary/60"
      )}
      onClick={disabled ? undefined : handleClick}
    >
      <div className="flex flex-col items-center">
        <div className={cn(
          "h-16 w-16 rounded-full flex items-center justify-center mb-4",
          disabled ? "bg-muted/20" : "bg-primary/10" 
        )}>
          <Upload className={cn(
            "h-8 w-8",
            disabled ? "text-muted-foreground" : "text-primary"
          )} />
        </div>
        <h3 className={cn(
          "text-xl font-medium mb-2",
          disabled && "text-muted-foreground"
        )}>
          {disabled ? "Téléchargement indisponible" : "Déposez votre fichier ici"}
        </h3>
        <p className="text-muted-foreground mb-4">
          {disabled 
            ? "La limite quotidienne de téléchargements a été atteinte"
            : "ou cliquez pour sélectionner un fichier"
          }
        </p>
        <Button variant="outline" disabled={disabled}>
          Sélectionner un fichier
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={acceptedFileTypes.join(',')}
          disabled={disabled}
        />
        
        <p className="text-xs text-muted-foreground mt-4">
          Taille maximale: {maxSizeMB}MB
        </p>
      </div>
    </div>
  );
}
