"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Reservation {
  id: string;
  expedition_id: string;
  trip_id: string;
  client_id: string;
  total_price: number;
  status: "pending" | "confirmed" | "in_transit" | "delivered" | "cancelled";
  pickup_address: string;
  delivery_address: string;
  pickup_date: string;
  delivery_date: string;
  client?: { first_name?: string; last_name?: string } | null;
  expedition?: { title?: string } | null;
  created_at: string;
  updated_at: string;
}

interface ReservationsListProps {
  transporteurId?: string | null;
}

export default function ReservationsList({ transporteurId }: ReservationsListProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReservations = async () => {
    if (!transporteurId) return; // ⚠️ Ne rien faire si pas d'ID

    setLoading(true);
    try {
      // 🔹 Récupérer les réservations pour ce transporteur
      const { data: reservationsData, error: reservationsError } = await supabase
        .from("reservations_extended" as any) // Utilise ta vue ou table étendue
        .select("*")
        .eq("transporteur_id", transporteurId)
        .order("created_at", { ascending: false });

      if (reservationsError) {
        console.error("Erreur récupération réservations :", reservationsError.message);
        toast.error("Impossible de récupérer les réservations.");
        setLoading(false);
        return;
      }

      setReservations(reservationsData || []);
    } catch (err) {
      console.error("Erreur fetchReservations:", err);
      toast.error("Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [transporteurId]);

  const updateStatus = async (reservationId: string, status: Reservation["status"]) => {
    if (!reservationId) return;
    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", reservationId);

    if (error) {
      toast.error("Impossible de mettre à jour le statut");
      console.error(error);
      return;
    }

    toast.success(`Réservation ${status}`);
    fetchReservations();
  };

  const getStatusBadge = (status: Reservation["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">En attente</Badge>;
      case "confirmed":
        return <Badge className="bg-green-500 text-white">Confirmée</Badge>;
      case "in_transit":
        return <Badge className="bg-blue-500 text-white">En transit</Badge>;
      case "delivered":
        return <Badge className="bg-gray-500 text-white">Livrée</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {loading && <p>Chargement des réservations...</p>}
      {!loading && reservations.length === 0 && <p>Aucune réservation trouvée.</p>}

      {reservations.map((res) => (
        <Card key={res.id}>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>
              {res.expedition?.title || "Expédition inconnue"} - {res.client?.first_name} {res.client?.last_name}
            </CardTitle>
            {getStatusBadge(res.status)}
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p><strong>Ramassage :</strong> {res.pickup_address}</p>
              <p><strong>Date :</strong> {new Date(res.pickup_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p><strong>Livraison :</strong> {res.delivery_address}</p>
              <p><strong>Date :</strong> {new Date(res.delivery_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p><strong>Total :</strong> {res.total_price} MAD</p>
            </div>
            <div className="flex flex-col gap-2">
              {res.status === "pending" && (
                <Button onClick={() => updateStatus(res.id, "confirmed")}>Confirmer</Button>
              )}
              {res.status === "confirmed" && (
                <Button onClick={() => updateStatus(res.id, "in_transit")}>Mettre en transit</Button>
              )}
              {res.status === "in_transit" && (
                <Button onClick={() => updateStatus(res.id, "delivered")}>Marquer livrée</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
