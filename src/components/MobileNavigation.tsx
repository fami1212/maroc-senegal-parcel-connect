import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, Package, User, PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  const isClient = profile?.role === "client";
  const isTransporteur = profile?.role === "transporteur";
  const currentPath = location.pathname;

  const getNavItems = () => {
    if (!user) {
      return [
        { icon: Home, label: "Accueil", path: "/" },
        { icon: Search, label: "Explorer", path: "/auth" },
        { icon: Package, label: "Services", path: "/auth" },
        { icon: User, label: "Connexion", path: "/auth" },
      ];
    }

    if (isClient) {
      return [
        { icon: Home, label: "Accueil", path: "/client-dashboard" },
        { icon: Search, label: "Rechercher", path: "/client-dashboard?tab=search" },
        { icon: PlusCircle, label: "Nouveau", path: "/client-dashboard?tab=new" },
        { icon: Package, label: "Envois", path: "/client-dashboard?tab=shipments" },
        { icon: User, label: "Profil", path: "/client-dashboard?tab=profile" },
      ];
    }

    if (isTransporteur) {
      return [
        { icon: Home, label: "Accueil", path: "/transporteur-dashboard" },
        { icon: Package, label: "Voyages", path: "/transporteur-dashboard?tab=trips" },
        { icon: PlusCircle, label: "Nouveau", path: "/transporteur-dashboard?tab=new" },
        { icon: Search, label: "Gains", path: "/transporteur-dashboard?tab=earnings" },
        { icon: User, label: "Profil", path: "/transporteur-dashboard?tab=profile" },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    if (path.includes("?tab=")) {
      const [basePath, tab] = path.split("?tab=");
      const currentTab = new URLSearchParams(location.search).get("tab");
      return currentPath === basePath && (currentTab === tab || (!currentTab && tab === "overview"));
    }
    return currentPath === path;
  };

  const handleNavigation = (path: string) => {
    if (path.includes("?tab=")) {
      const [basePath, tab] = path.split("?tab=");
      navigate(`${basePath}?tab=${tab}`);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 md:hidden shadow-elegant">
      <div className="flex items-center justify-around px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-300 min-w-0 flex-1 relative",
                active
                  ? "text-primary bg-gradient-primary/10 shadow-button scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/5 hover:scale-102"
              )}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-primary rounded-full"></div>
              )}
              
              <Icon 
                size={22} 
                className={cn(
                  "mb-1 transition-all duration-300",
                  active && "text-primary drop-shadow-sm"
                )}
              />
              <span className={cn(
                "text-xs font-medium truncate transition-all duration-300",
                active ? "text-primary font-semibold" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;