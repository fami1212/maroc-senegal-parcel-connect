import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, MapPin, Calendar, Weight, Search, Filter, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Expedition {
  id: string;
  title: string;
  description: string;
  weight_kg: number;
  dimensions_cm: string;
  content_type: string;
  departure_city: string;
  destination_city: string;
  preferred_date: string;
  transport_type: string;
  max_budget: number;
  status: string;
  created_at: string;
}

interface ExpeditionsListProps {
  showMyExpeditions?: boolean;
  onSelectExpedition?: (expedition: Expedition) => void;
}

const ExpeditionsList = ({ showMyExpeditions = false, onSelectExpedition }: ExpeditionsListProps) => {
  const { user } = useAuth();
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transportFilter, setTransportFilter] = useState("all");

  useEffect(() => {
    fetchExpeditions();
  }, [user, showMyExpeditions]);

  const fetchExpeditions = async () => {
    try {
      let query = supabase.from("expeditions").select("*");
      
      if (showMyExpeditions && user) {
        query = query.eq("client_id", user.id);
      }
      
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      setExpeditions(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des expéditions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      in_transit: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200"
    };
    
    const labels = {
      pending: "En attente",
      confirmed: "Confirmé",
      in_transit: "En transit",
      delivered: "Livré",
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
    return icons[type as keyof typeof icons] || "📦";
  };

  const filteredExpeditions = expeditions.filter(expedition => {
    const matchesSearch = expedition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expedition.departure_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expedition.destination_city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || expedition.status === statusFilter;
    const matchesTransport = transportFilter === "all" || expedition.transport_type === transportFilter;
    
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
            placeholder="Rechercher par titre ou ville..."
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
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="confirmed">Confirmé</SelectItem>
            <SelectItem value="in_transit">En transit</SelectItem>
            <SelectItem value="delivered">Livré</SelectItem>
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

      {/* Liste des expéditions */}
      {filteredExpeditions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">Aucune expédition trouvée</CardTitle>
            <CardDescription>
              {showMyExpeditions 
                ? "Vous n'avez pas encore créé d'expédition."
                : "Aucune expédition disponible pour le moment."
              }
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredExpeditions.map((expedition) => (
            <Card key={expedition.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{expedition.title}</CardTitle>
                      {getStatusBadge(expedition.status)}
                    </div>
                    {expedition.description && (
                      <CardDescription className="line-clamp-2">
                        {expedition.description}
                      </CardDescription>
                    )}
                  </div>
                  
                  {onSelectExpedition && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onSelectExpedition(expedition)}
                      className="ml-4"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{expedition.departure_city}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{expedition.destination_city}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Weight className="w-4 h-4 text-muted-foreground" />
                    <span>{expedition.weight_kg} kg</span>
                    {expedition.dimensions_cm && (
                      <span className="text-muted-foreground">({expedition.dimensions_cm})</span>
                    )}
                  </div>
                  
                  {expedition.transport_type && (
                    <div className="flex items-center gap-2">
                      <span>{getTransportIcon(expedition.transport_type)}</span>
                      <span className="capitalize">{expedition.transport_type}</span>
                    </div>
                  )}
                  
                  {expedition.preferred_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{format(new Date(expedition.preferred_date), "dd MMM yyyy", { locale: fr })}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {expedition.content_type}
                    </span>
                    {expedition.max_budget && (
                      <span className="text-sm font-medium text-primary">
                        Budget max: {expedition.max_budget} MAD
                      </span>
                    )}
                  </div>
                  
                  <span className="text-xs text-muted-foreground">
                    Créé le {format(new Date(expedition.created_at), "dd/MM/yyyy", { locale: fr })}
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

export default ExpeditionsList;