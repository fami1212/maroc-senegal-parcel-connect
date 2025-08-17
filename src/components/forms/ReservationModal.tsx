"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

// Définition des types
interface Trip {
  id: string;
  transporteur_id: string;
  departure_city?: string;
  destination_city?: string;
  departure_date?: string;
  arrival_date?: string;
  price_per_kg: number;
  transporteur?: { first_name?: string; last_name?: string } | null;
}

interface Expedition {
  id: string;
  title: string;
  weight_kg: number;
  created_at: string;
}

interface ReservationModalProps {
  open: boolean;
  onClose: () => void;
  trip: Trip | null;
  userId: string;
}

export default function ReservationModal({ open, onClose, trip, userId }: ReservationModalProps) {
  const [loading, setLoading] = useState(false);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [selectedExpedition, setSelectedExpedition] = useState<string | null>(null);

  // Charger les expéditions du client connecté
  useEffect(() => {
    if (!userId) return;
    const fetchExpeditions = async () => {
      const { data, error } = await supabase
        .from("expeditions")
        .select("*")
        .eq("client_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur récupération expéditions :", error);
        toast.error("Impossible de récupérer vos expéditions.");
        return;
      }
      setExpeditions(data || []);
    };
    fetchExpeditions();
  }, [userId]);

  const handleReservation = async () => {
    if (!selectedExpedition) {
      toast.error("Veuillez sélectionner une expédition.");
      return;
    }
    if (!trip) {
      toast.error("Les informations du trajet sont incomplètes.");
      return;
    }

    const expedition = expeditions.find((e) => e.id === selectedExpedition);
    if (!expedition) {
      toast.error("Expédition sélectionnée invalide.");
      return;
    }

    const totalPrice = trip.price_per_kg * expedition.weight_kg;

    setLoading(true);
    const { error } = await supabase.from("reservations").insert([
      {
        expedition_id: expedition.id,
        trip_id: trip.id,
        client_id: userId,
        transporteur_id: trip.transporteur_id,
        total_price: totalPrice,
        pickup_address: trip.departure_city,
        delivery_address: trip.destination_city,
        pickup_date: trip.departure_date,
        delivery_date: trip.arrival_date,
      },
    ]);
    setLoading(false);

    if (error) {
      console.error("Erreur réservation :", error);
      toast.error("Échec de la réservation.");
    } else {
      toast.success(`Réservation effectuée ! Total : ${totalPrice} MAD`);
      onClose();
      setSelectedExpedition(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Réserver ce trajet</DialogTitle>
          <p className="text-sm text-gray-500">
            Sélectionnez une expédition puis confirmez la réservation.
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-4 text-sm">
          <p>
            <strong>Départ :</strong> {trip?.departure_city || "Non défini"} –{" "}
            {trip?.departure_date ? new Date(trip.departure_date).toLocaleDateString() : "Non défini"}
          </p>
          <p>
            <strong>Arrivée :</strong> {trip?.destination_city || "Non défini"} –{" "}
            {trip?.arrival_date ? new Date(trip.arrival_date).toLocaleDateString() : "Non défini"}
          </p>
          <p>
            <strong>Prix par kg :</strong> {trip?.price_per_kg ?? "Non défini"} MAD/kg
          </p>
          <p>
            <strong>Transporteur :</strong> {trip?.transporteur?.first_name} {trip?.transporteur?.last_name}
          </p>

          {/* Sélection de l'expédition */}
          <div>
            <strong>Choisir une expédition :</strong>
            <Select value={selectedExpedition || ""} onValueChange={(val) => setSelectedExpedition(val)}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Sélectionnez une expédition" />
              </SelectTrigger>
              <SelectContent>
                {expeditions.length > 0 ? (
                  expeditions.map((exp) => (
                    <SelectItem key={exp.id} value={exp.id}>
                      {exp.title} – {exp.weight_kg} kg – {new Date(exp.created_at).toLocaleDateString()}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="">Aucune expédition disponible</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedExpedition && trip && (
            <p className="mt-2">
              <strong>Prix total :</strong>{" "}
              {trip.price_per_kg * (expeditions.find((e) => e.id === selectedExpedition)?.weight_kg || 0)} MAD
            </p>
          )}
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleReservation} disabled={loading || !selectedExpedition}>
            {loading ? "Réservation..." : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
