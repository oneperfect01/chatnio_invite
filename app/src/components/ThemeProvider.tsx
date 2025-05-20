import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

import { Button } from "./ui/button";
import { getMemory, setMemory } from "@/utils/memory.ts";
import { themeEvent } from "@/events/theme.ts";

const defaultTheme: Theme = "system";

export type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  toggleTheme?: () => void;
};

export function activeTheme(theme: Theme) {
  const root = window.document.documentElement;

  root.classList.remove("light", "dark");

  if (theme === "system") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  root.classList.add(`${theme}`);

  themeEvent.emit(theme);
}

export function getTheme() {
  return (getMemory("theme") as Theme) || defaultTheme;
}

const initialState: ThemeProviderState = {
  theme: defaultTheme,
  toggleTheme: () => {
    const currentTheme = getMemory("theme");
    let newTheme: Theme;
    const root = window.document.documentElement;


    root.classList.remove("dark", "light","system");

    // dark -> light -> system -> dark
    if (currentTheme === "dark") {
      newTheme = "light";
      root.classList.add(`${newTheme}`);

    } else if (currentTheme === "light") {
      newTheme = "system";

    } else {
      newTheme = "dark";
      root.classList.add(`${newTheme}`);

    }


    activeTheme(newTheme);
    setMemory("theme", newTheme);

  },
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  const { theme } = useTheme();


  useEffect(() => {

    const savedTheme = getTheme();
    
    activeTheme(savedTheme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setMemory("theme", theme);
    },
    toggleTheme: initialState.toggleTheme,
  };

  return <ThemeProviderContext.Provider {...props} value={value} />;
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

export function ModeToggle() {
  const { toggleTheme } = useTheme();
  const [systemMode, setSystemMode] = useState(false);
  
  useEffect(() => {
    const currentTheme = getTheme();
    setSystemMode(currentTheme === "system");
  }, []);

  const handleClick = () => {
    toggleTheme?.();

    const newTheme = getTheme();
    setSystemMode(newTheme === "system");
  };

  if (systemMode) {
    return (
      <Button variant="outline" size="icon" onClick={handleClick}>
        <Monitor className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  return (
    <Button variant="outline" size="icon" onClick={handleClick}>
      <Sun
        className={`relative dark:absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0`}
      />
      <Moon
        className={`absolute dark:relative h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100`}
      />
    </Button>
  );
}
