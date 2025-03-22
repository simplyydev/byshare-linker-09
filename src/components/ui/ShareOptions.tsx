
import { useState } from 'react';
import { Calendar, Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ShareOptionsProps {
  onOptionsChange: (options: ShareOptions) => void;
  className?: string;
}

export interface ShareOptions {
  expiryDate: Date | null;
  password: string | null;
}

export function ShareOptions({ onOptionsChange, className }: ShareOptionsProps) {
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [expiryType, setExpiryType] = useState<'none' | 'custom'>('none');

  const handleExpiryDateChange = (date: Date | null) => {
    setExpiryDate(date);
    onOptionsChange({
      expiryDate: date,
      password: hasPassword ? password : null
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    onOptionsChange({
      expiryDate,
      password: hasPassword ? e.target.value : null
    });
  };

  const togglePassword = () => {
    const newHasPassword = !hasPassword;
    setHasPassword(newHasPassword);
    onOptionsChange({
      expiryDate,
      password: newHasPassword ? password : null
    });
  };

  const handleExpiryTypeChange = (value: string) => {
    const type = value as 'none' | 'custom';
    setExpiryType(type);
    
    if (type === 'none') {
      handleExpiryDateChange(null);
    }
  };

  return (
    <div className={cn("glass rounded-2xl p-6 animate-scale-in space-y-6", className)}>
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-primary" />
          Options d'expiration
        </h3>
        
        <div className="space-y-3">
          <Select value={expiryType} onValueChange={handleExpiryTypeChange}>
            <SelectTrigger className="w-full glass-subtle">
              <SelectValue placeholder="Choisir une option d'expiration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Pas d'expiration</SelectItem>
              <SelectItem value="custom">Date personnalisée</SelectItem>
            </SelectContent>
          </Select>
          
          {expiryType === 'custom' && (
            <div className="mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left glass-subtle",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, 'PPP') : <span>Choisir une date d'expiration</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={expiryDate as Date}
                    onSelect={handleExpiryDateChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Lock className="mr-2 h-5 w-5 text-primary" />
          Protection par mot de passe
        </h3>
        
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="checkbox"
            id="hasPassword"
            checked={hasPassword}
            onChange={togglePassword}
            className="rounded text-primary focus:ring-primary"
          />
          <Label htmlFor="hasPassword">Protéger avec un mot de passe</Label>
        </div>
        
        {hasPassword && (
          <div className="space-y-2 animate-slide-down">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              type="password"
              id="password"
              placeholder="Entrez un mot de passe"
              value={password}
              onChange={handlePasswordChange}
              className="glass-subtle"
            />
          </div>
        )}
      </div>
    </div>
  );
}
