import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Shield, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface KYCDocument {
  id: string;
  document_type: string;
  document_number: string;
  document_url: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
}

const KYCVerification = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    document_type: "",
    document_number: "",
    file: null as File | null
  });

  const fetchDocuments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("kyc_verification")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const uploadDocument = async (file: File, documentType: string) => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/kyc/${documentType}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("kyc-documents")
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("kyc-documents")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const submitDocument = async () => {
    if (!user || !formData.file || !formData.document_type || !formData.document_number) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Vérifier les types de fichiers acceptés
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(formData.file.type)) {
      toast.error("Type de fichier non autorisé. Utilisez JPG, PNG ou PDF");
      return;
    }

    // Vérifier la taille (max 10MB)
    if (formData.file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (max 10MB)");
      return;
    }

    setUploading(true);
    try {
      const documentUrl = await uploadDocument(formData.file, formData.document_type);
      if (!documentUrl) throw new Error("Erreur upload document");

      const { error } = await supabase
        .from("kyc_verification")
        .upsert({
          user_id: user.id,
          document_type: formData.document_type as "passport" | "national_id" | "driving_license",
          document_number: formData.document_number,
          document_url: documentUrl,
          status: 'pending' as "pending" | "approved" | "rejected"
        });

      if (error) throw error;

      toast.success("Document soumis pour vérification !");
      setFormData({ document_type: "", document_number: "", file: null });
      fetchDocuments();
    } catch (error: any) {
      toast.error("Erreur lors de la soumission : " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { 
        icon: Clock, 
        color: "bg-warning/10 text-warning border-warning/20", 
        label: "En attente" 
      },
      approved: { 
        icon: CheckCircle, 
        color: "bg-success/10 text-success border-success/20", 
        label: "Approuvé" 
      },
      rejected: { 
        icon: XCircle, 
        color: "bg-destructive/10 text-destructive border-destructive/20", 
        label: "Rejeté" 
      }
    };

    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      passport: "Passeport",
      national_id: "Carte d'identité nationale",
      driving_license: "Permis de conduire"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const isDocumentTypeUploaded = (type: string) => {
    return documents.some(doc => doc.document_type === type);
  };

  const hasApprovedDocument = documents.some(doc => doc.status === 'approved');

  return (
    <div className="space-y-6">
      {/* Status général */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${hasApprovedDocument ? 'bg-success/10' : 'bg-warning/10'}`}>
              <Shield className={`w-6 h-6 ${hasApprovedDocument ? 'text-success' : 'text-warning'}`} />
            </div>
            <div>
              <CardTitle>Vérification d'identité</CardTitle>
              <CardDescription>
                {hasApprovedDocument 
                  ? "Votre identité est vérifiée" 
                  : "Vérifiez votre identité pour débloquer toutes les fonctionnalités"
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Formulaire de soumission */}
      {!hasApprovedDocument && (
        <Card>
          <CardHeader>
            <CardTitle>Soumettre un document</CardTitle>
            <CardDescription>
              Uploadez une pièce d'identité officielle pour vérifier votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type de document</Label>
              <Select 
                value={formData.document_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type de document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport" disabled={isDocumentTypeUploaded("passport")}>
                    Passeport {isDocumentTypeUploaded("passport") && "(Déjà uploadé)"}
                  </SelectItem>
                  <SelectItem value="national_id" disabled={isDocumentTypeUploaded("national_id")}>
                    Carte d'identité nationale {isDocumentTypeUploaded("national_id") && "(Déjà uploadé)"}
                  </SelectItem>
                  <SelectItem value="driving_license" disabled={isDocumentTypeUploaded("driving_license")}>
                    Permis de conduire {isDocumentTypeUploaded("driving_license") && "(Déjà uploadé)"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Numéro de document</Label>
              <Input
                placeholder="Ex: AB123456 ou 1234567890"
                value={formData.document_number}
                onChange={(e) => setFormData(prev => ({ ...prev, document_number: e.target.value }))}
              />
            </div>

            <div>
              <Label>Fichier du document</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('kyc-file-input')?.click()}
                    >
                      Choisir un fichier
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG ou PDF • Max 10MB
                    </p>
                    {formData.file && (
                      <p className="text-sm font-medium">
                        Fichier sélectionné : {formData.file.name}
                      </p>
                    )}
                  </div>
                </div>
                <input
                  id="kyc-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData(prev => ({ ...prev, file }));
                  }}
                  className="hidden"
                />
              </div>
            </div>

            <Button 
              onClick={submitDocument} 
              disabled={uploading || !formData.file || !formData.document_type || !formData.document_number}
              className="w-full"
            >
              {uploading ? "Upload en cours..." : "Soumettre le document"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Liste des documents soumis */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents soumis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">
                        {getDocumentTypeLabel(doc.document_type)}
                      </span>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    Numéro : {doc.document_number}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    Soumis le {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                  </p>

                  {doc.status === 'rejected' && doc.rejection_reason && (
                    <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded">
                      <p className="text-sm text-destructive font-medium">Motif de rejet :</p>
                      <p className="text-sm text-destructive">{doc.rejection_reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info importante */}
      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-warning mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">Information importante</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• La vérification peut prendre 24 à 72 heures</li>
                <li>• Seuls les transporteurs vérifiés peuvent accepter des expéditions</li>
                <li>• Vos documents sont stockés de manière sécurisée</li>
                <li>• En cas de rejet, vous pouvez soumettre un nouveau document</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCVerification;