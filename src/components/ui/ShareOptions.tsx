import { useState, useEffect } from 'react';
import { Calendar, Lock, Clock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

interface ShareOptionsProps {
  onOptionsChange: (options: ShareOptions) => void;
  className?: string;
  initialOptions?: ShareOptions;
}

export interface ShareOptions {
  expiryDate: Date | null;
  password: string | null;
  visibility?: 'public' | 'private';
}

export function ShareOptions({ onOptionsChange, className, initialOptions }: ShareOptionsProps) {
  const [expiryDate, setExpiryDate] = useState<Date | null>(initialOptions?.expiryDate || null);
  const [hasPassword, setHasPassword] = useState(!!initialOptions?.password);
  const [password, setPassword] = useState(initialOptions?.password || '');
  const [expiryType, setExpiryType] = useState<'none' | 'one_day' | 'one_week' | 'one_month' | 'custom'>(
    initialOptions?.expiryDate ? 'custom' : 'one_week'
  );
  const [visibility, setVisibility] = useState<'public' | 'private'>(
    initialOptions?.visibility || 'public'
  );

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  useEffect(() => {
    if (initialOptions?.expiryDate) {
      setExpiryType('custom');
      setExpiryDate(new Date(initialOptions.expiryDate));
    }
  }, [initialOptions]);

  const handleExpiryDateChange = (date: Date | null) => {
    if (date && date > maxDate) {
      date = maxDate;
    }
    
    setExpiryDate(date);
    onOptionsChange({
      expiryDate: date,
      password: hasPassword ? password : null,
      visibility
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    onOptionsChange({
      expiryDate,
      password: hasPassword ? e.target.value : null,
      visibility
    });
  };

  const togglePassword = () => {
    const newHasPassword = !hasPassword;
    setHasPassword(newHasPassword);
    onOptionsChange({
      expiryDate,
      password: newHasPassword ? password : null,
      visibility
    });
  };

  const handleVisibilityChange = (newVisibility: 'public' | 'private') => {
    setVisibility(newVisibility);
    onOptionsChange({
      expiryDate,
      password: hasPassword ? password : null,
      visibility: newVisibility
    });
  };

  const handleExpiryTypeChange = (value: string) => {
    const type = value as 'none' | 'one_day' | 'one_week' | 'one_month' | 'custom';
    setExpiryType(type);
    
    let newExpiryDate: Date | null = null;
    const today = new Date();
    
    switch(type) {
      case 'one_day':
        newExpiryDate = addDays(today, 1);
        break;
      case 'one_week':
        newExpiryDate = addWeeks(today, 1);
        break;
      case 'one_month':
        newExpiryDate = addMonths(today, 1);
        break;
      case 'custom':
        newExpiryDate = expiryDate || today;
        break;
      case 'none':
      default:
        newExpiryDate = null;
    }
    
    if (newExpiryDate && newExpiryDate > maxDate) {
      newExpiryDate = maxDate;
    }
    
    setExpiryDate(newExpiryDate);
    onOptionsChange({
      expiryDate: newExpiryDate,
      password: hasPassword ? password : null,
      visibility
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
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
              <SelectItem value="one_day">1 jour</SelectItem>
              <SelectItem value="one_week">1 semaine</SelectItem>
              <SelectItem value="one_month">1 mois</SelectItem>
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
                    disabled={(date) => date < new Date() || date > maxDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum 1 an à partir d'aujourd'hui
              </p>
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

      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          {visibility === 'public' ? (
            <Eye className="mr-2 h-5 w-5 text-primary" />
          ) : (
            <EyeOff className="mr-2 h-5 w-5 text-primary" />
          )}
          Visibilité
        </h3>
        
        <div className="flex space-x-2">
          <Button
            variant={visibility === 'public' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleVisibilityChange('public')}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Public
          </Button>
          <Button
            variant={visibility === 'private' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleVisibilityChange('private')}
            className="flex-1"
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Privé
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {visibility === 'public' 
            ? "Visible pour tout le monde avec le lien"
            : "Visible uniquement pour vous"}
        </p>
      </div>
    </div>
  );
}
