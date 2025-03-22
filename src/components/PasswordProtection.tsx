
import { useState } from 'react';
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PasswordProtectionProps {
  onPasswordSubmit: (password: string) => Promise<boolean>;
}

export function PasswordProtection({ onPasswordSubmit }: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Veuillez entrer un mot de passe');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isCorrect = await onPasswordSubmit(password);
      if (!isCorrect) {
        setError('Mot de passe incorrect');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="glass rounded-2xl p-8 animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 glass-subtle rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Fichier protégé</h2>
          <p className="text-muted-foreground">
            Ce fichier est protégé par un mot de passe. Veuillez entrer le mot de passe pour accéder au contenu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Entrer le mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-subtle pr-10"
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full btn-hover-effect" 
            disabled={isLoading}
          >
            {isLoading ? 'Vérification...' : 'Accéder au fichier'}
          </Button>
        </form>
      </div>
    </div>
  );
}
