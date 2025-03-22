
import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ReportModalProps {
  fileId: string;
  isOpen: boolean;
  onClose: () => void;
  onReport: (fileId: string, reason: string) => Promise<void>;
}

export function ReportModal({ fileId, isOpen, onClose, onReport }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Veuillez fournir une raison pour le signalement");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReport(fileId, reason);
      toast.success("Fichier signalé avec succès");
      onClose();
    } catch (error) {
      toast.error("Erreur lors du signalement. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="glass-strong max-w-md w-full rounded-2xl p-6 shadow-lg animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
            <h3 className="text-lg font-medium">Signaler un contenu</h3>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="report-reason" 
              className="block text-sm font-medium mb-1 text-muted-foreground"
            >
              Raison du signalement
            </label>
            <Textarea
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Veuillez expliquer pourquoi vous signalez ce contenu..."
              className="glass-subtle min-h-[120px]"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="glass-subtle"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Signaler'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
