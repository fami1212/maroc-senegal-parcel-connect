import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, FileCheck, Signature } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface DeliveryProofProps {
  reservationId: string;
  onProofSubmitted?: () => void;
}

const DeliveryProof = ({ reservationId, onProofSubmitted }: DeliveryProofProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [recipientName, setRecipientName] = useState("");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast.error("L'image est trop volumineuse (max 5MB)");
      return;
    }

    setPhoto(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const capturePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  // Fonctions pour le canvas de signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL();
      setSignature(signatureData);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignature("");
      }
    }
  };

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

  const submitProof = async () => {
    if (!user || !photo || !recipientName.trim()) {
      toast.error("Photo et nom du destinataire obligatoires");
      return;
    }

    setLoading(true);
    try {
      // Upload de la photo
      const photoUrl = await uploadPhoto(photo);
      if (!photoUrl) throw new Error("Erreur upload photo");

      // Enregistrement de la preuve de livraison
      const { error } = await supabase
        .from("delivery_proofs")
        .insert({
          reservation_id: reservationId,
          transporteur_id: user.id,
          photo_url: photoUrl,
          signature_data: signature || null,
          recipient_name: recipientName.trim(),
          notes: notes.trim() || null
        });

      if (error) throw error;

      // Mettre à jour le statut de la réservation
      await supabase
        .from("reservations")
        .update({ status: 'delivered' })
        .eq("id", reservationId);

      // Notifier le client
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
      
      // Reset du formulaire
      setPhoto(null);
      setPhotoPreview("");
      setSignature("");
      setRecipientName("");
      setNotes("");
      clearSignature();

    } catch (error: any) {
      toast.error("Erreur lors de l'enregistrement : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
          <FileCheck className="w-6 h-6 text-white" />
        </div>
        <CardTitle>Preuve de livraison</CardTitle>
        <CardDescription>
          Confirmez la livraison avec une photo et une signature
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Photo de livraison */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Photo de livraison *</Label>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Sélectionner photo
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={capturePhoto}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Prendre photo
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          {photoPreview && (
            <div className="border rounded-lg p-4">
              <img
                src={photoPreview}
                alt="Aperçu photo de livraison"
                className="w-full max-h-64 object-contain rounded"
              />
            </div>
          )}
        </div>

        {/* Nom du destinataire */}
        <div className="space-y-2">
          <Label htmlFor="recipient">Nom du destinataire *</Label>
          <Input
            id="recipient"
            placeholder="Nom de la personne qui a reçu le colis"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            required
          />
        </div>

        {/* Signature numérique */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Signature du destinataire (optionnel)</Label>
          
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              className="w-full border rounded cursor-crosshair bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-muted-foreground">
                <Signature className="w-4 h-4 inline mr-1" />
                Dessinez la signature ci-dessus
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSignature}
              >
                Effacer
              </Button>
            </div>
          </div>
        </div>

        {/* Notes supplémentaires */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optionnel)</Label>
          <Textarea
            id="notes"
            placeholder="Commentaires sur la livraison..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {notes.length}/500 caractères
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setPhoto(null);
              setPhotoPreview("");
              setSignature("");
              setRecipientName("");
              setNotes("");
              clearSignature();
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={submitProof}
            disabled={loading || !photo || !recipientName.trim()}
            className="flex-1"
          >
            {loading ? "Enregistrement..." : "Confirmer la livraison"}
          </Button>
        </div>

        {/* Info */}
        <div className="text-center text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg">
          <p>Cette preuve de livraison sera partagée avec le client</p>
          <p>Une fois confirmée, le statut passera automatiquement à "Livré"</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryProof;