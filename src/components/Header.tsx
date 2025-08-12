import { Button } from "@/components/ui/button";
import goColisLogo from "@/assets/gocolis-logo.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src={goColisLogo} alt="GoColis" className="h-8 w-8" />
          <span className="text-xl font-bold text-primary">GoColis</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-foreground hover:text-primary transition-colors">
            Avantages
          </a>
          <a href="#clients" className="text-foreground hover:text-primary transition-colors">
            Clients
          </a>
          <a href="#transporteurs" className="text-foreground hover:text-primary transition-colors">
            Transporteurs
          </a>
          <a href="#contact" className="text-foreground hover:text-primary transition-colors">
            Contact
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            Connexion
          </Button>
          <Button variant="cta" size="sm">
            S'inscrire
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;