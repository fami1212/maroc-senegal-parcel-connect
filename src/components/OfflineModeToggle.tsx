import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Clock, 
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useOfflineMode } from "@/hooks/useOfflineMode";

const OfflineModeToggle = () => {
  const {
    isOnline,
    isOfflineModeEnabled,
    canUseOffline,
    pendingActions,
    syncInProgress,
    enableOfflineMode,
    disableOfflineMode,
    syncPendingActions
  } = useOfflineMode();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="w-6 h-6 text-success" />
            ) : (
              <WifiOff className="w-6 h-6 text-destructive" />
            )}
            <div>
              <CardTitle>Mode hors ligne</CardTitle>
              <CardDescription>
                Utilisez l'app sans connexion internet
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "secondary" : "destructive"}>
              {isOnline ? "En ligne" : "Hors ligne"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status et activation */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="offline-mode">Activer le mode hors ligne</Label>
            <p className="text-sm text-muted-foreground">
              Télécharge vos données pour une utilisation sans internet
            </p>
          </div>
          <Switch
            id="offline-mode"
            checked={isOfflineModeEnabled}
            onCheckedChange={(checked) => {
              if (checked) {
                enableOfflineMode();
              } else {
                disableOfflineMode();
              }
            }}
            disabled={syncInProgress}
          />
        </div>

        {/* Statut du mode hors ligne */}
        {isOfflineModeEnabled && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              {canUseOffline ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-success">Données synchronisées</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-warning">Synchronisation requise</span>
                </>
              )}
            </div>

            {/* Actions en attente */}
            {pendingActions > 0 && (
              <div className="border rounded-lg p-4 bg-warning/5 border-warning/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-warning" />
                    <span className="font-medium">Actions en attente</span>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    {pendingActions}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Ces actions seront synchronisées automatiquement lors de la reconnexion
                </p>
                {isOnline && (
                  <Button 
                    size="sm" 
                    onClick={syncPendingActions}
                    disabled={syncInProgress}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {syncInProgress ? "Synchronisation..." : "Synchroniser maintenant"}
                  </Button>
                )}
              </div>
            )}

            {/* Actions disponibles */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Fonctionnalités hors ligne :</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Consulter vos expéditions et trajets</li>
                <li>• Voir l'historique des réservations</li>
                <li>• Accéder aux informations de profil</li>
                <li>• Créer de nouvelles demandes (synchronisées plus tard)</li>
              </ul>
            </div>

            {/* Limites */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-warning">Limitations :</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Pas de chat en temps réel</li>
                <li>• Pas de tracking GPS</li>
                <li>• Pas de notifications push</li>
                <li>• Données non mises à jour automatiquement</li>
              </ul>
            </div>
          </div>
        )}

        {/* Conseils d'utilisation */}
        <div className="border-t pt-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">Conseils d'utilisation</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Activez le mode avant de voyager dans des zones sans réseau</li>
                <li>• Synchronisez régulièrement quand vous avez une connexion</li>
                <li>• Les photos et fichiers nécessitent une connexion internet</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfflineModeToggle;