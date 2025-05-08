
import { Button } from '@/components/ui/button';
import { ImportIcon } from 'lucide-react';
import { FileSelector } from '../uploader/FileSelector';
import { MAX_UPLOADS_PER_DAY } from '@/lib/constants';

interface ServerFileSelectorProps {
  onFileSelect: (file: File) => void;
  onShowImportModal: () => void;
  maxSizeMB: number;
  acceptedFileTypes: string[];
  isDisabled?: boolean;
  uploadsToday: number;
}

export function ServerFileSelector({ 
  onFileSelect, 
  onShowImportModal, 
  maxSizeMB, 
  acceptedFileTypes,
  isDisabled = false,
  uploadsToday
}: ServerFileSelectorProps) {
  const remainingUploads = MAX_UPLOADS_PER_DAY - uploadsToday;
  
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {uploadsToday < MAX_UPLOADS_PER_DAY ? (
            <span>Téléchargements restants aujourd'hui: <strong>{remainingUploads}</strong></span>
          ) : (
            <span className="text-destructive">Limite de téléchargements atteinte pour aujourd'hui</span>
          )}
        </div>
        <Button 
          variant="outline" 
          onClick={onShowImportModal}
          className="gap-2"
          disabled={isDisabled}
        >
          <ImportIcon className="h-4 w-4" />
          Importer depuis l'historique local
        </Button>
      </div>
      
      <FileSelector 
        onFileSelect={onFileSelect}
        maxSizeMB={maxSizeMB}
        acceptedFileTypes={acceptedFileTypes}
        disabled={isDisabled}
      />
    </>
  );
}
