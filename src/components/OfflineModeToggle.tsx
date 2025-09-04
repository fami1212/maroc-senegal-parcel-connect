import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Cloud, 
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { toast } from "sonner";

const OfflineModeToggle = () => {
  const { 
    isOnline, 
    isOfflineModeEnabled, 
    toggleOfflineMode, 
    syncData, 
    lastSyncTime,
    pendingSyncCount 
  } = useOfflineMode();
  
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncData();
      toast.success("Synchronisation terminée !");
    } catch (error) {
      toast.error("Erreur de synchronisation");
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSyncTime = (timestamp: number | null) => {
    if (!timestamp) return "Jamais";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffMinutes < 1440) return `Il y a ${Math.floor(diffMinutes / 60)}h`;
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <Card className="card-modern">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${isOnline ? 'bg-success/10' : 'bg-destructive/10'}`}>
              {isOnline ? (
                <Wifi className="w-6 h-6 text-success" />
              ) : (
                <WifiOff className="w-6 h-6 text-destructive" />
              )}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Mode hors ligne
                <Badge variant={isOnline ? "outline" : "destructive"}>
                  {isOnline ? "En ligne" : "Hors ligne"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Travaillez même sans connexion internet
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Toggle principal */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="offline-mode" className="font-medium">
              Activer le mode hors ligne
            </Label>
            <p className="text-sm text-muted-foreground">
              Synchronise les données pour utilisation hors ligne
            </p>
          </div>
          <Switch
            id="offline-mode"
            checked={isOfflineModeEnabled}
            onCheckedChange={toggleOfflineMode}
          />
        </div>

        {isOfflineModeEnabled && (
          <>
            {/* Status de synchronisation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Dernière synchronisation</p>
                    <p className="text-xs text-muted-foreground">
                      {formatLastSyncTime(lastSyncTime)}
                    </p>
                  </div>
                </div>
                
                {pendingSyncCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingSyncCount} en attente
                  </Badge>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSync}
                  disabled={isSyncing || !isOnline}
                  className="flex-1"
                >
                  {isSyncing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {isSyncing ? "Synchronisation..." : "Synchroniser"}
                </Button>
              </div>
            </div>

            {/* Informations sur les données stockées */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Données disponibles hors ligne :</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Mes expéditions
                  </span>
                  <Badge variant="outline">Disponible</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Trajets récents
                  </span>
                  <Badge variant="outline">Disponible</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Messages
                  </span>
                  <Badge variant="outline">Disponible</Badge>
                </div>
              </div>
            </div>

            {/* Avertissements */}
            {!isOnline && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-warning">Mode hors ligne actif</p>
                    <p className="text-muted-foreground">
                      Vos actions seront synchronisées dès que la connexion sera rétablie.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Information générale */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex gap-3">
            <Download className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">À propos du mode hors ligne</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Continuez à travailler sans connexion</li>
                <li>• Les données sont stockées localement et sécurisées</li>
                <li>• Synchronisation automatique au retour en ligne</li>
                <li>• Certaines fonctions nécessitent une connexion</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfflineModeToggle;