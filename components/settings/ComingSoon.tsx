'use client';

import { Construction, Timer, Rocket, Hammer } from 'lucide-react';

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-[40px] border border-gray-100 shadow-sm p-12 text-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
        <Construction className="w-12 h-12 text-primary relative z-10" />
      </div>

      <h2 className="text-3xl font-black text-text-main mb-4 uppercase tracking-tight">
        {title} <span className="text-primary italic">En Desarrollo</span>
      </h2>
      
      <p className="text-text-secondary font-medium max-w-md mx-auto leading-relaxed mb-10">
        Estamos trabajando arduamente para brindarte la mejor experiencia en personalización. Esta sección estará disponible muy pronto con herramientas avanzadas para tu negocio.
      </p>

      <div className="flex gap-4">
        <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 rounded-2xl border border-gray-100">
           <Timer className="w-4 h-4 text-gray-400" />
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Próximamente 2026</span>
        </div>
        <div className="flex items-center gap-2 px-5 py-2.5 bg-background-dark rounded-2xl">
           <Rocket className="w-4 h-4 text-primary" />
           <span className="text-[10px] font-black uppercase tracking-widest text-white">Prioridad Alta</span>
        </div>
      </div>

      <div className="mt-12 flex -space-x-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden grayscale opacity-50">
             <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
          </div>
        ))}
        <div className="w-10 h-10 rounded-full border-2 border-white bg-text-main flex items-center justify-center text-[10px] font-black text-white">
          +8
        </div>
      </div>
      <p className="text-[10px] font-black text-gray-400 mt-3 uppercase tracking-widest">Involucrados en esta sección</p>
    </div>
  );
}
