import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { authService, UserProfile } from "../services/authService";

export function useAuth() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state with current authenticated session
  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const uProfile = await authService.getProfile(session.user.id);
          setProfile(uProfile);
        } else if (mounted) {
          setProfile(null);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || "Falha ao recuperar sessão");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSession();

    // Listen to changes in Auth state (login, logout, token refresh...)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const uProfile = await authService.getProfile(session.user.id);
          setProfile(uProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await authService.signIn(email, pass);
      if (data?.user) {
        const uProfile = await authService.getProfile(data.user.id);
        setProfile(uProfile);
      }
      return data;
    } catch (err: any) {
      setError(err.message || "Email ou senha incorretos.");
      setLoading(false);
      throw err;
    }
  };

  const register = async (email: string, pass: string, fullName: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await authService.signUp(email, pass, fullName);
      return data;
    } catch (err: any) {
      setError(err.message || "Erro ao realizar cadastro.");
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    setLoading(true);
    try {
      await authService.signOut();
      setProfile(null);
    } catch (err: any) {
      setError(err.message || "Erro ao fazer logout.");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await authService.updateProfile(profile.id, updates);
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      return data;
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar perfil.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    isAdmin: profile?.role === "admin",
    isCliente: profile?.role === "cliente",
    isAuthenticated: !!profile,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    setError
  };
}
