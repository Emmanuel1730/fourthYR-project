import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "theme";
const themes = {
  light: "light",
  dark: "dark",
};

const getInitialTheme = () => {
  if (typeof window === "undefined") return themes.light;

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  // Default to light unless the user explicitly saved "dark"
  return storedTheme === themes.dark ? themes.dark : themes.light;
};

const useThemeMode = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === themes.dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === themes.dark ? themes.light : themes.dark));
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === themes.dark,
  };
};

export default useThemeMode;
