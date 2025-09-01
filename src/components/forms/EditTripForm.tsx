import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Truck, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Trip {
    id: string;
    departure_city: string;
    destination_city: string;
    departure_date: string;
    departure_time: string;
    transport_type: string;
    available_weight_kg: number;
    available_volume_m3?: number | null;
    price_per_kg: number;
    vehicle_info?: string;
}

interface EditTripFormProps {
    trip: Trip;
    onSuccess?: (updatedTrip: Trip) => void;
    onCancel?: () => void;
}

const EditTripForm = ({ trip, onSuccess, onCancel }: EditTripFormProps) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date | undefined>(trip.departure_date ? parseISO(trip.departure_date) : undefined);

    const [formData, setFormData] = useState({
        departure_city: trip.departure_city,
        destination_city: trip.destination_city,
        departure_time: trip.departure_time,
        transport_type: trip.transport_type,
        available_weight_kg: trip.available_weight_kg.toString(),
        available_volume_m3: trip.available_volume_m3?.toString() || "",
        price_per_kg: trip.price_per_kg.toString(),
        vehicle_info: trip.vehicle_info || ""
    });

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !date) return;

        setLoading(true);
        try {
            const { data: updatedTrips, error } = await supabase
                .from("trips")
                .update({
                    departure_city: formData.departure_city,
                    destination_city: formData.destination_city,
                    departure_date: date.toISOString().split("T")[0],
                    departure_time: formData.departure_time,
                    transport_type: formData.transport_type as "avion" | "voiture" | "camion" | "bus",
                    available_weight_kg: parseFloat(formData.available_weight_kg),
                    available_volume_m3: formData.available_volume_m3 ? parseFloat(formData.available_volume_m3) : null,
                    price_per_kg: parseFloat(formData.price_per_kg),
                    vehicle_info: formData.vehicle_info
                })
                .eq("id", trip.id)
                .select();

            if (error) throw error;

            toast.success("Trajet modifié avec succès !");
            if (updatedTrips && updatedTrips[0]) {
                onSuccess?.(updatedTrips[0]);
            }
        } catch (error: any) {
            toast.error("Erreur lors de la modification : " + (error.message || error));
        } finally {
            setLoading(false);
        }
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
        <Card className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 max-h-[90vh] overflow-y-auto">
            <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mb-4">
                    <Truck className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl">Modifier Trajet</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                    Modifiez les informations du trajet
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Itinéraire */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Ville de départ</Label>
                            <Select
                                value={formData.departure_city}
                                onValueChange={(v) => handleInputChange("departure_city", v)}
                                required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionnez une ville" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                    {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Ville de destination</Label>
                            <Select
                                value={formData.destination_city}
                                onValueChange={(v) => handleInputChange("destination_city", v)}
                                required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionnez une ville" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                    {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Date et heure */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 max-h-[70vh] overflow-y-auto">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        disabled={(d) => d < new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div>
                            <Label>Heure de départ</Label>
                            <Select
                                value={formData.departure_time}
                                onValueChange={(v) => handleInputChange("departure_time", v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choisir l'heure" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                    {timeSlots.map(time => (
                                        <SelectItem key={time} value={time}>
                                            <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{time}</div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Type de transport et capacité */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Type de transport</Label>
                            <Select
                                value={formData.transport_type}
                                onValueChange={(v) => handleInputChange("transport_type", v)}
                                required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionnez un type" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                    <SelectItem value="avion">✈️ Avion</SelectItem>
                                    <SelectItem value="voiture">🚗 Voiture</SelectItem>
                                    <SelectItem value="camion">🚛 Camion</SelectItem>
                                    <SelectItem value="bus">🚌 Bus</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Capacité disponible (kg)</Label>
                            <Input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={formData.available_weight_kg}
                                onChange={(e) => handleInputChange("available_weight_kg", e.target.value)}
                                className="w-full"
                                required
                            />
                        </div>
                    </div>

                    {/* Volume et prix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Volume disponible (m³) - optionnel</Label>
                            <Input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={formData.available_volume_m3}
                                onChange={(e) => handleInputChange("available_volume_m3", e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Label>Prix par kg (MAD)</Label>
                            <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={formData.price_per_kg}
                                onChange={(e) => handleInputChange("price_per_kg", e.target.value)}
                                className="w-full"
                                required
                            />
                        </div>
                    </div>

                    {/* Infos véhicule */}
                    <div>
                        <Label>Informations sur le véhicule (optionnel)</Label>
                        <Textarea
                            rows={3}
                            value={formData.vehicle_info}
                            onChange={(e) => handleInputChange("vehicle_info", e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 w-full sm:w-auto">
                                Annuler
                            </Button>
                        )}
                        <Button type="submit" disabled={loading} className="flex-1 w-full sm:w-auto">
                            {loading ? "Modification..." : "Modifier le trajet"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>

    );
};

export default EditTripForm;
