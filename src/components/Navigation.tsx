import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

export const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-primary/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary glow-border flex items-center justify-center">
              <div className="w-6 h-1 bg-primary rounded-full glow-text"></div>
            </div>
            <h1 className="text-2xl font-bold glow-text">Fiber Optics Lab</h1>
          </Link>
          
          <div className="flex gap-2">
            <Link to="/">
              <Button 
                variant={isActive("/") ? "default" : "ghost"}
                className={isActive("/") ? "glow-border bg-primary text-primary-foreground" : "hover:glow-border"}
              >
                Theory
              </Button>
            </Link>
            <Link to="/simulation">
              <Button 
                variant={isActive("/simulation") ? "default" : "ghost"}
                className={isActive("/simulation") ? "glow-border bg-primary text-primary-foreground" : "hover:glow-border"}
              >
                Simulation
              </Button>
            </Link>
            <Link to="/conclusion">
              <Button 
                variant={isActive("/conclusion") ? "default" : "ghost"}
                className={isActive("/conclusion") ? "glow-border bg-primary text-primary-foreground" : "hover:glow-border"}
              >
                Conclusion
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
