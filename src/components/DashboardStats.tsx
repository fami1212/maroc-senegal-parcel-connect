import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Star,
  Package,
  MapPin,
  DollarSign,
  Users
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description?: string;
  progress?: number;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  description, 
  progress,
  color = 'primary' 
}: StatCardProps) => {
  const getColorClasses = () => {
    switch (color) {
      case 'secondary':
        return 'text-secondary';
      case 'accent':
        return 'text-accent';
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className="card-modern relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${color} to-${color}-soft`} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-${color}/10 ${getColorClasses()}`}>
          {icon}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{value}</div>
            {change !== undefined && (
              <div className={`flex items-center text-sm ${
                trend === 'up' ? 'text-success' : 
                trend === 'down' ? 'text-destructive' : 
                'text-muted-foreground'
              }`}>
                {trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
                {change > 0 ? '+' : ''}{change}%
              </div>
            )}
          </div>
          
          {progress !== undefined && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progress}% de l'objectif
              </p>
            </div>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  userType: 'client' | 'transporteur';
}

const DashboardStats = ({ userType }: DashboardStatsProps) => {
  const { t } = useTranslation();

  const clientStats = [
    {
      title: t('dashboard.totalExpeditions'),
      value: 12,
      change: 15,
      trend: 'up' as const,
      icon: <Package className="h-4 w-4" />,
      description: '+2 ce mois',
      color: 'primary' as const
    },
    {
      title: 'En transit',
      value: 3,
      icon: <Clock className="h-4 w-4" />,
      description: 'Actuellement',
      color: 'warning' as const
    },
    {
      title: 'Économisé',
      value: '450 MAD',
      change: 8,
      trend: 'up' as const,
      icon: <DollarSign className="h-4 w-4" />,
      description: 'vs livraison classique',
      color: 'success' as const
    },
    {
      title: 'Satisfaction',
      value: '4.8/5',
      icon: <Star className="h-4 w-4" />,
      description: 'Note moyenne',
      progress: 96,
      color: 'accent' as const
    }
  ];

  const transporteurStats = [
    {
      title: t('dashboard.totalEarnings'),
      value: '2,450 MAD',
      change: 22,
      trend: 'up' as const,
      icon: <DollarSign className="h-4 w-4" />,
      description: 'Ce mois',
      color: 'success' as const
    },
    {
      title: t('dashboard.activeReservations'),
      value: 8,
      icon: <Activity className="h-4 w-4" />,
      description: 'En cours',
      color: 'primary' as const
    },
    {
      title: 'Trajets completés',
      value: 23,
      change: 5,
      trend: 'up' as const,
      icon: <MapPin className="h-4 w-4" />,
      description: 'Ce mois',
      color: 'secondary' as const
    },
    {
      title: t('dashboard.averageRating'),
      value: '4.9/5',
      icon: <Star className="h-4 w-4" />,
      description: 'Excellent service',
      progress: 98,
      color: 'accent' as const
    }
  ];

  const stats = userType === 'client' ? clientStats : transporteurStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;