
import { RefreshCw } from 'lucide-react';

interface ResetUploadButtonProps {
  onClick: () => void;
}

export const ResetUploadButton = ({ onClick }: ResetUploadButtonProps) => {
  return (
    <div className="text-center mt-8">
      <button
        onClick={onClick}
        className="flex items-center mx-auto text-primary hover:text-primary/80 font-medium"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Partager un autre fichier
      </button>
    </div>
  );
};
