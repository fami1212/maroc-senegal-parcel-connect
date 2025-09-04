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
  CreditCard,
  Banknote,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  reservation_id: string;
  transporteur_amount: number;
  commission_amount: number;
}

interface EarningsStats {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  pendingPayments: number;
  completedDeliveries: number;
}

const EarningsManagement = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<EarningsStats>({
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    pendingPayments: 0,
    completedDeliveries: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchEarningsData = async () => {
    if (!user) return;

    try {
      // Récupérer les paiements
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("transporteur_id", user.id)
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      setPayments(paymentsData || []);

      // Calculer les statistiques
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const completedPayments = paymentsData?.filter(p => p.status === 'completed') || [];
      const totalEarnings = completedPayments.reduce((sum, p) => sum + (p.transporteur_amount || 0), 0);
      
      const thisMonthPayments = completedPayments.filter(p => 
        new Date(p.created_at) >= startOfMonth
      );
      const lastMonthPayments = completedPayments.filter(p => 
        new Date(p.created_at) >= startOfLastMonth && new Date(p.created_at) <= endOfLastMonth
      );

      const thisMonth = thisMonthPayments.reduce((sum, p) => sum + (p.transporteur_amount || 0), 0);
      const lastMonth = lastMonthPayments.reduce((sum, p) => sum + (p.transporteur_amount || 0), 0);
      
      const pendingPayments = paymentsData?.filter(p => p.status === 'pending').length || 0;

      setStats({
        totalEarnings,
        thisMonth,
        lastMonth,
        pendingPayments,
        completedDeliveries: completedPayments.length
      });
    } catch (error) {
      console.error("Erreur récupération revenus:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { color: "bg-warning/10 text-warning border-warning/20", label: "En attente" },
      completed: { color: "bg-success/10 text-success border-success/20", label: "Terminé" },
      failed: { color: "bg-destructive/10 text-destructive border-destructive/20", label: "Échoué" }
    };

    const config = configs[status as keyof typeof configs] || configs.pending;
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      bank_transfer: Banknote,
      mobile_money: Wallet,
      cash: DollarSign
    };
    return icons[method as keyof typeof icons] || DollarSign;
  };

  const monthGrowth = stats.lastMonth > 0 
    ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des revenus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenus totaux
            </CardTitle>
            <div className="p-2 rounded-lg bg-success/10">
              <DollarSign className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedDeliveries} livraisons
            </p>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ce mois
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.thisMonth)}</div>
            <div className={`flex items-center text-xs ${
              monthGrowth >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {monthGrowth >= 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              {Math.abs(monthGrowth).toFixed(1)}% vs mois dernier
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paiements en attente
            </CardTitle>
            <div className="p-2 rounded-lg bg-warning/10">
              <Wallet className="w-4 h-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              En cours de traitement
            </p>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Moyenne par livraison
            </CardTitle>
            <div className="p-2 rounded-lg bg-accent/10">
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.completedDeliveries > 0 ? stats.totalEarnings / stats.completedDeliveries : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Par expédition
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Détails des revenus */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Historique des paiements</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Paiements récents</CardTitle>
                  <CardDescription>
                    Historique de vos revenus et commissions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((payment) => {
                    const PaymentIcon = getPaymentMethodIcon(payment.payment_method);
                    return (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-muted">
                            <PaymentIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {formatCurrency(payment.transporteur_amount || 0)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Expédition #{payment.reservation_id.slice(-8)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(payment.status)}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(payment.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun paiement pour le moment</p>
                  <p className="text-xs mt-2">Vos revenus apparaîtront ici après vos premières livraisons</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyses des revenus</CardTitle>
              <CardDescription>
                Aperçu de vos performances financières
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Revenus par mois</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ce mois</span>
                      <span className="font-medium">{formatCurrency(stats.thisMonth)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mois dernier</span>
                      <span className="font-medium">{formatCurrency(stats.lastMonth)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-sm font-medium">Évolution</span>
                      <span className={`font-medium ${monthGrowth >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {monthGrowth >= 0 ? '+' : ''}{monthGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Commissions</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      GoColis prend une commission de 10% sur chaque livraison pour maintenir la plateforme.
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Commission totale payée</span>
                      <span className="font-medium">
                        {formatCurrency(payments.reduce((sum, p) => sum + (p.commission_amount || 0), 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Information importante */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <CreditCard className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">À propos des paiements</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Les paiements sont traités sous 24-48h après livraison</li>
                <li>• Une commission de 10% est retenue par GoColis</li>
                <li>• Tous les montants sont en dirhams marocains (MAD)</li>
                <li>• Vous pouvez exporter vos données pour votre comptabilité</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsManagement;