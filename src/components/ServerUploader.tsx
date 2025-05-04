
import { useServerUpload } from '@/hooks/useServerUpload';
import { ServerFileSelector } from './server-uploader/ServerFileSelector';
import { FileDetails } from './uploader/FileDetails';
import { UploadProgress } from './uploader/UploadProgress';
import { UploadSuccess } from './uploader/UploadSuccess';
import { ImportModal } from './uploader/ImportModal';

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
    handleFileSelect,
    handleUpload,
    handleImport,
    resetUpload,
    handleOptionsChange,
    setShowImportModal
  } = useServerUpload(maxSizeMB);

  return (
    <div className="space-y-6">
      {/* File selection interface */}
      {!selectedFile && !serverFile && (
        <ServerFileSelector
          onFileSelect={handleFileSelect}
          onShowImportModal={() => setShowImportModal(true)}
          maxSizeMB={maxSizeMB}
          acceptedFileTypes={acceptedFileTypes}
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
      />
    </div>
  );
}
