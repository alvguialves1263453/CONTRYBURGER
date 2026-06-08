import React, { useState } from "react";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";

interface AuthViewProps {
  onLogin: (email: string, pass: string) => Promise<any>;
  onRegister?: (email: string, pass: string, name: string) => Promise<any>;
  onBack: () => void;
}

export default function AuthView({ onLogin, onBack }: AuthViewProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Automatically login using the admin email and entered password
      await onLogin("admin@countryfood.com", password);
      setSuccessMessage("Autenticado com sucesso! Carregando painel...");
    } catch (err: any) {
      if (password !== "1234") {
        setError("Palavra-passe incorreta. Dica do Rancho: Use '1234'.");
      } else {
        setError(err.message || "Erro ao conectar com o rancho.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-wood-dark px-4 py-12 relative animate-fadeIn">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      
      <div className="relative w-full max-w-md bg-stone-900 rounded-3xl border-4 border-wood-medium p-8 shadow-2xl space-y-6 text-cowboy-cream">
        
        {/* Back navigation */}
        <button
          onClick={onBack}
          className="absolute top-5 left-5 text-stone-400 hover:text-white flex items-center space-x-1.5 text-xs font-mono uppercase"
        >
          <ArrowLeft size={14} />
          <span>Voltar ao Cardápio</span>
        </button>

        <div className="text-center space-y-2 pt-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-cowboy-gold/10 border-2 border-cowboy-gold flex items-center justify-center text-cowboy-gold">
            <Lock size={22} className="sheriff-badge-glow" />
          </div>
          <h2 className="font-display text-2xl text-cowboy-gold font-bold uppercase tracking-wide">
            Acesso ao Saloon
          </h2>
          <p className="text-stone-400 text-[10px] font-mono uppercase tracking-widest leading-none">
            Digite a palavra-passe de acesso rápido
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
          
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-cowboy-beige/80 tracking-wider">Palavra-Passe d'Oeste</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a palavra-passe..."
                className="w-full bg-stone-800 border-2 border-wood-medium rounded-xl pl-10 pr-4 py-3 placeholder-stone-600 focus:outline-none focus:border-cowboy-gold text-white font-mono"
              />
              <Lock size={14} className="absolute left-3.5 top-3.5 text-stone-500" />
            </div>
          </div>

          {error && (
            <p className="text-xs text-center text-red-400 font-mono font-bold animate-pulse">
              ⚠ {error}
            </p>
          )}

          {successMessage && (
            <div className="bg-green-500/5 border border-green-500/20 text-green-400 text-xs p-3 rounded-xl flex items-center space-x-2">
              <CheckCircle size={16} className="shrink-0" />
              <p>{successMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cowboy-gold hover:bg-cowboy-gold/95 text-stone-900 font-bold rounded-xl transition-all border-b-4 border-amber-700 active:translate-y-0.5"
          >
            {loading ? "Abrindo as Portas..." : "ENTRAR NO SALON"}
          </button>
        </form>

        <div className="border-t border-stone-800/60 pt-4 text-center">
          <p className="text-[10px] text-stone-500 font-mono">
            <strong>Palavra-passe configurada:</strong> 1234
          </p>
        </div>

      </div>
    </div>
  );
}
