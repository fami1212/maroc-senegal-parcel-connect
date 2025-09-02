"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ChatComponent from "./ChatComponent";
import GPSTracking from "./GPSTracking";
import RatingSystem from "./RatingSystem";

interface Reservation {
  id: string;
  expedition_id: string;
  trip_id: string;
  transporteur_id: string;
  total_price: number;
  status: "pending" | "confirmed" | "in_transit" | "delivered" | "cancelled";
  pickup_address: string;
  delivery_address: string;
  pickup_date: string;
  delivery_date: string;
  tracking_code: string;
  transporteur?: { first_name?: string; last_name?: string } | null;
  expedition?: { title?: string } | null;
  created_at: string;
  updated_at: string;
}

interface ClientReservationsListProps {
  clientId?: string | null;
}

export default function ClientReservationsList({ clientId }: ClientReservationsListProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReservations = async () => {
    if (!clientId) return;

    setLoading(true);
    try {
      // Récupérer les réservations du client
      const { data: reservationsData, error: reservationsError } = await supabase
        .from("reservations")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (reservationsError) {
        console.error("Erreur récupération réservations :", reservationsError.message);
        toast.error("Impossible de récupérer les réservations.");
        setLoading(false);
        return;
      }

      // Enrichir chaque réservation avec les données transporteur et expédition
      const enrichedReservations = await Promise.all(
        (reservationsData || []).map(async (reservation) => {
          // Récupérer les infos transporteur
          const { data: transporteurData } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", reservation.transporteur_id)
            .single();

          // Récupérer les infos expédition
          const { data: expeditionData } = await supabase
            .from("expeditions")
            .select("title")
            .eq("id", reservation.expedition_id)
            .single();

          return {
            ...reservation,
            transporteur: transporteurData,
            expedition: expeditionData
          };
        })
      );

      setReservations(enrichedReservations);
    } catch (err) {
      console.error("Erreur fetchReservations:", err);
      toast.error("Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [clientId]);

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
              {res.expedition?.title || "Expédition inconnue"} - Transporteur: {res.transporteur?.first_name} {res.transporteur?.last_name}
            </CardTitle>
            {getStatusBadge(res.status)}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p><strong>Ramassage :</strong> {res.pickup_address}</p>
                <p><strong>Date :</strong> {new Date(res.pickup_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p><strong>Livraison :</strong> {res.delivery_address}</p>
                <p><strong>Date :</strong> {res.delivery_date ? new Date(res.delivery_date).toLocaleDateString() : "À définir"}</p>
              </div>
              <div>
                <p><strong>Total :</strong> {res.total_price} MAD</p>
                <p><strong>Code de suivi :</strong> {res.tracking_code}</p>
              </div>
            </div>
            
            {/* Actions spécifiques au client */}
            <div className="flex flex-wrap gap-2">
              <ChatComponent 
                reservationId={res.id}
                otherUserId={res.transporteur_id}
                otherUserName={`${res.transporteur?.first_name} ${res.transporteur?.last_name}`}
              />
              
              {(res.status === "in_transit" || res.status === "delivered") && (
                <GPSTracking reservationId={res.id} />
              )}
              
              {res.status === "delivered" && (
                <RatingSystem 
                  reservationId={res.id}
                  reviewedUserId={res.transporteur_id}
                  reviewedUserName={`${res.transporteur?.first_name} ${res.transporteur?.last_name}`}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}