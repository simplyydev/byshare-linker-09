
import { useState } from 'react';
import { ImportIcon, FileIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userFiles: any[];
  onImport: (fileId: string) => void;
  isImporting: boolean;
}

export function ImportModal({ isOpen, onClose, userFiles, onImport, isImporting }: ImportModalProps) {
  if (!isOpen) return null;
  
  // Formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Importer depuis l'historique local</h3>
        
        {userFiles.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Aucun fichier trouvé dans l'historique local</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userFiles.map(file => (
              <div key={file.id} className="glass rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.fileSize)}
                    </p>
                    <div className="mt-2">
                      <Button 
                        size="sm" 
                        onClick={() => onImport(file.id)}
                        disabled={isImporting}
                        className="w-full"
                      >
                        {isImporting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ImportIcon className="h-4 w-4 mr-2" />
                        )}
                        Importer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-end mt-6 space-x-3">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
