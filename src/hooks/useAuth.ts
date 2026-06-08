import { useState, useEffect } from "react";
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
        const currentProfile = await authService.getCurrentSession();
        if (currentProfile && mounted) {
          setProfile(currentProfile);
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

    // Sync session state periodically so any secondary logins/logouts reflect instantly
    const interval = setInterval(async () => {
      const current = await authService.getCurrentSession();
      if (mounted) {
        setProfile(current);
      }
    }, 1500);

    return () => {
      mounted = false;
      clearInterval(interval);
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
      setError(err.message || "Email ou palavra-passe incorretos.");
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
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
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
