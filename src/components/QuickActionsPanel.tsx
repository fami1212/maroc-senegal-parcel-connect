import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  MapPin, 
  Package, 
  Truck, 
  MessageSquare,
  Bell,
  Settings,
  BarChart3,
  DollarSign,
  Star,
  CheckCircle,
  Activity
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'accent' | 'success';
  onClick: () => void;
  badge?: string;
  urgent?: boolean;
}

interface QuickActionsPanelProps {
  userType: 'client' | 'transporteur';
  onViewChange: (view: string) => void;
}

const QuickActionsPanel = ({ userType, onViewChange }: QuickActionsPanelProps) => {
  const { t } = useTranslation();

  const clientActions: QuickAction[] = [
    {
      title: 'Nouvelle expédition',
      description: 'Créer un nouveau colis à envoyer',
      icon: <Plus className="h-6 w-6" />,
      color: 'primary',
      onClick: () => onViewChange('expeditions')
    },
    {
      title: 'Rechercher transporteurs',
      description: 'Trouver le meilleur transporteur',
      icon: <Search className="h-6 w-6" />,
      color: 'secondary',
      onClick: () => onViewChange('trips-search')
    },
    {
      title: 'Mes réservations',
      description: 'Suivre mes envois en cours',
      icon: <Package className="h-6 w-6" />,
      color: 'accent',
      onClick: () => onViewChange('reservations'),
      badge: '2'
    },
    {
      title: 'Statistiques',
      description: 'Voir mes données d\'utilisation',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'success',
      onClick: () => onViewChange('stats')
    }
  ];

  const transporteurActions: QuickAction[] = [
    {
      title: 'Nouveau trajet',
      description: 'Proposer un nouveau trajet',
      icon: <Truck className="h-6 w-6" />,
      color: 'primary',
      onClick: () => onViewChange('trips')
    },
    {
      title: 'Mes réservations',
      description: 'Gérer les réservations clients',
      icon: <Package className="h-6 w-6" />,
      color: 'secondary',
      onClick: () => onViewChange('reservations'),
      badge: '5'
    },
    {
      title: 'Revenus',
      description: 'Consulter mes gains',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'success',
      onClick: () => onViewChange('earnings')
    },
    {
      title: 'Vérification KYC',
      description: 'Compléter ma vérification',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'accent',
      onClick: () => onViewChange('kyc'),
      urgent: true
    }
  ];

  const actions = userType === 'client' ? clientActions : transporteurActions;

  const getColorClasses = (color: string) => {
    const classes = {
      primary: 'border-primary/20 hover:border-primary/40 hover:bg-primary/5',
      secondary: 'border-secondary/20 hover:border-secondary/40 hover:bg-secondary/5',
      accent: 'border-accent/20 hover:border-accent/40 hover:bg-accent/5',
      success: 'border-success/20 hover:border-success/40 hover:bg-success/5'
    };
    return classes[color as keyof typeof classes];
  };

  const getIconColor = (color: string) => {
    const classes = {
      primary: 'text-primary bg-primary/10',
      secondary: 'text-secondary bg-secondary/10',
      accent: 'text-accent bg-accent/10',
      success: 'text-success bg-success/10'
    };
    return classes[color as keyof typeof classes];
  };

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          {t('dashboard.quickActions')}
        </CardTitle>
        <CardDescription>
          Accédez rapidement aux fonctionnalités principales
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <div
              key={index}
              className={`relative p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:shadow-card ${getColorClasses(action.color)}`}
              onClick={action.onClick}
            >
              {action.urgent && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 text-xs animate-pulse"
                >
                  Urgent
                </Badge>
              )}
              
              {action.badge && !action.urgent && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 text-xs"
                >
                  {action.badge}
                </Badge>
              )}
              
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-lg ${getIconColor(action.color)}`}>
                  {action.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsPanel;