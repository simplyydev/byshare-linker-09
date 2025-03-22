
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getAllFiles, 
  getTotalStorageUsage, 
  deleteFile, 
  loadSettings, 
  saveSettings,
  verifyAdminCredentials
} from '@/lib/fileService';
import { toast } from 'sonner';
import { 
  FileText, 
  HardDrive, 
  Settings, 
  AlertTriangle, 
  Trash2, 
  Download, 
  Search, 
  Calendar,
  Flag,
  X,
  Lock,
  LogIn
} from 'lucide-react';
import { ADMIN_CREDENTIALS } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [files, setFiles] = useState<Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    expiryDate: string | null;
    createdAt: string;
    reportCount: number;
    reportReasons: string[];
    uploadedBy: string;
  }>>([]);
  
  const [totalSize, setTotalSize] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState({
    maxSizeMB: 100,
    acceptedFileTypes: ['image/*', 'application/pdf']
  });
  const [newFileType, setNewFileType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({
    username: '',
    password: ''
  });
  
  const navigate = useNavigate();

  const loadData = () => {
    setIsLoading(true);
    const allFiles = getAllFiles();
    setFiles(allFiles);
    setTotalSize(getTotalStorageUsage());
    setSettings(loadSettings());
    setIsLoading(false);
  };

  // Check if user is already authenticated
  useEffect(() => {
    const adminAuth = localStorage.getItem('byshare_admin_auth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const handleDeleteFile = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      const success = deleteFile(id);
      if (success) {
        toast.success('Fichier supprimé avec succès');
        loadData();
      } else {
        toast.error('Erreur lors de la suppression du fichier');
      }
    }
  };

  const handleSaveSettings = () => {
    saveSettings(settings);
    toast.success('Paramètres enregistrés avec succès');
  };

  const handleAddFileType = () => {
    if (!newFileType.trim()) {
      toast.error('Veuillez saisir un type de fichier valide');
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      acceptedFileTypes: [...prev.acceptedFileTypes, newFileType.trim()]
    }));
    
    setNewFileType('');
  };

  const handleRemoveFileType = (type: string) => {
    setSettings(prev => ({
      ...prev,
      acceptedFileTypes: prev.acceptedFileTypes.filter(t => t !== type)
    }));
  };

  const handleLogin = () => {
    if (verifyAdminCredentials(loginCredentials.username, loginCredentials.password)) {
      setIsAuthenticated(true);
      localStorage.setItem('byshare_admin_auth', 'true');
      toast.success('Connexion réussie');
      loadData();
    } else {
      toast.error('Identifiants incorrects');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('byshare_admin_auth');
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const reportedFiles = files.filter(file => file.reportCount > 0);

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container max-w-md mx-auto py-12">
          <div className="glass rounded-2xl p-8">
            <div className="flex items-center justify-center mb-6">
              <Lock className="h-6 w-6 text-primary mr-2" />
              <h1 className="text-2xl font-bold">Accès administrateur</h1>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input 
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={loginCredentials.username}
                  onChange={(e) => setLoginCredentials(prev => ({
                    ...prev,
                    username: e.target.value
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input 
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginCredentials.password}
                  onChange={(e) => setLoginCredentials(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                />
              </div>
              
              <Button 
                className="w-full btn-hover-effect" 
                onClick={handleLogin}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Se connecter
              </Button>
              
              <p className="text-sm text-muted-foreground text-center mt-4">
                Identifiants par défaut: admin / byshare2024
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Panneau d'administration</h1>
          <Button variant="outline" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
        
        <Tabs defaultValue="files" className="space-y-6">
          <TabsList className="glass-subtle mb-4">
            <TabsTrigger value="files" className="data-[state=active]:bg-primary/10">
              <FileText className="h-4 w-4 mr-2" />
              Fichiers
            </TabsTrigger>
            <TabsTrigger value="reported" className="data-[state=active]:bg-primary/10">
              <Flag className="h-4 w-4 mr-2" />
              Signalements
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary/10">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="files" className="space-y-6">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">Liste des fichiers</h2>
                <div className="flex items-center">
                  <HardDrive className="h-5 w-5 text-primary mr-2" />
                  <span>Espace utilisé: {formatSize(totalSize)}</span>
                </div>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher un fichier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-subtle"
                />
              </div>
              
              {isLoading ? (
                <div className="text-center py-10">
                  <p>Chargement...</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-10">
                  <p>Aucun fichier trouvé</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-4">Nom</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Taille</th>
                        <th className="text-left py-3 px-4">IP</th>
                        <th className="text-left py-3 px-4">Date de création</th>
                        <th className="text-left py-3 px-4">Expiration</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file) => (
                        <tr key={file.id} className="border-b border-border/20 hover:bg-primary/5">
                          <td className="py-3 px-4 truncate max-w-[200px]">{file.name}</td>
                          <td className="py-3 px-4">{file.type}</td>
                          <td className="py-3 px-4">{formatSize(file.size)}</td>
                          <td className="py-3 px-4">{file.uploadedBy}</td>
                          <td className="py-3 px-4">{formatDate(file.createdAt)}</td>
                          <td className="py-3 px-4">
                            {file.expiryDate ? formatDate(file.expiryDate) : 'Pas d\'expiration'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <a 
                                href={`/files/${file.id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="text-destructive hover:text-destructive/80"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="reported" className="space-y-6">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                <h2 className="text-xl font-medium">Fichiers signalés</h2>
              </div>
              
              {isLoading ? (
                <div className="text-center py-10">
                  <p>Chargement...</p>
                </div>
              ) : reportedFiles.length === 0 ? (
                <div className="text-center py-10">
                  <p>Aucun fichier signalé</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reportedFiles.map(file => (
                    <div key={file.id} className="glass-subtle rounded-lg p-4">
                      <div className="flex justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{file.name}</h3>
                          <p className="text-sm text-muted-foreground">{formatSize(file.size)} • {file.type}</p>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-destructive/10 text-destructive px-2 py-1 rounded-full text-xs font-medium">
                            {file.reportCount} signalement{file.reportCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-1">Raisons des signalements:</h4>
                        <ul className="space-y-1 pl-5 text-sm list-disc">
                          {file.reportReasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Créé le {formatDate(file.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <a 
                            href={`/files/${file.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 text-sm"
                          >
                            Voir le fichier
                          </a>
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="text-destructive hover:text-destructive/80 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-medium mb-6">Paramètres</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="maxFileSize" className="mb-2 block">
                    Taille maximale des fichiers (MB)
                  </Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.maxSizeMB}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      maxSizeMB: parseInt(e.target.value)
                    }))}
                    min="1"
                    className="max-w-xs glass-subtle"
                  />
                </div>
                
                <div>
                  <Label className="mb-2 block">Types de fichiers acceptés</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {settings.acceptedFileTypes.map(type => (
                      <div key={type} className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1">
                        <span className="text-sm">{type}</span>
                        <button
                          onClick={() => handleRemoveFileType(type)}
                          className="ml-2 text-primary hover:text-primary/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 max-w-md">
                    <Input
                      value={newFileType}
                      onChange={(e) => setNewFileType(e.target.value)}
                      placeholder="Ex: image/*, .pdf, audio/*"
                      className="glass-subtle"
                    />
                    <Button onClick={handleAddFileType}>Ajouter</Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vous pouvez ajouter des types MIME (ex: image/*) ou des extensions (ex: .pdf)
                  </p>
                </div>
                
                <Button onClick={handleSaveSettings} className="btn-hover-effect">
                  Enregistrer les paramètres
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
