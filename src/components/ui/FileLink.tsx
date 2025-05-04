
import { useRef, useState } from 'react';
import { Link, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileLinkProps {
  fileUrl: string;
  className?: string;
}

export function FileLink({ fileUrl, className }: FileLinkProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Assurez-vous que l'URL est absolue pour fonctionner dans tous les navigateurs
  const absoluteUrl = fileUrl.startsWith('http') 
    ? fileUrl 
    : `${window.location.origin}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
  
  const handleCopy = () => {
    if (inputRef.current) {
      navigator.clipboard.writeText(absoluteUrl)
        .then(() => {
          setCopied(true);
          toast.success("Lien copié dans le presse-papier");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Erreur lors de la copie :', err);
          toast.error("Impossible de copier le lien");
        });
    }
  };
  
  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };
  
  return (
    <div className={cn("glass rounded-2xl p-6 animate-scale-in", className)}>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center mb-2">
          <Link className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-medium">Lien de partage</h3>
        </div>
        
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={absoluteUrl}
            readOnly
            onClick={handleInputClick}
            className="w-full glass-subtle text-sm p-4 pr-12 rounded-lg border-none outline-none focus:ring-2 focus:ring-primary/20"
          />
          
          <Button
            size="icon"
            onClick={handleCopy}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-primary/10 hover:bg-primary/20 text-primary rounded-md"
            aria-label="Copy link"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground text-center mt-1">
          Partagez ce lien avec vos amis ou collègues pour leur donner accès au fichier
        </p>
      </div>
    </div>
  );
}
