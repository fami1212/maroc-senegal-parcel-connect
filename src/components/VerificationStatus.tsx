import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle, AlertCircle, Clock, Upload } from "lucide-react";
import { toast } from "sonner";

interface KYCData {
  id: string;
  status: "pending" | "approved" | "rejected";
  document_type: "national_id" | "passport" | "driving_license";
  document_url: string;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
}

const VerificationStatus = () => {
  const { user, profile } = useAuth();
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchKYCStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("kyc_verification")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erreur KYC:", error);
        return;
      }

      setKycData(data);
    } catch (error) {
      console.error("Erreur fetchKYCStatus:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCStatus();
  }, [user]);

  const getStatusIcon = () => {
    if (!kycData) return <Upload className="w-5 h-5 text-muted-foreground" />;
    
    switch (kycData.status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "pending":
        return <Clock className="w-5 h-5 text-warning" />;
      default:
        return <Upload className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    if (!kycData) {
      return <Badge variant="outline">Non vérifié</Badge>;
    }

    switch (kycData.status) {
      case "approved":
        return <Badge className="bg-success text-success-foreground">Vérifié</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">En attente</Badge>;
      default:
        return <Badge variant="outline">Non vérifié</Badge>;
    }
  };

  const getStatusMessage = () => {
    if (!kycData) {
      return "Votre compte n'est pas encore vérifié. Certaines fonctionnalités peuvent être limitées.";
    }

    switch (kycData.status) {
      case "approved":
        return "Votre compte est vérifié ! Vous avez accès à toutes les fonctionnalités.";
      case "rejected":
        return `Votre demande a été rejetée: ${kycData.rejection_reason || "Raison non spécifiée"}`;
      case "pending":
        return "Votre demande de vérification est en cours d'examen. Nous vous contacterons bientôt.";
      default:
        return "Statut de vérification inconnu.";
    }
  };

  if (loading) {
    return (
      <Card className="card-modern">
        <CardContent className="p-6">
          <p>Chargement du statut de vérification...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Statut de vérification
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <AlertDescription className="flex-1">
              {getStatusMessage()}
            </AlertDescription>
          </div>
        </Alert>

        {kycData && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type de document:</span>
              <span className="capitalize">{kycData.document_type.replace('_', ' ')}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date de soumission:</span>
              <span>{new Date(kycData.created_at).toLocaleDateString()}</span>
            </div>

            {kycData.verified_at && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date de vérification:</span>
                <span>{new Date(kycData.verified_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}

        {(!kycData || kycData.status === "rejected") && (
          <div className="pt-4 border-t">
            <Button 
              className="w-full"
              onClick={() => window.location.href = "#kyc"}
            >
              {kycData?.status === "rejected" ? "Soumettre à nouveau" : "Commencer la vérification"}
            </Button>
          </div>
        )}

        {profile?.role === "transporteur" && !profile?.is_verified && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              En tant que transporteur, la vérification de votre identité est obligatoire pour accepter des réservations.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationStatus;