
import { Button } from '@/components/ui/button';
import { ImportIcon } from 'lucide-react';
import { FileSelector } from '../uploader/FileSelector';

interface ServerFileSelectorProps {
  onFileSelect: (file: File) => void;
  onShowImportModal: () => void;
  maxSizeMB: number;
  acceptedFileTypes: string[];
}

export function ServerFileSelector({ 
  onFileSelect, 
  onShowImportModal, 
  maxSizeMB, 
  acceptedFileTypes 
}: ServerFileSelectorProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          onClick={onShowImportModal}
          className="gap-2"
        >
          <ImportIcon className="h-4 w-4" />
          Importer depuis l'historique local
        </Button>
      </div>
      
      <FileSelector 
        onFileSelect={onFileSelect}
        maxSizeMB={maxSizeMB}
        acceptedFileTypes={acceptedFileTypes}
      />
    </>
  );
}
