import { createContext, useContext, useEffect, useMemo, useState } from "react";

const UserContext = createContext(null);

const DEFAULT_SETTINGS = {
  theme: "light",      // "light" | "dark"
  language: "English", // English | Kannada | Hindi (you can add more)
};

const LS_USER = "ic_user";
const LS_SETTINGS = "ic_settings";

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(LS_USER);
    return raw ? JSON.parse(raw) : null;
  });

  const [settings, setSettings] = useState(() => {
    const raw = localStorage.getItem(LS_SETTINGS);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  });

  // Persist user
  useEffect(() => {
    if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
    else localStorage.removeItem(LS_USER);
  }, [user]);

  // Persist settings + apply theme to body
  useEffect(() => {
    localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
    document.body.setAttribute("data-theme", settings.theme);
  }, [settings]);

  const login = ({ name, phone, email }) => {
    setUser({
      name: name?.trim() || "Guest",
      phone: phone?.trim() || "",
      email: email?.trim() || "",
      role: "Customer Account",
      createdAt: new Date().toISOString(),
    });
  };

  const logout = () => setUser(null);

  const updateUser = (patch) => setUser((prev) => ({ ...(prev || {}), ...patch }));

  const updateSettings = (patch) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  // “Forget settings” = reset settings to default
  const resetSettings = () => setSettings(DEFAULT_SETTINGS);

  const value = useMemo(
    () => ({
      user,
      settings,
      login,
      logout,
      updateUser,
      updateSettings,
      resetSettings,
    }),
    [user, settings]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
