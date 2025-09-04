import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  FileText, 
  CheckCircle, 
  Package, 
  User,
  MapPin,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface DeliveryProofProps {
  reservationId: string;
  onProofSubmitted?: () => void;
  existingProof?: {
    id: string;
    photo_url: string;
    recipient_name: string;
    signature_data?: string;
    notes?: string;
    delivered_at: string;
  };
}

const DeliveryProof = ({ reservationId, onProofSubmitted, existingProof }: DeliveryProofProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient_name: existingProof?.recipient_name || "",
    notes: existingProof?.notes || "",
    photo: null as File | null,
    signature_data: existingProof?.signature_data || ""
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  const uploadPhoto = async (file: File) => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/delivery-proofs/${reservationId}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("delivery-proofs")
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("delivery-proofs")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handlePhotoCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        toast.error("La photo est trop volumineuse (max 10MB)");
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner une image");
        return;
      }

      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  // Fonctions pour la signature
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const signatureData = canvas.toDataURL();
        setFormData(prev => ({ ...prev, signature_data: signatureData }));
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setFormData(prev => ({ ...prev, signature_data: "" }));
      }
    }
  };

  const submitProof = async () => {
    if (!user || !formData.recipient_name.trim()) {
      toast.error("Veuillez renseigner le nom du destinataire");
      return;
    }

    if (!formData.photo && !existingProof) {
      toast.error("Veuillez prendre une photo de la livraison");
      return;
    }

    setLoading(true);
    try {
      let photoUrl = existingProof?.photo_url;

      if (formData.photo) {
        photoUrl = await uploadPhoto(formData.photo);
        if (!photoUrl) throw new Error("Erreur upload photo");
      }

      const { error } = await supabase
        .from("delivery_proofs")
        .upsert({
          reservation_id: reservationId,
          transporteur_id: user.id,
          photo_url: photoUrl!,
          recipient_name: formData.recipient_name.trim(),
          signature_data: formData.signature_data || null,
          notes: formData.notes.trim() || null,
          delivered_at: new Date().toISOString()
        });

      if (error) throw error;

      // Mettre à jour le statut de la réservation
      await supabase
        .from("reservations")
        .update({ status: 'delivered' })
        .eq("id", reservationId);

      // Créer une notification pour le client
      const { data: reservation } = await supabase
        .from("reservations")
        .select("client_id")
        .eq("id", reservationId)
        .single();

      if (reservation) {
        await supabase.from("notifications").insert({
          user_id: reservation.client_id,
          type: "delivered",
          title: "Colis livré !",
          message: "Votre colis a été livré avec succès",
          data: { reservation_id: reservationId }
        });
      }

      toast.success("Preuve de livraison enregistrée !");
      onProofSubmitted?.();
    } catch (error: any) {
      toast.error("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mode lecture si la preuve existe déjà
  if (existingProof && !loading) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-success/10">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <CardTitle className="text-success">Livraison confirmée</CardTitle>
              <CardDescription>
                Preuve de livraison enregistrée le {new Date(existingProof.delivered_at).toLocaleDateString("fr-FR")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                Destinataire
              </Label>
              <p className="font-medium">{existingProof.recipient_name}</p>
            </div>
            
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                Date de livraison
              </Label>
              <p className="font-medium">
                {new Date(existingProof.delivered_at).toLocaleString("fr-FR")}
              </p>
            </div>
          </div>

          {existingProof.notes && (
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                Notes
              </Label>
              <p className="text-sm text-muted-foreground">{existingProof.notes}</p>
            </div>
          )}

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4" />
              Photo de livraison
            </Label>
            <img 
              src={existingProof.photo_url} 
              alt="Preuve de livraison" 
              className="w-full max-w-md rounded-lg border"
            />
          </div>

          {existingProof.signature_data && (
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                Signature du destinataire
              </Label>
              <img 
                src={existingProof.signature_data} 
                alt="Signature" 
                className="border rounded-lg bg-white p-2 max-w-md"
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary/10">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle>Confirmer la livraison</CardTitle>
            <CardDescription>
              Enregistrez la preuve de livraison pour finaliser l'expédition
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Photo de livraison */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Photo de livraison *
          </Label>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePhotoCapture}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Prendre photo
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Sélectionner
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {formData.photo && (
            <div className="mt-3">
              <img 
                src={URL.createObjectURL(formData.photo)} 
                alt="Aperçu" 
                className="w-full max-w-md rounded-lg border"
              />
            </div>
          )}
        </div>

        {/* Informations destinataire */}
        <div>
          <Label htmlFor="recipient_name">Nom du destinataire *</Label>
          <Input
            id="recipient_name"
            placeholder="Nom de la personne qui a reçu le colis"
            value={formData.recipient_name}
            onChange={(e) => setFormData(prev => ({ ...prev, recipient_name: e.target.value }))}
            required
          />
        </div>

        {/* Signature (optionnel) */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Signature du destinataire (optionnel)
          </Label>
          
          {!showSignaturePad ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSignaturePad(true)}
              className="w-full"
            >
              Ajouter une signature
            </Button>
          ) : (
            <div className="space-y-2">
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="border rounded-lg cursor-crosshair bg-white w-full"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSignature}
                  size="sm"
                >
                  Effacer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSignaturePad(false)}
                  size="sm"
                >
                  Masquer
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Notes additionnelles */}
        <div>
          <Label htmlFor="notes">Notes additionnelles (optionnel)</Label>
          <Textarea
            id="notes"
            placeholder="Commentaires sur la livraison..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
          />
        </div>

        {/* Bouton de soumission */}
        <Button 
          onClick={submitProof}
          disabled={loading || !formData.recipient_name.trim() || (!formData.photo && !existingProof)}
          className="w-full"
        >
          {loading ? "Enregistrement..." : "Confirmer la livraison"}
        </Button>

        {/* Information importante */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Information importante</p>
              <p className="text-muted-foreground">
                La preuve de livraison confirme que le colis a été remis au destinataire. 
                Cette action finalise l'expédition et déclenche le paiement.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryProof;