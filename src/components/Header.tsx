import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Truck,
  Package,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import goColisLogo from "@/assets/gocolis-logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { href: "#features", label: "Avantages" },
    { href: "#clients", label: "Clients" },
    { href: "#transporteurs", label: "Transporteurs" },
    { href: "#contact", label: "Contact" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDashboardClick = () => {
    if (profile?.role === "client") {
      navigate("/client-dashboard");
    } else if (profile?.role === "transporteur") {
      navigate("/transporteur-dashboard");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + slogan */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={goColisLogo} alt="GoColis" className="h-9 w-9" />
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold text-primary">GoColis</span>
            <span className="text-xs text-muted-foreground">
              Rapide. Fiable. Partout.
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/auth")}
            className="flex items-center"
          >
            <Package className="mr-2 h-4 w-4" />
            Envoyer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/auth")}
            className="flex items-center"
          >
            <Truck className="mr-2 h-4 w-4" />
            Transporter
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{profile?.first_name || "Utilisateur"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDashboardClick}>
                  <Settings className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth")}
              >
                Connexion
              </Button>
              <Button
                variant="cta"
                size="sm"
                onClick={() => navigate("/auth")}
              >
                S'inscrire
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Slide Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-md animate-slide-in">
          <nav className="py-4 space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="px-4 pt-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full flex items-center"
                onClick={() => navigate("/auth")}
              >
                <Package className="mr-2 h-4 w-4" />
                Envoyer un colis
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center"
                onClick={() => navigate("/auth")}
              >
                <Truck className="mr-2 h-4 w-4" />
                Devenir transporteur
              </Button>

              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleDashboardClick}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    Se déconnecter
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    Connexion
                  </Button>
                  <Button
                    variant="cta"
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    S'inscrire
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
