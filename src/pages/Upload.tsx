
import { Layout } from '@/components/Layout';
import { ServerUploader } from '@/components/ServerUploader';
import { UploadHeader } from '@/components/upload/UploadHeader';
import { useServerUpload } from '@/hooks/useServerUpload';
import { loadSettings } from '@/lib/file/fileSettingsService';
import { useEffect, useState } from 'react';

export default function Upload() {
  const [settings, setSettings] = useState({
    maxSizeMB: 100, 
    acceptedFileTypes: ['*']
  });
  
  const { uploadsToday } = useServerUpload();
  
  // Load settings
  useEffect(() => {
    const currentSettings = loadSettings();
    setSettings(currentSettings);
  }, []);
  
  return (
    <Layout>
      <UploadHeader uploadsToday={uploadsToday} />
      <ServerUploader 
        maxSizeMB={settings.maxSizeMB} 
        acceptedFileTypes={settings.acceptedFileTypes}
      />
    </Layout>
  );
}
