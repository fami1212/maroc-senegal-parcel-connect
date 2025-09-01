import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  Eye,
  Package,
  Star,
  Clock,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface EarningsSummary {
  totalEarnings: number;
  thisMonthEarnings: number;
  completedDeliveries: number;
  averageRating: number;
  pendingPayments: number;
}

interface PaymentHistory {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  reservation: {
    expedition: {
      title: string;
      departure_city: string;
      destination_city: string;
    };
  };
}

const EarningsManagement = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    completedDeliveries: 0,
    averageRating: 0,
    pendingPayments: 0
  });
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    if (user) {
      fetchEarningsData();
      fetchPaymentHistory();
    }
  }, [user, selectedPeriod]);

  const fetchEarningsData = async () => {
    if (!user) return;

    try {
      // Récupérer les données du profil
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_earnings, completed_deliveries, average_rating")
        .eq("user_id", user.id)
        .single();

      // Calculer les revenus de ce mois
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const { data: monthlyPayments } = await supabase
        .from("payments")
        .select("transporteur_amount")
        .eq("transporteur_id", user.id)
        .eq("status", "completed")
        .gte("created_at", startOfMonth.toISOString());

      const thisMonthEarnings = monthlyPayments?.reduce(
        (sum, payment) => sum + (payment.transporteur_amount || 0), 0
      ) || 0;

      // Calculer les paiements en attente
      const { data: pendingPayments } = await supabase
        .from("payments")
        .select("transporteur_amount")
        .eq("transporteur_id", user.id)
        .eq("status", "pending");

      const pendingAmount = pendingPayments?.reduce(
        (sum, payment) => sum + (payment.transporteur_amount || 0), 0
      ) || 0;

      setSummary({
        totalEarnings: profile?.total_earnings || 0,
        thisMonthEarnings,
        completedDeliveries: profile?.completed_deliveries || 0,
        averageRating: profile?.average_rating || 0,
        pendingPayments: pendingAmount
      });

    } catch (error) {
      console.error("Erreur lors du chargement des revenus:", error);
    }
  };

  const fetchPaymentHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from("payments")
        .select(`
          id,
          amount,
          transporteur_amount,
          status,
          created_at,
          reservation:reservations(
            expedition:expeditions(
              title,
              departure_city,
              destination_city
            )
          )
        `)
        .eq("transporteur_id", user.id)
        .order("created_at", { ascending: false });

      // Filtrer par période
      if (selectedPeriod === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte("created_at", weekAgo.toISOString());
      } else if (selectedPeriod === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte("created_at", monthAgo.toISOString());
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setPayments(data || []);

    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
      toast.error("Erreur lors du chargement de l'historique");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { color: "bg-warning/10 text-warning border-warning/20", label: "En attente" },
      processing: { color: "bg-primary/10 text-primary border-primary/20", label: "En cours" },
      completed: { color: "bg-success/10 text-success border-success/20", label: "Complété" },
      failed: { color: "bg-destructive/10 text-destructive border-destructive/20", label: "Échoué" }
    };

    const config = configs[status as keyof typeof configs] || configs.pending;

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const exportData = () => {
    // Créer un CSV simple
    const csvContent = [
      ['Date', 'Montant', 'Statut', 'Expédition'],
      ...payments.map(payment => [
        new Date(payment.created_at).toLocaleDateString(),
        `${payment.amount} MAD`,
        payment.status,
        payment.reservation?.expedition?.title || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `revenus_${selectedPeriod}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success("Export téléchargé !");
  };

  return (
    <div className="space-y-6">
      {/* Résumé des revenus */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenus totaux</p>
                <p className="text-2xl font-bold">{summary.totalEarnings.toFixed(2)} MAD</p>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ce mois</p>
                <p className="text-2xl font-bold">{summary.thisMonthEarnings.toFixed(2)} MAD</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Livraisons</p>
                <p className="text-2xl font-bold">{summary.completedDeliveries}</p>
              </div>
              <Package className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Note moyenne</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  {summary.averageRating.toFixed(1)}
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paiements en attente */}
      {summary.pendingPayments > 0 && (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-warning" />
              <div>
                <h3 className="font-semibold">Paiements en attente</h3>
                <p className="text-sm text-muted-foreground">
                  Vous avez {summary.pendingPayments.toFixed(2)} MAD en attente de paiement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique des paiements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historique des paiements</CardTitle>
              <CardDescription>Détail de vos revenus par livraison</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="mb-4">
            <TabsList>
              <TabsTrigger value="week">7 jours</TabsTrigger>
              <TabsTrigger value="month">30 jours</TabsTrigger>
              <TabsTrigger value="all">Tout</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chargement de l'historique...</p>
            </div>
          ) : payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {payment.reservation?.expedition?.title || 'Expédition inconnue'}
                    </h4>
                    {getStatusBadge(payment.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Trajet :</span>
                      <br />
                      {payment.reservation?.expedition?.departure_city} → {payment.reservation?.expedition?.destination_city}
                    </div>
                    
                    <div>
                      <span className="font-medium">Montant :</span>
                      <br />
                      <span className="text-lg font-bold text-success">
                        {payment.amount.toFixed(2)} MAD
                      </span>
                    </div>
                    
                    <div>
                      <span className="font-medium">Date :</span>
                      <br />
                      {new Date(payment.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Aucun paiement pour cette période</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conseils pour augmenter les revenus */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Conseils pour augmenter vos revenus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Maintenez une note élevée en offrant un service de qualité</li>
            <li>• Proposez des trajets réguliers sur les routes populaires</li>
            <li>• Répondez rapidement aux demandes de réservation</li>
            <li>• Fournissez des preuves de livraison claires et professionnelles</li>
            <li>• Communiquez activement avec vos clients via le chat</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsManagement;