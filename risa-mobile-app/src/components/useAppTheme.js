import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { lightTheme, darkTheme } from "../theme";

export function useAppTheme() {
  const system = useColorScheme();
  const [theme, setTheme] = useState(system === "dark" ? "dark" : "light");

  useEffect(() => {
    AsyncStorage.getItem("theme").then((stored) => {
      if (stored) setTheme(stored);
      else setTheme(system === "dark" ? "dark" : "light");
    });
  }, [system]);

  const toggleTheme = async () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    await AsyncStorage.setItem("theme", next);
  };

  return {
    theme,
    colors: theme === "dark" ? darkTheme : lightTheme,
    toggleTheme,
  };
} 