
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { Sun, Moon, Upload, Home, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [pageKey, setPageKey] = useState(location.pathname);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPageKey(location.pathname);
  }, [location.pathname]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 md:px-8 glass-subtle sticky top-0 z-10 border-b border-border/40">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-gradient">By'Share</h1>
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link 
              to="/" 
              className={cn(
                "p-2 rounded-full text-sm font-medium transition-colors hover:bg-primary/10 flex items-center",
                location.pathname === "/" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Home className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Accueil</span>
            </Link>
            
            <Link 
              to="/upload" 
              className={cn(
                "p-2 rounded-full text-sm font-medium transition-colors hover:bg-primary/10 flex items-center",
                location.pathname === "/upload" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Upload className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Partager</span>
            </Link>
            
            <Link 
              to="/admin" 
              className={cn(
                "p-2 rounded-full text-sm font-medium transition-colors hover:bg-primary/10 flex items-center",
                location.pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
              )}
            >
              <User className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Admin</span>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
              <span className="sr-only">
                {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              </span>
            </Button>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-6 md:p-8 overflow-hidden">
        <div
          key={pageKey}
          className={cn(
            "page-transition-enter page-transition-enter-active"
          )}
        >
          {children}
        </div>
      </main>
      
      <footer className="py-6 px-6 md:px-8 glass-subtle border-t border-border/40">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            By'Share &copy; {new Date().getFullYear()} - Propulsé par <a href="#" className="text-primary hover:underline">By-Hoster</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
