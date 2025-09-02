import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Package, Users, MapPin, Star, DollarSign, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

interface StatsData {
  totalExpeditions?: number;
  totalTrips?: number;
  totalReservations: number;
  totalEarnings: number;
  averageRating: number;
  completedDeliveries: number;
  monthlyGrowth: number;
  topRoutes: Array<{ route: string; count: number }>;
  recentActivity: Array<{ activity: string; date: string; type: string }>;
}

interface AdvancedStatsProps {
  userType: "client" | "transporteur";
}

const AdvancedStats = ({ userType }: AdvancedStatsProps) => {
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsData>({
    totalReservations: 0,
    totalEarnings: 0,
    averageRating: 0,
    completedDeliveries: 0,
    monthlyGrowth: 0,
    topRoutes: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, userType]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (userType === "client") {
        await fetchClientStats();
      } else {
        await fetchTransporteurStats();
      }
    } catch (error) {
      console.error("Erreur récupération statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientStats = async () => {
    // Récupérer les expéditions du client
    const { data: expeditions } = await supabase
      .from("expeditions")
      .select("*")
      .eq("client_id", user?.id);

    // Récupérer les réservations du client
    const { data: reservations } = await supabase
      .from("reservations")
      .select("*, expeditions(departure_city, destination_city)")
      .eq("client_id", user?.id);

    // Calculer les statistiques
    const totalSpent = reservations?.reduce((sum, r) => sum + Number(r.total_price), 0) || 0;
    const completedReservations = reservations?.filter(r => r.status === "delivered").length || 0;
    
    // Routes les plus utilisées
    const routeCount: { [key: string]: number } = {};
    reservations?.forEach(r => {
      if (r.expeditions) {
        const route = `${r.expeditions.departure_city} → ${r.expeditions.destination_city}`;
        routeCount[route] = (routeCount[route] || 0) + 1;
      }
    });

    const topRoutes = Object.entries(routeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }));

    setStats({
      totalExpeditions: expeditions?.length || 0,
      totalReservations: reservations?.length || 0,
      totalEarnings: totalSpent,
      averageRating: 4.8, // À calculer depuis les reviews
      completedDeliveries: completedReservations,
      monthlyGrowth: 15, // À calculer
      topRoutes,
      recentActivity: [] // À implémenter
    });
  };

  const fetchTransporteurStats = async () => {
    // Récupérer les trajets du transporteur
    const { data: trips } = await supabase
      .from("trips")
      .select("*")
      .eq("transporteur_id", user?.id);

    // Récupérer les réservations du transporteur
    const { data: reservations } = await supabase
      .from("reservations")
      .select("*")
      .eq("transporteur_id", user?.id);

    // Récupérer les paiements
    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .eq("transporteur_id", user?.id)
      .eq("status", "completed");

    // Calculer les statistiques
    const totalEarnings = payments?.reduce((sum, p) => sum + Number(p.transporteur_amount || 0), 0) || 0;
    const completedDeliveries = reservations?.filter(r => r.status === "delivered").length || 0;

    // Routes les plus populaires
    const routeCount: { [key: string]: number } = {};
    trips?.forEach(t => {
      const route = `${t.departure_city} → ${t.destination_city}`;
      routeCount[route] = (routeCount[route] || 0) + 1;
    });

    const topRoutes = Object.entries(routeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }));

    setStats({
      totalTrips: trips?.length || 0,
      totalReservations: reservations?.length || 0,
      totalEarnings,
      averageRating: 4.8, // À calculer depuis les reviews
      completedDeliveries,
      monthlyGrowth: 12, // À calculer
      topRoutes,
      recentActivity: [] // À implémenter
    });
  };

  if (loading) {
    return <div>Chargement des statistiques...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userType === "client" ? "Expéditions" : "Trajets"}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userType === "client" ? stats.totalExpeditions : stats.totalTrips}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{stats.monthlyGrowth}% ce mois
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.completedDeliveries} terminées
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userType === "client" ? "Dépensé" : "Revenus"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEarnings.toFixed(0)} MAD</div>
            <div className="flex items-center text-xs text-muted-foreground">
              Total cumulé
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.averageRating >= 4.5 ? (
                <><TrendingUp className="w-3 h-3 mr-1" />Excellent</>
              ) : (
                <><TrendingDown className="w-3 h-3 mr-1" />À améliorer</>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performances mensuelles */}
      <Card>
        <CardHeader>
          <CardTitle>Performance mensuelle</CardTitle>
          <CardDescription>Progression de vos activités ce mois</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Livraisons complétées</span>
              <span>{Math.round((stats.completedDeliveries / Math.max(stats.totalReservations, 1)) * 100)}%</span>
            </div>
            <Progress value={(stats.completedDeliveries / Math.max(stats.totalReservations, 1)) * 100} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Objectif mensuel</span>
              <span>75%</span>
            </div>
            <Progress value={75} className="bg-green-100" />
          </div>
        </CardContent>
      </Card>

      {/* Routes populaires */}
      {stats.topRoutes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Routes les plus {userType === "client" ? "utilisées" : "populaires"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topRoutes.map((route, index) => (
                <div key={route.route} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <span className="font-medium">{route.route}</span>
                  </div>
                  <span className="text-muted-foreground">{route.count} fois</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conseils et recommandations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.averageRating < 4.0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Améliorer votre note</p>
                  <p className="text-sm text-yellow-700">
                    Considérez améliorer la communication avec vos clients pour obtenir de meilleures évaluations.
                  </p>
                </div>
              </div>
            )}

            {userType === "transporteur" && stats.totalReservations < 5 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Augmenter votre activité</p>
                  <p className="text-sm text-blue-700">
                    Proposez plus de trajets sur des routes populaires pour attirer plus de clients.
                  </p>
                </div>
              </div>
            )}

            {stats.monthlyGrowth > 20 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Excellente croissance !</p>
                  <p className="text-sm text-green-700">
                    Votre activité est en forte croissance ce mois. Continuez sur cette lancée !
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedStats;