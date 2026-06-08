export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  role: "admin" | "cliente";
  createdAt?: string;
}

const USERS_KEY = "country_food_users";
const SESSION_KEY = "country_food_current_user";

function getAllUsers(): UserProfile[] {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) {
    const initialUsers: UserProfile[] = [
      {
        id: "admin-id",
        email: "admin@countryfood.com",
        fullName: "Chef Master",
        phone: "+5511999999999",
        address: "Rancho Country, 100",
        role: "admin",
        createdAt: new Date().toISOString()
      },
      {
        id: "client-id",
        email: "cliente@rancho.com",
        fullName: "Gauchito Valente",
        phone: "+5511988888888",
        address: "Avenida Larga, 450",
        role: "cliente",
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

export const authService = {
  /**
   * Enroll a new user in the local system.
   */
  async signUp(email: string, pass: string, fullName: string) {
    const users = getAllUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      throw new Error("Este e-mail já está cadastrado.");
    }
    const newUser: UserProfile = {
      id: "usr-" + Date.now() + Math.floor(Math.random() * 1000),
      email: email.toLowerCase().trim(),
      fullName,
      phone: "",
      address: "",
      role: email.toLowerCase().trim() === "admin@countryfood.com" ? "admin" : "cliente",
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(`pwd_${newUser.id}`, pass);
    return { user: { id: newUser.id } };
  },

  /**
   * Sign into existing account with email and password
   */
  async signIn(email: string, pass: string) {
    const users = getAllUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!found) {
      throw new Error("Usuário não encontrado.");
    }
    const savedPassword = localStorage.getItem(`pwd_${found.id}`) || "1234";
    if (pass !== savedPassword) {
      throw new Error("Palavra-passe incorreta.");
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(found));
    return { user: { id: found.id, email: found.email } };
  },

  /**
   * Remove current session
   */
  async signOut() {
    localStorage.removeItem(SESSION_KEY);
  },

  /**
   * Retrieve currently signed in session details
   */
  async getCurrentSession() {
    const current = localStorage.getItem(SESSION_KEY);
    return current ? JSON.parse(current) : null;
  },

  /**
   * Fetch current user profile details
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const users = getAllUsers();
    return users.find(u => u.id === userId) || null;
  },

  /**
   * Update profile fields (Full Name, Address, Phone)
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const users = getAllUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      const cur = localStorage.getItem(SESSION_KEY);
      if (cur) {
        const curUser = JSON.parse(cur);
        if (curUser.id === userId) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(users[idx]));
        }
      }
      return users[idx];
    }
    throw new Error("Perfil não encontrado.");
  },

  /**
   * Trigger password recovery flow
   */
  async resetPassword(email: string) {
    // Simulated OK
  },

  /**
   * Update password for the currently active/authenticated user session
   */
  async updatePassword(password: string) {
    const current = localStorage.getItem(SESSION_KEY);
    if (current) {
      const parsed = JSON.parse(current);
      localStorage.setItem(`pwd_${parsed.id}`, password);
    }
  }
};
