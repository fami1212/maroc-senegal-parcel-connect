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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1",
                active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  "mb-1 transition-transform duration-200",
                  active && "scale-110"
                )}
              />
              <span className="text-xs font-medium truncate">
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