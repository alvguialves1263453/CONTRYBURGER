import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Lock } from "lucide-react";

interface GuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: GuardProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <div className="w-10 h-10 border-4 border-natural-red border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-400 font-mono text-xs">Carregando autenticação...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="bg-stone-900 rounded-3xl border border-natural-border p-8 text-center max-w-md mx-auto my-12 space-y-5 text-natural-cream shadow-2xl">
          <div className="mx-auto w-14 h-14 bg-red-500/10 border border-red-500/20 text-natural-red rounded-full flex items-center justify-center">
            <Lock size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg text-white font-bold">PORTÃO FECHADO</h3>
            <p className="text-stone-400 text-xs">Você precisa fazer login para acessar essa área do rancho.</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
