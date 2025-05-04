
import { Share, RefreshCw } from 'lucide-react';
import { MAX_UPLOADS_PER_DAY } from '@/lib/constants';

interface UploadButtonProps {
  onClick: () => void;
  isUploading: boolean;
  uploadsToday: number;
}

export const UploadButton = ({ onClick, isUploading, uploadsToday }: UploadButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isUploading || uploadsToday >= MAX_UPLOADS_PER_DAY}
      className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl flex items-center justify-center font-medium btn-hover-effect disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isUploading ? (
        <>
          <div className="animate-spin mr-2">
            <RefreshCw className="h-5 w-5" />
          </div>
          Téléchargement...
        </>
      ) : (
        <>
          <Share className="h-5 w-5 mr-2" />
          Générer un lien de partage
        </>
      )}
    </button>
  );
};
