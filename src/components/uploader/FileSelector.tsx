
import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileSelectorProps {
  onFileSelect: (file: File) => void;
  maxSizeMB: number;
  acceptedFileTypes: string[];
}

export function FileSelector({ onFileSelect, maxSizeMB, acceptedFileTypes }: FileSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    onFileSelect(files[0]);
  };

  return (
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
          onChange={handleFileChange}
          accept={acceptedFileTypes.join(',')}
        />
        
        <p className="text-xs text-muted-foreground mt-4">
          Taille maximale: {maxSizeMB}MB
        </p>
      </div>
    </div>
  );
}
