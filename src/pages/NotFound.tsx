
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass rounded-2xl p-10 text-center max-w-md mx-auto animate-scale-in">
          <div className="w-16 h-16 glass-subtle rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gradient">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Oops! La page que vous recherchez n'existe pas.
          </p>
          <Button asChild className="btn-hover-effect">
            <a href="/">Retour à l'accueil</a>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
