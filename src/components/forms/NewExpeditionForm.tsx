import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Package, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface NewExpeditionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const NewExpeditionForm = ({ onSuccess, onCancel }: NewExpeditionFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    weight_kg: "",
    dimensions_cm: "",
    content_type: "",
    departure_city: "",
    destination_city: "",
    transport_type: "",
    max_budget: "",
    photos: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("expeditions")
        .insert({
          client_id: user.id,
          title: formData.title,
          description: formData.description,
          weight_kg: parseFloat(formData.weight_kg),
          dimensions_cm: formData.dimensions_cm,
          content_type: formData.content_type,
          departure_city: formData.departure_city,
          destination_city: formData.destination_city,
          preferred_date: date?.toISOString().split('T')[0],
          transport_type: formData.transport_type as any,
          max_budget: formData.max_budget ? parseFloat(formData.max_budget) : null,
          photos: formData.photos
        });

      if (error) throw error;

      toast.success("Expédition créée avec succès !");
      onSuccess?.();
    } catch (error: any) {
      toast.error("Erreur lors de la création : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const cities = [
    "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Oujda", "Meknès",
    "Dakar", "Thiès", "Kaolack", "Saint-Louis", "Ziguinchor", "Touba", "Mbour", "Diourbel"
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
          <Package className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl">Nouvelle Expédition</CardTitle>
        <CardDescription>
          Créez votre demande d'expédition de colis
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre de l'expédition</Label>
              <Input
                id="title"
                placeholder="Ex: Colis alimentaire pour famille"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Décrivez le contenu de votre colis..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Détails du colis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="content_type">Type de contenu</Label>
              <Input
                id="content_type"
                placeholder="Ex: Vêtements, nourriture, électronique"
                value={formData.content_type}
                onChange={(e) => handleInputChange("content_type", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="weight_kg">Poids (kg)</Label>
              <Input
                id="weight_kg"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="5.5"
                value={formData.weight_kg}
                onChange={(e) => handleInputChange("weight_kg", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="dimensions_cm">Dimensions (L x l x H cm)</Label>
              <Input
                id="dimensions_cm"
                placeholder="50 x 30 x 20"
                value={formData.dimensions_cm}
                onChange={(e) => handleInputChange("dimensions_cm", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="max_budget">Budget maximum (MAD)</Label>
              <Input
                id="max_budget"
                type="number"
                step="0.01"
                min="0"
                placeholder="200"
                value={formData.max_budget}
                onChange={(e) => handleInputChange("max_budget", e.target.value)}
              />
            </div>
          </div>

          {/* Itinéraire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ville de départ</Label>
              <Select onValueChange={(value) => handleInputChange("departure_city", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une ville" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ville de destination</Label>
              <Select onValueChange={(value) => handleInputChange("destination_city", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une ville" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Préférences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Type de transport préféré</Label>
              <Select onValueChange={(value) => handleInputChange("transport_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avion">✈️ Avion</SelectItem>
                  <SelectItem value="voiture">🚗 Voiture</SelectItem>
                  <SelectItem value="camion">🚛 Camion</SelectItem>
                  <SelectItem value="bus">🚌 Bus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date souhaitée</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, "PPP", { locale: fr })
                    ) : (
                      <span>Choisir une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Annuler
              </Button>
            )}
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Création..." : "Créer l'expédition"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewExpeditionForm;