
import { FileLink } from '@/components/ui/FileLink';
import { UserHistoryCard } from '@/components/ui/UserHistoryCard';
import { loadSettings } from '@/lib/fileService';
import { Layout } from '@/components/Layout';
import { FileUploader } from '@/components/upload/FileUploader';
import { UploadButton } from '@/components/upload/UploadButton';
import { FileUploadOptions } from '@/components/upload/FileUploadOptions';
import { ResetUploadButton } from '@/components/upload/ResetUploadButton';
import { UploadHeader } from '@/components/upload/UploadHeader';
import { useFileUpload } from '@/hooks/useFileUpload';

const Upload = () => {
  const {
    file,
    isUploading,
    fileUrl,
    uploadsToday,
    handleFileSelect,
    handleFolderSelect,
    handleOptionsChange,
    handleUpload,
    handleReset
  } = useFileUpload();

  const { maxSizeMB, acceptedFileTypes } = loadSettings();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <UploadHeader uploadsToday={uploadsToday} />
        
        {fileUrl ? (
          <div className="space-y-6 animate-scale-in">
            <FileLink fileUrl={fileUrl} />
            <ResetUploadButton onClick={handleReset} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <FileUploader
                maxSizeMB={maxSizeMB}
                acceptedFileTypes={acceptedFileTypes}
                onFileSelect={handleFileSelect}
                onFolderSelect={handleFolderSelect}
              />
              
              {file && (
                <>
                  <UploadButton 
                    onClick={handleUpload}
                    isUploading={isUploading}
                    uploadsToday={uploadsToday}
                  />
                  
                  <FileUploadOptions onOptionsChange={handleOptionsChange} />
                </>
              )}
            </div>
            
            <div className="space-y-6 animate-slide-up">
              <UserHistoryCard />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Upload;
