
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [pageKey, setPageKey] = useState(location.pathname);

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
      <header className="py-4 px-6 md:px-8 glass-subtle z-10 border-b border-border/40">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-gradient">By'Share</h1>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === "/" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Accueil
            </Link>
            <Link 
              to="/admin" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
              )}
            >
              Admin
            </Link>
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
            By'Share &copy; {new Date().getFullYear()} - Partage de fichiers simplifié
          </p>
        </div>
      </footer>
    </div>
  );
}
