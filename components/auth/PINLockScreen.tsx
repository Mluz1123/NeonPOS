'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { validatePin } from '@/app/actions/staff';
import { Lock, ArrowRight, Delete } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function PINLockScreen({ hasStaff }: { hasStaff?: boolean | null }) {
  const { currentStaff, login } = useAuthStore();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorShake, setErrorShake] = useState(false);

  // If already logged in, or no staff configured yet, do not show lock screen
  if (currentStaff || hasStaff === false) return null;

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) return;
    
    setLoading(true);
    const { data, error } = await validatePin(pin);
    
    if (error || !data) {
      toast.error(error || 'PIN Incorrecto');
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      setPin('');
    } else {
      toast.success(`Bienvenido, ${data.name}`);
      login(data);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background-dark/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className={cn(
        "bg-white rounded-[40px] p-10 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center gap-8 transition-transform",
        errorShake && "animate-[shake_0.5s_ease-in-out]" // Assuming shake is in tailwind config or will default softly
      )}>
        
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary">
          <Lock className="w-8 h-8" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-text-main">Terminal Bloqueado</h2>
          <p className="text-sm text-text-secondary font-medium">Ingresa tu PIN de operador</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i}
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-300",
                i < pin.length ? "bg-primary scale-110 shadow-[0_0_10px_rgba(158,255,0,0.5)]" : "bg-gray-200"
              )}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full mt-4">
          {[1,2,3,4,5,6,7,8,9].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              disabled={loading}
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xl font-black text-text-main active:scale-95 transition-all"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            disabled={loading || pin.length === 0}
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 active:scale-95 transition-all disabled:opacity-50"
          >
            <Delete className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            disabled={loading}
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xl font-black text-text-main active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || pin.length !== 4}
            className="p-4 neon-button rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100 active:scale-95 transition-all"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
