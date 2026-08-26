import { createContext, useContext, useState } from "react";
import { theme } from "../lib/theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);
  const t = theme(dark);
  return (
    <ThemeContext.Provider value={{ t, dark, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
