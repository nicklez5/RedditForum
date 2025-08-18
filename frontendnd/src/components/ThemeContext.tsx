import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
interface ThemeContextType {
    darkMode: boolean;
    toggleDarkMode:() => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if(!context) throw new Error("useTheme must be used with a Theme Provider");
    return context;
}
export const ThemeProvider = ({children} : {children: ReactNode}) => {
    const [darkMode, setDarkMode] = useState(false);
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") || "light";
        const isDark = storedTheme === "dark";
        setDarkMode(isDark);
        document.documentElement.setAttribute("data-theme",storedTheme);
    })
    const toggleDarkMode = () => {
        setDarkMode(prev => {
            const newDarkMode = !prev;
            const newTheme = newDarkMode ? "dark": "light"
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            return newDarkMode;
        })
    }
    return (
        <ThemeContext.Provider value={{darkMode, toggleDarkMode}}>
            {children}
        </ThemeContext.Provider>
    )
}