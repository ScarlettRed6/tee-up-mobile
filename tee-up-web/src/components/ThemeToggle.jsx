import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import './ThemeToggle.css';

export function ThemeToggle() {
  const [theme, toggleTheme] = useTheme();

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className="theme-toggle-floating"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
