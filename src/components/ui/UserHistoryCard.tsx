
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Trash2, 
  Image, 
  FileText, 
  Film,
  Music,
  Archive,
  FileIcon,
  ExternalLink,
  Clock,
  Lock,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  getUserUploads, 
  deleteFile,
  UserUploadHistory 
} from '@/lib/fileService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const UserHistoryCard = () => {
  const [history, setHistory] = useState<UserUploadHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const uploads = await getUserUploads();
      // Only show the most recent 5 uploads
      setHistory(uploads.slice(0, 5));
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Impossible de charger l\'historique');
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      try {
        const success = await deleteFile(fileId);
        if (success) {
          toast.success('Fichier supprimé avec succès');
          loadHistory();
        } else {
          toast.error('Erreur lors de la suppression du fichier');
        }
      } catch (err) {
        console.error('Error deleting file:', err);
        toast.error('Erreur lors de la suppression du fichier');
      }
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Film className="h-5 w-5 text-red-500" />;
    if (fileType.startsWith('audio/')) return <Music className="h-5 w-5 text-purple-500" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar') || fileType.includes('7z')) 
      return <Archive className="h-5 w-5 text-amber-500" />;
    if (fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('txt')) 
      return <FileText className="h-5 w-5 text-green-500" />;
    return <FileIcon className="h-5 w-5 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Fichiers récents
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Fichiers récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            {error}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={loadHistory}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Fichiers récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Aucun fichier récent
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Fichiers récents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {history.map((item) => (
            <li key={item.id} className="border-b pb-2 last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <div className="p-2 rounded-md bg-muted/40 mt-1">
                    {getFileIcon(item.fileType)}
                  </div>
                  <div>
                    <div className="font-medium truncate max-w-[150px]">
                      {item.fileName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(item.uploadDate), { 
                        addSuffix: true,
                        locale: fr 
                      })}
                    </div>
                    {item.expiryDate && (
                      <div className="text-xs text-muted-foreground">
                        Expire: {format(new Date(item.expiryDate), 'dd/MM/yyyy')}
                      </div>
                    )}
                    {item.hasPassword && (
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Lock className="h-3 w-3 mr-1" />
                        Protégé
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Link to={`/files/${item.id}`} target="_blank">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={() => handleDeleteFile(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="text-center mt-3">
          <Link to="/history">
            <Button variant="outline" size="sm" className="w-full">
              Voir tout l'historique
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
