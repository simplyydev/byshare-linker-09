
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  Calendar, 
  Lock, 
  File as FileIcon, 
  Image, 
  FileText, 
  Film,
  Music,
  Archive,
  ExternalLink,
  Eye,
  EyeOff,
  Clock,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  getUserUploads, 
  deleteFile, 
  updateFileVisibility,
  updateFileExpiryDate,
  UserUploadHistory
} from '@/lib/fileService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShareOptions } from '@/components/ui/ShareOptions';

export function UserHistory() {
  const [history, setHistory] = useState<UserUploadHistory[]>([]);
  const [selectedFile, setSelectedFile] = useState<UserUploadHistory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      // Now we properly await the async function
      const uploads = await getUserUploads();
      setHistory(uploads.sort((a, b) => 
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      ));
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      // Now properly await the async function
      const success = await deleteFile(fileId);
      if (success) {
        toast.success('Fichier supprimé avec succès');
        loadHistory();
      } else {
        toast.error('Erreur lors de la suppression du fichier');
      }
    }
  };

  const handleUpdateVisibility = async (fileId: string, visibility: 'public' | 'private') => {
    // Now properly await the async function
    const success = await updateFileVisibility(fileId, visibility);
    if (success) {
      toast.success(`Visibilité mise à jour: ${visibility === 'public' ? 'Public' : 'Privé'}`);
      loadHistory();
    } else {
      toast.error('Erreur lors de la mise à jour de la visibilité');
    }
  };

  const handleUpdateOptions = async (options: { expiryDate: Date | null; password: string | null; visibility?: 'public' | 'private'; }) => {
    if (!selectedFile) return;
    
    // Update expiry date
    const expirySuccess = await updateFileExpiryDate(selectedFile.id, options.expiryDate);
    
    // Update visibility if changed
    let visibilitySuccess = true;
    if (options.visibility && options.visibility !== selectedFile.visibility) {
      visibilitySuccess = await updateFileVisibility(selectedFile.id, options.visibility);
    }
    
    if (expirySuccess && visibilitySuccess) {
      toast.success('Options du fichier mises à jour avec succès');
      loadHistory();
      setIsDialogOpen(false);
    } else {
      toast.error('Erreur lors de la mise à jour des options du fichier');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (fileType.startsWith('video/')) return <Film className="h-5 w-5" />;
    if (fileType.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar') || fileType.includes('7z')) 
      return <Archive className="h-5 w-5" />;
    if (fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('txt')) 
      return <FileText className="h-5 w-5" />;
    return <FileIcon className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin mx-auto mb-4">
          <FileIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Chargement de l'historique...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <FileIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium mb-2">Aucun fichier partagé</h2>
        <p className="text-muted-foreground mb-6">
          Vous n'avez pas encore partagé de fichiers via By'Share
        </p>
        <Link to="/upload">
          <Button>Partager un fichier</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 overflow-hidden">
        <h2 className="text-xl font-medium mb-4">Vos fichiers partagés</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Fichier</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Expire</th>
                <th className="pb-2">Visibilité</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="py-3">
                    <div className="flex items-center">
                      {getFileIcon(item.fileType)}
                      <span className="ml-2 font-medium truncate max-w-[200px]">
                        {item.fileName}
                      </span>
                      {item.hasPassword && (
                        <Lock className="h-3 w-3 ml-2 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="text-sm">
                      {format(new Date(item.uploadDate), 'dd MMM yyyy', { locale: fr })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(item.uploadDate), 'HH:mm', { locale: fr })}
                    </div>
                  </td>
                  <td className="py-3">
                    {item.expiryDate ? (
                      <div className="flex items-center text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(item.expiryDate), 'dd MMM yyyy', { locale: fr })}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Jamais</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center">
                      {item.visibility === 'public' ? (
                        <>
                          <Eye className="h-4 w-4 mr-1 text-green-500" />
                          <span className="text-sm">Public</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 mr-1 text-amber-500" />
                          <span className="text-sm">Privé</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <Link to={`/files/${item.id}`} target="_blank">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <Dialog 
                        open={isDialogOpen && selectedFile?.id === item.id} 
                        onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (!open) setSelectedFile(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedFile(item)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier les options du fichier</DialogTitle>
                          </DialogHeader>
                          
                          {selectedFile && (
                            <div className="py-4">
                              <div className="flex items-center mb-4">
                                {getFileIcon(selectedFile.fileType)}
                                <span className="ml-2 font-medium truncate">
                                  {selectedFile.fileName}
                                </span>
                              </div>
                              
                              <ShareOptions 
                                onOptionsChange={handleUpdateOptions}
                                initialOptions={{
                                  expiryDate: selectedFile.expiryDate ? new Date(selectedFile.expiryDate) : null,
                                  password: null, // We don't show password in UI for security
                                  visibility: selectedFile.visibility
                                }}
                              />
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => handleDeleteFile(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
