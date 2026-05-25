import React, { useState } from "react";
import { Lock, Mail, User, Phone, CheckCircle, HelpCircle, ArrowLeft, ShieldAlert } from "lucide-react";

interface AuthViewProps {
  onLogin: (email: string, pass: string) => Promise<any>;
  onRegister: (email: string, pass: string, name: string) => Promise<any>;
  onBack: () => void;
}

export default function AuthView({ onLogin, onRegister, onBack }: AuthViewProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login");
  
  // Form State Values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (activeTab === "login") {
        await onLogin(email, password);
        setSuccessMessage("Autenticado com sucesso! Entrando...");
      } else if (activeTab === "register") {
        await onRegister(email, password, fullName);
        setSuccessMessage("Conta do rancho cadastrada! Você já pode fazer login ou verificar sua caixa deentrada.");
        setActiveTab("login");
      } else {
        // Mock success or show instructions
        setSuccessMessage("Instruções de redefinição de senha enviadas ao seu email.");
      }
    } catch (err: any) {
      setError(err.message || "Erro no processamento da solicitação.");
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
            {activeTab === "login" ? "Entrar no Salon" : activeTab === "register" ? "Criar Conta d'Oeste" : "Esqueceu a Chave?"}
          </h2>
          <p className="text-stone-400 text-[10px] font-mono uppercase tracking-widest leading-none">
            {activeTab === "login" ? "Sincronize seus pedidos com o rancho" : activeTab === "register" ? "Arrebente na primeira conta" : "Insira seu email cadastrado"}
          </p>
        </div>

        {/* Tab filters */}
        {activeTab !== "forgot" && (
          <div className="grid grid-cols-2 gap-2 bg-stone-850 p-1.5 rounded-2xl border border-stone-800">
            <button
              onClick={() => { setActiveTab("login"); setError(null); setSuccessMessage(null); }}
              className={`py-2 rounded-xl text-center text-xs font-bold transition-all ${activeTab === "login" ? "bg-cowboy-gold text-stone-900 font-extrabold" : "text-stone-400 hover:text-white"}`}
            >
              Fazer Login
            </button>
            <button
              onClick={() => { setActiveTab("register"); setError(null); setSuccessMessage(null); }}
              className={`py-2 rounded-xl text-center text-xs font-bold transition-all ${activeTab === "register" ? "bg-cowboy-gold text-stone-900 font-extrabold" : "text-stone-400 hover:text-white"}`}
            >
              Cadastrar Conta
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
          
          {activeTab === "register" && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-cowboy-beige/80 tracking-wider">Seu Nome Completo</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Hank Williams"
                  className="w-full bg-stone-800 border-2 border-wood-medium rounded-xl pl-10 pr-4 py-3 placeholder-stone-600 focus:outline-none focus:border-cowboy-gold text-white"
                />
                <User size={14} className="absolute left-3.5 top-3.5 text-stone-500" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-cowboy-beige/80 tracking-wider">Email Registrado</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@gmail.com"
                className="w-full bg-stone-800 border-2 border-wood-medium rounded-xl pl-10 pr-4 py-3 placeholder-stone-600 focus:outline-none focus:border-cowboy-gold text-white font-mono"
              />
              <Mail size={14} className="absolute left-3.5 top-3.5 text-stone-500" />
            </div>
          </div>

          {activeTab !== "forgot" && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-cowboy-beige/80 tracking-wider">Senha de Segurança</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="No mínimo 6 caracteres..."
                  className="w-full bg-stone-800 border-2 border-wood-medium rounded-xl pl-10 pr-4 py-3 placeholder-stone-600 focus:outline-none focus:border-cowboy-gold text-white"
                />
                <Lock size={14} className="absolute left-3.5 top-3.5 text-stone-500" />
              </div>
            </div>
          )}

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
            {loading ? "Processando no Cavalo..." : activeTab === "login" ? "ENTRAR NO SALON" : activeTab === "register" ? "CRIAR CONTA" : "ENVIAR EMAIL"}
          </button>
        </form>

        <div className="pt-2 flex justify-between items-center text-[10.5px] font-mono text-stone-500">
          {activeTab === "login" ? (
            <button
              onClick={() => { setActiveTab("forgot"); setError(null); setSuccessMessage(null); }}
              className="hover:text-cowboy-gold transition-colors"
            >
              Perdeu a senha? Redefinir 🔑
            </button>
          ) : (
            <button
              onClick={() => { setActiveTab("login"); setError(null); setSuccessMessage(null); }}
              className="hover:text-cowboy-gold transition-colors"
            >
              Já tenho conta! Fazer Login
            </button>
          )}
        </div>

        {activeTab === "login" && (
          <div className="border-t border-stone-800/60 pt-4 text-left space-y-2">
            <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider">Ginete Inicial dos Requisitos:</span>
            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-850 space-y-1">
              <p className="text-[10px] text-stone-400 font-mono"><strong>Email Admin:</strong> admin@contryfood.com</p>
              <p className="text-[10px] text-stone-400 font-mono"><strong>Senha:</strong> 1234</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
