import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Clock, Truck, Package, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TrackingData {
  id: string;
  reservation_id: string;
  latitude: number;
  longitude: number;
  status: string;
  timestamp: string;
  address?: string;
  notes?: string;
}

interface GPSTrackingProps {
  reservationId: string;
  isTransporter?: boolean;
}

const GPSTracking = ({ reservationId, isTransporter = false }: GPSTrackingProps) => {
  const { user } = useAuth();
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const fetchTrackingData = async () => {
    const { data, error } = await supabase
      .from("tracking")
      .select("*")
      .eq("reservation_id", reservationId)
      .order("timestamp", { ascending: false });

    if (!error && data) {
      setTrackingData(data);
    }
  };

  useEffect(() => {
    fetchTrackingData();

    // S'abonner aux mises à jour en temps réel
    const subscription = supabase
      .channel(`tracking:${reservationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tracking',
          filter: `reservation_id=eq.${reservationId}`
        },
        () => {
          fetchTrackingData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [reservationId]);

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Géolocalisation non supportée"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });
  };

  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      // Utiliser l'API de géocodage inverse (exemple avec OpenStreetMap Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const updateLocation = async (status: string = 'in_transit', notes?: string) => {
    if (!user || !isTransporter) return;

    setLoading(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      const address = await getAddressFromCoords(latitude, longitude);

      const { error } = await supabase
        .from("tracking")
        .insert({
          reservation_id: reservationId,
          transporteur_id: user.id,
          latitude,
          longitude,
          status,
          address,
          notes
        });

      if (error) throw error;

      setCurrentLocation({ lat: latitude, lng: longitude });
      toast.success("Position mise à jour");
      
      // Notifier le client
      const { data: reservation } = await supabase
        .from("reservations")
        .select("client_id")
        .eq("id", reservationId)
        .single();

      if (reservation) {
        await supabase.from("notifications").insert({
          user_id: reservation.client_id,
          type: status === 'pickup' ? 'pickup_ready' : 'in_transit',
          title: "Mise à jour de livraison",
          message: `Votre colis est ${status === 'pickup' ? 'en cours de collecte' : 'en transit'}`,
          data: { reservation_id: reservationId }
        });
      }

    } catch (error: any) {
      toast.error("Erreur localisation : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non supportée");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Erreur géolocalisation:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    setWatchId(id);
    setIsTracking(true);
    toast.success("Suivi GPS activé");
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    toast.success("Suivi GPS arrêté");
  };

  const openInMaps = (lat: number, lng: number) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      window.open(`maps://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`);
    } else if (isAndroid) {
      window.open(`geo:${lat},${lng}`);
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pickup: { color: "bg-warning/10 text-warning border-warning/20", label: "Collecte", icon: Package },
      in_transit: { color: "bg-primary/10 text-primary border-primary/20", label: "En transit", icon: Truck },
      delivered: { color: "bg-success/10 text-success border-success/20", label: "Livré", icon: Package }
    };

    const config = configs[status as keyof typeof configs] || configs.in_transit;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      {/* Actions pour le transporteur */}
      {isTransporter && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Suivi GPS
            </CardTitle>
            <CardDescription>
              Partagez votre position avec le client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={startTracking}
                disabled={isTracking}
                variant={isTracking ? "secondary" : "default"}
                size="sm"
              >
                {isTracking ? "Suivi actif" : "Activer le suivi"}
              </Button>
              
              {isTracking && (
                <Button onClick={stopTracking} variant="outline" size="sm">
                  Arrêter le suivi
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                onClick={() => updateLocation('pickup', 'Arrivé au point de collecte')}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <Package className="w-4 h-4 mr-2" />
                Collecte
              </Button>
              
              <Button
                onClick={() => updateLocation('in_transit', 'Colis en cours de transport')}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <Truck className="w-4 h-4 mr-2" />
                En transit
              </Button>
              
              <Button
                onClick={() => updateLocation('delivered', 'Colis livré avec succès')}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <Package className="w-4 h-4 mr-2" />
                Livré
              </Button>
            </div>

            {currentLocation && (
              <Card className="p-3 bg-muted/50">
                <p className="text-sm font-medium mb-1">Position actuelle :</p>
                <p className="text-xs text-muted-foreground">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Historique de suivi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Historique de suivi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trackingData.length > 0 ? (
            <div className="space-y-4">
              {trackingData.map((track, index) => (
                <div key={track.id} className={`border-l-2 pl-4 pb-4 ${
                  index === 0 ? 'border-primary' : 'border-muted'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    {getStatusBadge(track.status)}
                    <span className="text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatTime(track.timestamp)}
                    </span>
                  </div>
                  
                  {track.address && (
                    <p className="text-sm mb-2">{track.address}</p>
                  )}
                  
                  {track.notes && (
                    <p className="text-xs text-muted-foreground mb-2">{track.notes}</p>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInMaps(track.latitude, track.longitude)}
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    Voir sur la carte
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée de suivi disponible</p>
              {isTransporter && (
                <p className="text-xs mt-2">Commencez le suivi pour partager votre position</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations importantes */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">À propos du suivi GPS</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Le suivi fonctionne en temps réel quand activé</li>
                <li>• Votre position est partagée uniquement avec le client</li>
                <li>• Vous pouvez arrêter le suivi à tout moment</li>
                <li>• Les mises à jour sont automatiquement sauvegardées</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GPSTracking;