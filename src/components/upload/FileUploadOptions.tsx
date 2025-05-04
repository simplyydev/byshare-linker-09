
import { useState } from 'react';
import { ShareOptions } from '@/components/ui/ShareOptions';
import { Shield } from 'lucide-react';

interface FileUploadOptionsProps {
  onOptionsChange: (options: {
    expiryDate: Date | null;
    password: string | null;
    visibility?: 'public' | 'private';
  }) => void;
}

export const FileUploadOptions = ({ onOptionsChange }: FileUploadOptionsProps) => {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center mb-4">
        <Shield className="h-5 w-5 text-primary mr-2" />
        <h2 className="text-xl font-medium">Options de sécurité</h2>
      </div>
      <ShareOptions onOptionsChange={onOptionsChange} />
    </div>
  );
};
