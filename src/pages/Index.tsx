
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Features } from '@/components/Features';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sun, Moon, FileUp, Shield, Clock, Link as LinkIcon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

const Index = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">
            By'Share
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Partagez vos fichiers simplement, gratuitement, sans inscription
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button asChild size="lg" className="gap-2 text-lg btn-hover-effect">
              <Link to="/upload">
                <FileUp className="h-5 w-5" />
                Partager un fichier
                <ArrowRight className="h-5 w-5 ml-1" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="gap-2 text-lg"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="glass rounded-2xl p-6 transform transition-all hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full glass-subtle flex items-center justify-center mb-4">
                <FileUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Simple et Rapide</h3>
              <p className="text-muted-foreground">
                Partagez vos fichiers en quelques secondes, sans inscription ni configuration compliquée.
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

        <Features />

        <div className="glass rounded-2xl p-8 text-center mt-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Propulsé par By-Hoster</h2>
          <p className="text-lg text-muted-foreground mb-6">
            By'Share est un service gratuit propulsé par By-Hoster, avec une limite de 5 uploads par jour par IP.
          </p>
          <Button asChild size="lg" className="mx-auto btn-hover-effect">
            <Link to="/upload">
              Commencer à partager
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
