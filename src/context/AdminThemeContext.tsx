"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface AdminThemeContextType {
  theme: Theme;
  isLight: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("rimal_admin_theme") as Theme | null;
        if (savedTheme === "light" || savedTheme === "dark") {
          return savedTheme;
        }
      } catch {}
    }
    return "dark";
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("rimal_admin_theme") as Theme | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
        if (savedTheme === "light") {
          document.documentElement.classList.add("admin-light");
          document.documentElement.setAttribute("data-theme", "light");
        } else {
          document.documentElement.classList.remove("admin-light");
          document.documentElement.setAttribute("data-theme", "dark");
        }
      }
    } catch (e) {
      console.error("Failed to read theme from localStorage", e);
    }
    setIsMounted(true);

    // Enable smooth transitions only after initial load is complete
    const timer = setTimeout(() => {
      document.documentElement.classList.add("admin-loaded");
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("rimal_admin_theme", newTheme);
      if (typeof document !== "undefined") {
        if (newTheme === "light") {
          document.documentElement.classList.add("admin-light");
          document.documentElement.setAttribute("data-theme", "light");
        } else {
          document.documentElement.classList.remove("admin-light");
          document.documentElement.setAttribute("data-theme", "dark");
        }
      }
    } catch (e) {
      console.error("Failed to save theme to localStorage", e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <AdminThemeContext.Provider
      value={{
        theme,
        isLight: theme === "light",
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return context;
}
