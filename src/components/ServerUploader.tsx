
import { useServerUpload } from '@/hooks/useServerUpload';
import { ServerFileSelector } from './server-uploader/ServerFileSelector';
import { FileDetails } from './uploader/FileDetails';
import { UploadProgress } from './uploader/UploadProgress';
import { UploadSuccess } from './uploader/UploadSuccess';
import { ImportModal } from './uploader/ImportModal';
import { Alert } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { MAX_UPLOADS_PER_DAY } from '@/lib/constants';

interface ServerUploaderProps {
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
}

export function ServerUploader({ 
  maxSizeMB = 500, 
  acceptedFileTypes = ['*'] 
}: ServerUploaderProps) {
  const {
    selectedFile,
    isUploading,
    uploadProgress,
    uploadStatus,
    serverFile,
    shareUrl,
    expiryDays,
    showImportModal,
    isImporting,
    userFiles,
    uploadsToday,
    handleFileSelect,
    handleUpload,
    handleImport,
    resetUpload,
    handleOptionsChange,
    setShowImportModal
  } = useServerUpload(maxSizeMB);

  const isLimitReached = uploadsToday >= MAX_UPLOADS_PER_DAY;

  return (
    <div className="space-y-6">
      {/* Upload limit warning */}
      {isLimitReached && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>
            Vous avez atteint la limite de {MAX_UPLOADS_PER_DAY} téléchargements aujourd'hui. 
            Revenez demain pour continuer à partager des fichiers.
          </span>
        </Alert>
      )}
      
      {/* File selection interface */}
      {!selectedFile && !serverFile && (
        <ServerFileSelector
          onFileSelect={handleFileSelect}
          onShowImportModal={() => setShowImportModal(true)}
          maxSizeMB={maxSizeMB}
          acceptedFileTypes={acceptedFileTypes}
          isDisabled={isLimitReached}
          uploadsToday={uploadsToday}
        />
      )}

      {/* Selected file display */}
      {selectedFile && !isUploading && uploadStatus !== 'ready' && (
        <FileDetails 
          file={selectedFile}
          onUpload={handleUpload}
          onCancel={resetUpload}
          onOptionsChange={handleOptionsChange}
          isUploading={isUploading}
          disabled={isLimitReached}
        />
      )}

      {/* Upload progress and status */}
      <UploadProgress 
        isUploading={isUploading}
        uploadStatus={uploadStatus}
        uploadProgress={uploadProgress}
        onReset={resetUpload}
      />

      {/* Success display and share link */}
      {uploadStatus === 'ready' && serverFile && (
        <UploadSuccess 
          serverFile={serverFile}
          shareUrl={shareUrl}
          expiryDays={expiryDays}
          onReset={resetUpload}
        />
      )}

      {/* Import modal */}
      <ImportModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        userFiles={userFiles}
        onImport={handleImport}
        isImporting={isImporting}
        disabled={isLimitReached}
      />
    </div>
  );
}
