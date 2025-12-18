import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
                <Moon className="w-5 h-5 text-slate-600" />
            )}
        </button>
    );
};

export default ThemeToggle;
