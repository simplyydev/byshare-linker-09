
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { Switch } from './switch';
import { Label } from './label';
import { FilePreview } from './FilePreview';
import { FileDropArea } from './FileDropArea';
import { FileDisplayCard } from './FileDisplayCard';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  onFolderSelect?: (files: File[]) => void;
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
  className?: string;
}

export function FileDropzone({ 
  onFileSelect, 
  onFolderSelect,
  maxSizeMB = 100, 
  acceptedFileTypes = [], 
  className 
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState<{ file: File; previewUrl?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFolderMode, setIsFolderMode] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const validateFile = useCallback((file: File): boolean => {
    setErrorMessage(null);
    
    // Size validation (convert MB to bytes)
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`);
      return false;
    }
    
    // File type validation
    if (acceptedFileTypes.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileType = file.type;
      
      const isValidType = acceptedFileTypes.some(type => {
        if (type.startsWith('.')) {
          // Extension based validation
          return `.${fileExtension}` === type;
        } else {
          // MIME type based validation
          return fileType.match(new RegExp(type.replace('*', '.*')));
        }
      });
      
      if (!isValidType) {
        setErrorMessage(`Type de fichier non supporté. Types acceptés: ${acceptedFileTypes.join(', ')}`);
        return false;
      }
    }
    
    return true;
  }, [maxSizeMB, acceptedFileTypes]);

  const processFile = useCallback((file: File) => {
    if (!validateFile(file)) return;
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview({ file, previewUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview({ file });
    }
    
    onFileSelect(file);
  }, [onFileSelect, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      if (isFolderMode && onFolderSelect) {
        // Handle folder upload
        const files = Array.from(e.target.files);
        onFolderSelect(files);
        
        // For preview, show the first file
        if (files.length > 0) {
          processFile(files[0]);
        }
      } else {
        // Handle single file upload
        processFile(e.target.files[0]);
      }
    }
  }, [processFile, isFolderMode, onFolderSelect]);

  const handleRemoveFile = useCallback(() => {
    setFilePreview(null);
    setErrorMessage(null);
  }, []);

  return (
    <div className={cn("w-full", className)}>
      {filePreview ? (
        <FilePreview
          file={filePreview.file}
          previewUrl={filePreview.previewUrl}
          onRemove={handleRemoveFile}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="folder-mode"
                checked={isFolderMode}
                onCheckedChange={setIsFolderMode}
              />
              <Label htmlFor="folder-mode" className="cursor-pointer">
                {isFolderMode ? 'Mode dossier activé' : 'Mode fichier unique'}
              </Label>
            </div>
          </div>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="fileInput"
              type="file"
              className="hidden"
              onChange={handleChange}
              accept={acceptedFileTypes.join(',')}
              {...(isFolderMode ? { webkitdirectory: "", directory: "" } : {})}
            />
            
            <label htmlFor="fileInput" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
              <FileDropArea
                isDragActive={isDragActive}
                errorMessage={errorMessage}
                isFolderMode={isFolderMode}
                acceptedFileTypes={acceptedFileTypes}
                maxSizeMB={maxSizeMB}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export FileDisplayCard with aliased name to maintain backwards compatibility
export { FileDisplayCard as FileDisplay };
