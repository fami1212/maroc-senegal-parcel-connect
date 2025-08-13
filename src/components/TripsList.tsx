import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, MapPin, Calendar, Weight, Search, Clock, Star, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface TripsListProps {
  showMyTrips?: boolean;
  onSelectTrip?: (trip: Trip) => void;
  expeditionId?: string; // Pour filtrer les trajets compatibles avec une expédition
}

const TripsList = ({ showMyTrips = false, onSelectTrip, expeditionId }: TripsListProps) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transportFilter, setTransportFilter] = useState("all");

  useEffect(() => {
    fetchTrips();
  }, [user, showMyTrips]);

  const fetchTrips = async () => {
    try {
      let query = supabase
        .from("trips")
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `);
      
      if (showMyTrips && user) {
        query = query.eq("transporteur_id", user.id);
      }
      
      query = query.order("departure_date", { ascending: true });

      const { data, error } = await query;
      
      if (error) throw error;
      setTrips((data as any) || []);
    } catch (error) {
      console.error("Erreur lors du chargement des trajets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: "bg-green-100 text-green-800 border-green-200",
      full: "bg-orange-100 text-orange-800 border-orange-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    
    const labels = {
      open: "Ouvert",
      full: "Complet",
      in_progress: "En cours",
      completed: "Terminé",
      cancelled: "Annulé"
    };

    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getTransportIcon = (type: string) => {
    const icons = {
      avion: "✈️",
      voiture: "🚗",
      camion: "🚛",
      bus: "🚌"
    };
    return icons[type as keyof typeof icons] || "🚛";
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.departure_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destination_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (trip.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (trip.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
    const matchesTransport = transportFilter === "all" || trip.transport_type === transportFilter;
    
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
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher par ville ou transporteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
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
                : "Aucun trajet disponible pour le moment."
              }
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map((trip) => (
            <Card key={trip.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getTransportIcon(trip.transport_type)}</span>
                      <CardTitle className="text-lg">
                        {trip.departure_city} → {trip.destination_city}
                      </CardTitle>
                      {getStatusBadge(trip.status)}
                    </div>
                    
                    {!showMyTrips && trip.profiles && (
                      <CardDescription>
                        Transporteur: {trip.profiles.first_name} {trip.profiles.last_name}
                      </CardDescription>
                    )}
                  </div>
                  
                  {onSelectTrip && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onSelectTrip(trip)}
                      className="ml-4"
                      disabled={trip.status !== 'open'}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {expeditionId ? "Réserver" : "Voir"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{format(new Date(trip.departure_date), "dd MMM yyyy", { locale: fr })}</span>
                    {trip.departure_time && (
                      <>
                        <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                        <span>{trip.departure_time}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Weight className="w-4 h-4 text-muted-foreground" />
                    <span>{trip.available_weight_kg} kg dispo</span>
                    {trip.available_volume_m3 && (
                      <span className="text-muted-foreground">({trip.available_volume_m3} m³)</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-semibold">{trip.price_per_kg} MAD/kg</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="capitalize text-muted-foreground">{trip.transport_type}</span>
                  </div>
                </div>
                
                {trip.vehicle_info && (
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    <p className="text-muted-foreground">{trip.vehicle_info}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    {!showMyTrips && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">4.8</span>
                      </div>
                    )}
                  </div>
                  
                  <span className="text-xs text-muted-foreground">
                    Publié le {format(new Date(trip.created_at), "dd/MM/yyyy", { locale: fr })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripsList;