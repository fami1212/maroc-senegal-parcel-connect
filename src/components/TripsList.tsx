import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReservationModal from "@/components/forms/ReservationModal";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck,
  Calendar,
  Weight,
  Search,
  Clock,
  Star,
  Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import EditTripForm from "@/components/forms/EditTripForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Trip {
  id: string;
  transporteur_id: string;
  departure_city: string;
  destination_city: string;
  departure_date: string;
  departure_time: string;
  transport_type: string;
  available_weight_kg: number;
  available_volume_m3: number;
  price_per_kg: number;
  vehicle_info: string;
  status: string;
  created_at: string;
  transporteur?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface TripsListProps {
  showMyTrips?: boolean;
  onSelectTrip?: (trip: Trip) => void;
  expeditionId?: string;
}

const TripsList = ({
  showMyTrips = false,
  onSelectTrip,
  expeditionId,
}: TripsListProps) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transportFilter, setTransportFilter] = useState("all");
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) fetchTrips();
  }, [user, showMyTrips]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      let query = supabase.from("trips").select("*");

      if (showMyTrips && user) {
        query = query.eq("transporteur_id", user.id);
      }

      query = query.order("departure_date", { ascending: true });
      const { data, error } = await query;
      if (error) throw error;

      const tripsWithProfiles = await Promise.all(
        (data || []).map(async (trip: any) => {
          if (!trip) return null;
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", trip.transporteur_id)
            .single();
          return { ...trip, transporteur: profile || null };
        })
      );

      setTrips(tripsWithProfiles.filter((t) => t !== null) as Trip[]);
    } catch (error) {
      console.error("Erreur lors du chargement des trajets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce trajet ?")) return;

    try {
      const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripId)
        .eq("transporteur_id", user?.id);
      if (error) throw error;

      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (error: any) {
      console.error("Erreur suppression :", error.message || error);
      alert("Impossible de supprimer le trajet : " + (error.message || error));
    }
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setIsModalOpen(true);
  };

  const handleEditSuccess = (updatedTrip: Trip) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
    );
    setIsModalOpen(false);
    setEditingTrip(null);
  };

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      open: "bg-green-100 text-green-800 border-green-200",
      full: "bg-orange-100 text-orange-800 border-orange-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    const labels = {
      open: "Ouvert",
      full: "Complet",
      in_progress: "En cours",
      completed: "Terminé",
      cancelled: "Annulé",
    };
    return (
      <Badge
        variant="outline"
        className={`${variants[status as keyof typeof variants]} text-xs sm:text-sm`}
      >
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getTransportIcon = (type: string) => {
    const icons = { avion: "✈️", voiture: "🚗", camion: "🚛", bus: "🚌" };
    return icons[type as keyof typeof icons] || "🚛";
  };

  const filteredTrips = trips.filter((trip) => {
    if (!trip) return false;
    const matchesSearch =
      trip.departure_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.transporteur?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.transporteur?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
    const matchesTransport =
      transportFilter === "all" || trip.transport_type === transportFilter;
    return matchesSearch && matchesStatus && matchesTransport;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par ville ou transporteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="open">Ouvert</SelectItem>
              <SelectItem value="full">Complet</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
            </SelectContent>
          </Select>

          <Select value={transportFilter} onValueChange={setTransportFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Transport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les transports</SelectItem>
              <SelectItem value="avion">✈️ Avion</SelectItem>
              <SelectItem value="voiture">🚗 Voiture</SelectItem>
              <SelectItem value="camion">🚛 Camion</SelectItem>
              <SelectItem value="bus">🚌 Bus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Liste des trajets */}
        {filteredTrips.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Truck className="w-12 h-12 text-muted-foreground mb-4" />
              <CardTitle className="mb-2">Aucun trajet trouvé</CardTitle>
              <CardDescription>
                {showMyTrips
                  ? "Vous n'avez pas encore créé de trajet."
                  : "Aucun trajet disponible pour le moment."}
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map((trip) =>
              trip ? (
                <Card key={trip.id} className="hover:shadow-md transition-shadow w-full">
                  {/* Header */}
                  <CardHeader className="flex flex-col sm:flex-row sm:justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{getTransportIcon(trip.transport_type)}</span>
                      <div className="flex flex-col overflow-hidden">
                        <CardTitle className="text-lg sm:text-xl font-semibold truncate">
                          {trip.departure_city} → {trip.destination_city}
                        </CardTitle>
                        {trip.vehicle_info && (
                          <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[250px]">
                            {trip.vehicle_info}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                      {getStatusBadge(trip.status)}
                      {showMyTrips && trip.transporteur_id === user?.id ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="sm:w-auto w-full"
                            onClick={() => handleEditTrip(trip)}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="sm:w-auto w-full"
                            onClick={() => handleDeleteTrip(trip.id)}
                          >
                            Supprimer
                          </Button>
                        </>
                      ) : (
                        onSelectTrip && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="sm:w-auto w-full"
                            onClick={() => {
                              setSelectedTrip(trip);
                              setIsReservationOpen(true);
                            }}
                            disabled={trip.status !== "open"}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            {expeditionId ? "Réserver" : "Voir"}
                          </Button>

                        )
                      )}
                    </div>
                  </CardHeader>

                  {/* Content */}
                  <CardContent className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{format(new Date(trip.departure_date), "dd MMM yyyy", { locale: fr })}</span>
                      {trip.departure_time && (
                        <>
                          <Clock className="w-4 h-4 text-muted-foreground ml-1" />
                          <span>{trip.departure_time}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Weight className="w-4 h-4 text-muted-foreground" />
                      <span>{trip.available_weight_kg} kg</span>
                      {trip.available_volume_m3 && (
                        <span className="text-muted-foreground">({trip.available_volume_m3} m³)</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-primary font-semibold">{trip.price_per_kg} MAD/kg</span>
                    </div>

                    <div className="flex items-center gap-1 capitalize text-muted-foreground">
                      {trip.transport_type}
                    </div>
                  </CardContent>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 pt-3 border-t gap-1">
                    {!showMyTrips && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">4.8</span>
                      </div>
                    )}
                    <span className="p-5 text-xs text-muted-foreground">
                      Publié le {format(new Date(trip.created_at), "dd/MM/yyyy", { locale: fr })}
                    </span>
                  </div>
                </Card>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* Modal Edition */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Modifier le trajet</DialogTitle>
          </DialogHeader>
          {editingTrip && (
            <EditTripForm
              trip={editingTrip}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      <ReservationModal
        open={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        trip={selectedTrip}
        userId={user?.id || ""}
      />



    </>
  );
};

export default TripsList;
