
import { useState, useEffect } from 'react';

interface SecurityOptionsProps {
  initialPassword?: string;
  initialExpiryDays?: number;
  onChange: (options: { password: string | null; expiryDays: number }) => void;
}

export function SecurityOptions({ 
  initialPassword = '', 
  initialExpiryDays = 7,
  onChange 
}: SecurityOptionsProps) {
  const [password, setPassword] = useState(initialPassword);
  const [expiryDays, setExpiryDays] = useState(initialExpiryDays);

  useEffect(() => {
    onChange({
      password: password.length > 0 ? password : null,
      expiryDays
    });
  }, [password, expiryDays, onChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Protection par mot de passe (optionnel)</label>
        <input
          type="password"
          placeholder="Laisser vide pour aucun mot de passe"
          className="w-full p-2 rounded-md border border-input bg-transparent"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-1">Expiration du fichier</label>
        <select
          className="w-full p-2 rounded-md border border-input bg-transparent"
          value={expiryDays}
          onChange={(e) => setExpiryDays(Number(e.target.value))}
        >
          <option value={1}>1 jour</option>
          <option value={7}>7 jours</option>
          <option value={30}>30 jours</option>
          <option value={90}>90 jours</option>
        </select>
      </div>
    </div>
  );
}
