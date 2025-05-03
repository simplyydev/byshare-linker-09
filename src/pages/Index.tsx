
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ServerUploader } from '@/components/ServerUploader';
import { ArrowRight, Upload, Shield, Clock, Link as LinkIcon } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const handleStartUpload = () => {
    // Faire défiler vers la section d'upload ou naviguer vers la page d'upload
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/upload');
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">
            By'Share
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Partagez vos fichiers sur notre serveur, rapidement et simplement
          </p>
          
          <div className="mt-8">
            <Button 
              size="lg" 
              className="gap-2 text-lg btn-hover-effect"
              onClick={handleStartUpload}
            >
              <Upload className="h-5 w-5" />
              Commencer l'upload
              <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="glass rounded-2xl p-6 transform transition-all hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full glass-subtle flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Upload Serveur</h3>
              <p className="text-muted-foreground">
                Vos fichiers sont stockés sur notre serveur pour une meilleure fiabilité et accessibilité.
              </p>
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6 transform transition-all hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full glass-subtle flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Sécurisé</h3>
              <p className="text-muted-foreground">
                Protégez vos fichiers avec un mot de passe et une date d'expiration pour garder le contrôle.
              </p>
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6 transform transition-all hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full glass-subtle flex items-center justify-center mb-4">
                <LinkIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Facile à Partager</h3>
              <p className="text-muted-foreground">
                Obtenez un lien unique que vous pouvez partager avec n'importe qui, n'importe où.
              </p>
            </div>
          </div>
        </div>

        <div id="upload-section" className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Partager un fichier</h2>
          <ServerUploader />
        </div>

      </div>
    </Layout>
  );
};

export default Index;
