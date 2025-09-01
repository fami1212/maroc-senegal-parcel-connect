import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Package, 
  Truck, 
  User, 
  Settings, 
  Shield, 
  DollarSign,
  BarChart3,
  MessageSquare,
  MapPin,
  Star,
  Bell,
  LogOut
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSelector from "./LanguageSelector";
import NotificationCenter from "./NotificationCenter";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem {
  key: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  badge?: number;
  active?: boolean;
}

interface RoleBasedLayoutProps {
  children: ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

const RoleBasedLayout = ({ children, activeView, onViewChange }: RoleBasedLayoutProps) => {
  const { user, profile, signOut } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Déconnexion réussie");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      {
        key: 'dashboard',
        icon: <BarChart3 className="w-5 h-5" />,
        label: t('nav.dashboard'),
        onClick: () => onViewChange('dashboard'),
        active: activeView === 'dashboard'
      },
      {
        key: 'profile',
        icon: <User className="w-5 h-5" />,
        label: t('nav.profile'),
        onClick: () => onViewChange('profile'),
        active: activeView === 'profile'
      }
    ];

    if (profile?.role === 'client') {
      return [
        ...baseItems,
        {
          key: 'expeditions',
          icon: <Package className="w-5 h-5" />,
          label: t('nav.expeditions'),
          onClick: () => onViewChange('expeditions'),
          active: activeView === 'expeditions'
        },
        {
          key: 'reservations',
          icon: <MapPin className="w-5 h-5" />,
          label: t('nav.reservations'),
          onClick: () => onViewChange('reservations'),
          active: activeView === 'reservations'
        },
        {
          key: 'trips-search',
          icon: <Truck className="w-5 h-5" />,
          label: 'Rechercher trajets',
          onClick: () => onViewChange('trips-search'),
          active: activeView === 'trips-search'
        }
      ];
    } else if (profile?.role === 'transporteur') {
      return [
        ...baseItems,
        {
          key: 'trips',
          icon: <Truck className="w-5 h-5" />,
          label: t('nav.trips'),
          onClick: () => onViewChange('trips'),
          active: activeView === 'trips'
        },
        {
          key: 'reservations',
          icon: <Package className="w-5 h-5" />,
          label: t('nav.reservations'),
          onClick: () => onViewChange('reservations'),
          active: activeView === 'reservations'
        },
        {
          key: 'earnings',
          icon: <DollarSign className="w-5 h-5" />,
          label: t('nav.earnings'),
          onClick: () => onViewChange('earnings'),
          active: activeView === 'earnings'
        },
        {
          key: 'kyc',
          icon: <Shield className="w-5 h-5" />,
          label: t('nav.kyc'),
          onClick: () => onViewChange('kyc'),
          active: activeView === 'kyc'
        }
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo et nom */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">GoColis</h1>
                <p className="text-xs text-muted-foreground">
                  {profile?.role === 'client' ? 'Espace Client' : 'Espace Transporteur'}
                </p>
              </div>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <NotificationCenter />
              
              {/* Profil utilisateur */}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('nav.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 space-y-2">
            <Card className="card-modern">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <Button
                      key={item.key}
                      variant={item.active ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        item.active ? "bg-primary text-primary-foreground" : ""
                      }`}
                      onClick={item.onClick}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-1">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Widget de statut */}
            <Card className="card-modern">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${(profile as any)?.kyc_verified ? 'bg-success' : 'bg-warning'}`} />
                    <span className="text-sm">
                      {(profile as any)?.kyc_verified ? 'Compte vérifié' : 'Vérification requise'}
                    </span>
                  </div>
                  
                  {profile?.role === 'transporteur' && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">
                        Note: {(profile as any)?.average_rating?.toFixed(1) || 'N/A'}/5
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedLayout;