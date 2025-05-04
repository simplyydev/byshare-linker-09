
import { useState } from 'react';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { FileIcon, FolderUp } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploaderProps {
  maxSizeMB: number;
  acceptedFileTypes: string[];
  onFileSelect: (file: File) => void;
  onFolderSelect: (files: File[]) => void;
}

export const FileUploader = ({ 
  maxSizeMB, 
  acceptedFileTypes, 
  onFileSelect, 
  onFolderSelect 
}: FileUploaderProps) => {
  const [isFolder, setIsFolder] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    onFileSelect(selectedFile);
    setIsFolder(false);
  };

  const handleFolderSelect = (files: File[]) => {
    if (files.length === 0) {
      toast.error("Dossier vide");
      return;
    }
    
    // For demonstration, we'll just select the first file for now
    // In a complete implementation, you would handle multiple files
    onFileSelect(files[0]);
    setIsFolder(true);
    onFolderSelect(files);
  };

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {isFolder ? (
            <FolderUp className="h-5 w-5 text-primary mr-2" />
          ) : (
            <FileIcon className="h-5 w-5 text-primary mr-2" />
          )}
          <h2 className="text-xl font-medium">
            {isFolder ? "Dossier sélectionné" : "Sélectionner un fichier"}
          </h2>
        </div>
      </div>
      <FileDropzone 
        onFileSelect={handleFileSelect}
        onFolderSelect={handleFolderSelect}
        maxSizeMB={maxSizeMB}
        acceptedFileTypes={acceptedFileTypes}
      />
    </div>
  );
};
