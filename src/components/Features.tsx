
import { Eye, LockKeyhole, Clock, Users, Upload, Folder } from 'lucide-react';

export function Features() {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-12">Fonctionnalités</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Upload className="h-6 w-6 text-primary" />}
          title="Upload Sans Inscription"
          description="Partagez vos fichiers immédiatement sans avoir à créer un compte."
        />
        
        <FeatureCard 
          icon={<Folder className="h-6 w-6 text-primary" />}
          title="Upload de Dossiers"
          description="Importez des dossiers entiers pour partager facilement plusieurs fichiers."
        />
        
        <FeatureCard 
          icon={<LockKeyhole className="h-6 w-6 text-primary" />}
          title="Protection par Mot de Passe"
          description="Sécurisez vos fichiers avec un mot de passe pour plus de confidentialité."
        />
        
        <FeatureCard 
          icon={<Clock className="h-6 w-6 text-primary" />}
          title="Expiration Automatique"
          description="Définissez une date d'expiration pour que vos fichiers soient automatiquement supprimés."
        />
        
        <FeatureCard 
          icon={<Eye className="h-6 w-6 text-primary" />}
          title="Aperçu de Fichiers"
          description="Visualisez vos fichiers directement dans le navigateur, y compris PDF, vidéos, images et plus."
        />
        
        <FeatureCard 
          icon={<Users className="h-6 w-6 text-primary" />}
          title="Service Gratuit"
          description="Service entièrement gratuit limité à 5 uploads par jour par IP."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) {
  return (
    <div className="glass-subtle rounded-xl p-6 transition-all hover:glass hover:translate-y-[-5px]">
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
