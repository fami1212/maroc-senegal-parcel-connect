import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Truck, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface NewTripFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const NewTripForm = ({ onSuccess, onCancel }: NewTripFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    departure_city: "",
    destination_city: "",
    departure_time: "",
    transport_type: "",
    available_weight_kg: "",
    available_volume_m3: "",
    price_per_kg: "",
    vehicle_info: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("trips")
        .insert({
          transporteur_id: user.id,
          departure_city: formData.departure_city,
          destination_city: formData.destination_city,
          departure_date: date?.toISOString().split('T')[0],
          departure_time: formData.departure_time,
          transport_type: formData.transport_type as any,
          available_weight_kg: parseFloat(formData.available_weight_kg),
          available_volume_m3: formData.available_volume_m3 ? parseFloat(formData.available_volume_m3) : null,
          price_per_kg: parseFloat(formData.price_per_kg),
          vehicle_info: formData.vehicle_info
        });

      if (error) throw error;

      toast.success("Trajet créé avec succès !");
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

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mb-4">
          <Truck className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl">Nouveau Trajet</CardTitle>
        <CardDescription>
          Proposez un trajet pour transporter des colis
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Itinéraire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ville de départ</Label>
              <Select onValueChange={(value) => handleInputChange("departure_city", value)} required>
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
              <Select onValueChange={(value) => handleInputChange("destination_city", value)} required>
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

          {/* Date et heure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date de départ</Label>
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

            <div>
              <Label>Heure de départ</Label>
              <Select onValueChange={(value) => handleInputChange("departure_time", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir l'heure" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Type de transport et capacité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Type de transport</Label>
              <Select onValueChange={(value) => handleInputChange("transport_type", value)} required>
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
              <Label htmlFor="available_weight_kg">Capacité disponible (kg)</Label>
              <Input
                id="available_weight_kg"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="50"
                value={formData.available_weight_kg}
                onChange={(e) => handleInputChange("available_weight_kg", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Volume et prix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="available_volume_m3">Volume disponible (m³) - optionnel</Label>
              <Input
                id="available_volume_m3"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="2.5"
                value={formData.available_volume_m3}
                onChange={(e) => handleInputChange("available_volume_m3", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="price_per_kg">Prix par kg (MAD)</Label>
              <Input
                id="price_per_kg"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="25.00"
                value={formData.price_per_kg}
                onChange={(e) => handleInputChange("price_per_kg", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Informations véhicule */}
          <div>
            <Label htmlFor="vehicle_info">Informations sur le véhicule (optionnel)</Label>
            <Textarea
              id="vehicle_info"
              placeholder="Ex: Toyota Hiace 2020, climatisé, bagages sécurisés..."
              value={formData.vehicle_info}
              onChange={(e) => handleInputChange("vehicle_info", e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Annuler
              </Button>
            )}
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Création..." : "Créer le trajet"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewTripForm;