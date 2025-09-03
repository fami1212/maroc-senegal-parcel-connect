import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MessageSquare,
  Star,
  DollarSign,
  MapPin
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ActivityItem {
  id: string;
  type: 'expedition' | 'reservation' | 'message' | 'payment' | 'review' | 'delivery';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info' | 'error';
  icon: React.ReactNode;
  urgent?: boolean;
}

interface RecentActivityFeedProps {
  userType: 'client' | 'transporteur';
}

const RecentActivityFeed = ({ userType }: RecentActivityFeedProps) => {
  const { t } = useTranslation();

  const clientActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'expedition',
      title: 'Nouvelle expédition créée',
      description: 'Colis vers Dakar - 2.5kg',
      timestamp: 'Il y a 2h',
      status: 'info',
      icon: <Package className="h-4 w-4" />
    },
    {
      id: '2',
      type: 'reservation',
      title: 'Réservation confirmée',
      description: 'Transport avec Ahmed M.',
      timestamp: 'Il y a 3h',
      status: 'success',
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      id: '3',
      type: 'message',
      title: 'Nouveau message',
      description: 'Message de votre transporteur',
      timestamp: 'Il y a 1h',
      status: 'warning',
      icon: <MessageSquare className="h-4 w-4" />,
      urgent: true
    },
    {
      id: '4',
      type: 'delivery',
      title: 'Colis livré',
      description: 'Expédition #GC12345 terminée',
      timestamp: 'Hier',
      status: 'success',
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      id: '5',
      type: 'review',
      title: 'Évaluation demandée',
      description: 'Notez votre expérience',
      timestamp: 'Il y a 1 jour',
      status: 'info',
      icon: <Star className="h-4 w-4" />
    }
  ];

  const transporteurActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'reservation',
      title: 'Nouvelle réservation',
      description: 'Commande de Fatima K. - 3kg',
      timestamp: 'Il y a 1h',
      status: 'warning',
      icon: <Package className="h-4 w-4" />,
      urgent: true
    },
    {
      id: '2',
      type: 'payment',
      title: 'Paiement reçu',
      description: '150 MAD pour trajet Rabat-Casablanca',
      timestamp: 'Il y a 2h',
      status: 'success',
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      id: '3',
      type: 'message',
      title: 'Message client',
      description: 'Question sur la livraison',
      timestamp: 'Il y a 30min',
      status: 'info',
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      id: '4',
      type: 'delivery',
      title: 'Livraison effectuée',
      description: 'Colis remis à Marrakech',
      timestamp: 'Il y a 4h',
      status: 'success',
      icon: <MapPin className="h-4 w-4" />
    },
    {
      id: '5',
      type: 'review',
      title: 'Nouvelle évaluation',
      description: '5 étoiles de Mohamed B.',
      timestamp: 'Hier',
      status: 'success',
      icon: <Star className="h-4 w-4" />
    }
  ];

  const activities = userType === 'client' ? clientActivities : transporteurActivities;

  const getStatusColor = (status: string) => {
    const colors = {
      success: 'bg-success/10 text-success border-success/20',
      warning: 'bg-warning/10 text-warning border-warning/20',
      info: 'bg-primary/10 text-primary border-primary/20',
      error: 'bg-destructive/10 text-destructive border-destructive/20'
    };
    return colors[status as keyof typeof colors];
  };

  const getIconBg = (status: string) => {
    const colors = {
      success: 'bg-success/20 text-success',
      warning: 'bg-warning/20 text-warning',
      info: 'bg-primary/20 text-primary',
      error: 'bg-destructive/20 text-destructive'
    };
    return colors[status as keyof typeof colors];
  };

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          {t('dashboard.recentActivity')}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors relative"
              >
                {activity.urgent && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                  </div>
                )}
                
                <div className={`p-2 rounded-lg ${getIconBg(activity.status)}`}>
                  {activity.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold">
                      {activity.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(activity.status)}`}
                    >
                      {activity.timestamp}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;