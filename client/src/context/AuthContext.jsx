import { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "../lib/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const getDisplayName = (userData = {}) => {
  const raw =
    userData.fullname ||
    userData.name ||
    userData.username ||
    userData.email ||
    "User";

  return String(raw).trim() || "User";
};

const normalizeUser = (userData = {}) => {
  const name = getDisplayName(userData);
  return {
    ...userData,
    name,
    fullname: userData.fullname || name,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("im_user") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("im_user", JSON.stringify(user));
    else localStorage.removeItem("im_user");
  }, [user]);

  useEffect(() => {
    const bootstrap = async () => {
      const token = tokenStore.get();
      if (!token) return;

      try {
        const currentUser = await api.currentUser();
        setUser(currentUser || null);
      } catch {
        tokenStore.clear();
        setUser(null);
      }
    };

    bootstrap();
  }, []);

  const handleAuth = (res) => {
    const payload = res?.user ?? res ?? {};
    const userData = payload.user ?? payload;
    const normalizedUser = normalizeUser(userData);

    if (res?.token) tokenStore.set(res.token);
    setUser(
      normalizedUser || {
        name: res?.name,
        email: res?.email,
        fullname: res?.fullname || res?.name,
      },
    );
  };

  const login = async (form) => handleAuth(await api.login(form));
  const googleLogin = async (credential) =>
    handleAuth(await api.googleLogin(credential));
  const register = async (form) => handleAuth(await api.register(form));

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, googleLogin, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
