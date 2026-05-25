import React from "react";
import { useAuth } from "../hooks/useAuth";
import { ShieldAlert } from "lucide-react";

interface GuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminGuard({ children, fallback }: GuardProps) {
  const { profile, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-natural-red border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-400 font-mono text-xs">Avaliando credenciais administrativas...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      fallback || (
        <div className="bg-stone-950 min-h-[70vh] flex items-center justify-center px-4">
          <div className="bg-stone-900 rounded-3xl border border-red-550/40 p-8 text-center max-w-md w-full space-y-6 text-natural-cream shadow-2xl">
            <div className="mx-auto w-16 h-16 bg-red-650/15 border-2 border-natural-red text-natural-red rounded-full flex items-center justify-center animate-pulse">
              <ShieldAlert size={30} />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display text-xl text-white font-extrabold tracking-tight uppercase">Acesso Não Autorizado</h2>
              <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                Este portão leva exclusivamente ao gabinete ultra secreto dos administradores. Seu usuário atual (<strong>{profile?.email || "Visitante"}</strong>) não possui o crachá de Xerife.
              </p>
            </div>
            
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/";
              }}
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-655 to-natural-red text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
            >
              Voltar ao Cardápio do Rancho
            </a>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
