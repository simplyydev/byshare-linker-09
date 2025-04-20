
import { useCallback, useState } from 'react';
import { Upload, X, Check, Image, File as FileIcon, Film, Music, Archive, FileText, Download, Lock, FolderUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from './switch';
import { Label } from './label';

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

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-10 w-10 text-primary" />;
    if (fileType.startsWith('video/')) return <Film className="h-10 w-10 text-primary" />;
    if (fileType.startsWith('audio/')) return <Music className="h-10 w-10 text-primary" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar') || fileType.includes('7z')) 
      return <Archive className="h-10 w-10 text-primary" />;
    if (fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('txt')) 
      return <FileText className="h-10 w-10 text-primary" />;
    return <FileIcon className="h-10 w-10 text-primary" />;
  };

  return (
    <div className={cn("w-full", className)}>
      {filePreview ? (
        <div className="glass rounded-2xl p-6 animate-scale-in">
          <div className="flex flex-col items-center">
            <div className="mb-4 relative">
              {filePreview.previewUrl ? (
                <div className="relative overflow-hidden rounded-xl w-64 h-48">
                  <img 
                    src={filePreview.previewUrl}
                    alt="Preview" 
                    className="object-contain w-full h-full" 
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-xl glass-subtle w-64 h-48">
                  {getFileIcon(filePreview.file.type)}
                </div>
              )}
              
              <button 
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-center space-y-1">
              <p className="font-medium truncate max-w-xs">{filePreview.file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(filePreview.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            
            <div className="mt-4 flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm text-green-500">Fichier prêt à être partagé</span>
            </div>
          </div>
        </div>
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
            className={cn(
              "dropzone glass rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[300px]",
              isDragActive && "active",
              errorMessage && "border-destructive/50",
              className
            )}
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
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export function FileDisplay({ 
  fileName, 
  fileSize, 
  fileType, 
  previewUrl, 
  isProtected,
  onDownload,
  className
}: { 
  fileName: string;
  fileSize: number; 
  fileType: string;
  previewUrl?: string;
  isProtected?: boolean;
  onDownload: () => void;
  className?: string;
}) {
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-10 w-10 text-primary" />;
    if (fileType.startsWith('video/')) return <Film className="h-10 w-10 text-primary" />;
    if (fileType.startsWith('audio/')) return <Music className="h-10 w-10 text-primary" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar') || fileType.includes('7z')) 
      return <Archive className="h-10 w-10 text-primary" />;
    if (fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('txt')) 
      return <FileText className="h-10 w-10 text-primary" />;
    return <FileIcon className="h-10 w-10 text-primary" />;
  };

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
