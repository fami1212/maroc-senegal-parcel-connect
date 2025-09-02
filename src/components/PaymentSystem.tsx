import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Wallet, Smartphone, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface PaymentSystemProps {
  reservationId: string;
  amount: number;
  currency?: string;
  onPaymentSuccess?: () => void;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  payment_method: "stripe" | "mobile_money" | "cash" | "paypal";
  created_at: string;
  processed_at?: string;
}

const PaymentSystem = ({ reservationId, amount, currency = "MAD", onPaymentSuccess }: PaymentSystemProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [reservationId]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("reservation_id", reservationId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur récupération paiements:", error);
        return;
      }

      setPayments(data || []);
    } catch (err) {
      console.error("Erreur fetchPayments:", err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const processPayment = async () => {
    if (!selectedMethod) {
      toast.error("Veuillez sélectionner une méthode de paiement");
      return;
    }

    setLoading(true);
    try {
      // Créer le paiement dans la base de données
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert({
          reservation_id: reservationId,
          client_id: user?.id,
          transporteur_id: user?.id, // À ajuster selon la logique
          amount: amount,
          currency: currency,
          payment_method: selectedMethod as any,
          status: "processing"
        })
        .select()
        .single();

      if (paymentError) {
        throw paymentError;
      }

      // Simuler le traitement du paiement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Marquer comme complété
      const { error: updateError } = await supabase
        .from("payments")
        .update({ 
          status: "completed", 
          processed_at: new Date().toISOString() 
        })
        .eq("id", paymentData.id);

      if (updateError) {
        throw updateError;
      }

      // Mettre à jour le statut de la réservation
      const { error: reservationError } = await supabase
        .from("reservations")
        .update({ status: "confirmed" })
        .eq("id", reservationId);

      if (reservationError) {
        console.error("Erreur mise à jour réservation:", reservationError);
      }

      toast.success("Paiement effectué with succès !");
      fetchPayments();
      onPaymentSuccess?.();
    } catch (error) {
      console.error("Erreur paiement:", error);
      toast.error("Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "stripe": return <CreditCard className="w-4 h-4" />;
      case "mobile_money": return <Smartphone className="w-4 h-4" />;
      case "paypal": return <Wallet className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case "processing":
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />Traitement</Badge>;
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Complété</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Échoué</Badge>;
      case "refunded":
        return <Badge variant="secondary">Remboursé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const completedPayment = payments.find(p => p.status === "completed");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Paiement sécurisé
          </CardTitle>
          <CardDescription>
            Choisissez votre méthode de paiement préférée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Résumé du montant */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total à payer :</span>
              <span>{amount} {currency}</span>
            </div>
          </div>

          {completedPayment ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold text-green-700">Paiement effectué !</h3>
              <p className="text-muted-foreground">
                Votre paiement de {completedPayment.amount} {completedPayment.currency} a été traité avec succès.
              </p>
            </div>
          ) : (
            <>
              {/* Sélection méthode de paiement */}
              <div>
                <label className="text-sm font-medium mb-2 block">Méthode de paiement</label>
                <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Carte bancaire
                      </div>
                    </SelectItem>
                    <SelectItem value="mobile_money">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Mobile Money
                      </div>
                    </SelectItem>
                    <SelectItem value="paypal">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        PayPal
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bouton de paiement */}
              <Button 
                onClick={processPayment} 
                disabled={!selectedMethod || loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Traitement en cours..." : `Payer ${amount} ${currency}`}
              </Button>

              {/* Sécurité */}
              <div className="text-xs text-muted-foreground text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="w-3 h-3" />
                  Paiement sécurisé SSL
                </div>
                Vos données bancaires sont protégées et cryptées
              </div>
            </>
          )}

          {/* Historique des paiements */}
          {payments.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3">Historique des paiements</h4>
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {getPaymentMethodIcon(payment.payment_method)}
                        <div>
                          <p className="font-medium">{payment.amount} {payment.currency}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSystem;