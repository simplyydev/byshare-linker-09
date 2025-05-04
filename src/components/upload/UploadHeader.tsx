
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import { MAX_UPLOADS_PER_DAY } from '@/lib/constants';
import { Button } from '@/components/ui/button';

interface UploadHeaderProps {
  uploadsToday: number;
}

export const UploadHeader = ({ uploadsToday }: UploadHeaderProps) => {
  return (
    <div className="text-center mb-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
        Partager un fichier
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        {MAX_UPLOADS_PER_DAY - uploadsToday} téléchargements restants aujourd'hui
      </p>
      
      <div className="mt-2">
        <Link to="/history">
          <Button variant="outline" className="mt-2">
            <History className="h-4 w-4 mr-2" />
            Voir mon historique de partage
          </Button>
        </Link>
      </div>
    </div>
  );
};
