import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface OfflineData {
  expeditions: any[];
  trips: any[];
  reservations: any[];
  profile: any;
  lastSync: string;
}

interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: string;
}

const STORAGE_KEYS = {
  OFFLINE_DATA: 'gocolis_offline_data',
  PENDING_ACTIONS: 'gocolis_pending_actions',
  IS_OFFLINE_MODE: 'gocolis_offline_mode'
};

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineModeEnabled, setIsOfflineModeEnabled] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.IS_OFFLINE_MODE) === 'true';
  });
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Écouter les changements de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connexion rétablie - Synchronisation automatique...');
      if (isOfflineModeEnabled) {
        syncPendingActions();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Mode hors ligne activé - Les données seront synchronisées à la reconnexion');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOfflineModeEnabled]);

  // Charger les données hors ligne au démarrage
  useEffect(() => {
    loadOfflineData();
    loadPendingActions();
  }, []);

  const loadOfflineData = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
    if (stored) {
      setOfflineData(JSON.parse(stored));
    }
  };

  const loadPendingActions = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
    if (stored) {
      setPendingActions(JSON.parse(stored));
    }
  };

  const saveOfflineData = (data: Partial<OfflineData>) => {
    const current = offlineData || {
      expeditions: [],
      trips: [],
      reservations: [],
      profile: null,
      lastSync: new Date().toISOString()
    };

    const updated = { ...current, ...data, lastSync: new Date().toISOString() };
    setOfflineData(updated);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(updated));
  };

  const toggleOfflineMode = useCallback(async () => {
    if (!isOfflineModeEnabled) {
      if (!isOnline) {
        toast.error('Connexion requise pour activer le mode hors ligne');
        return;
      }
      await enableOfflineMode();
    } else {
      disableOfflineMode();
    }
  }, [isOfflineModeEnabled, isOnline]);

  const enableOfflineMode = useCallback(async () => {
    if (!isOnline) {
      toast.error('Connexion requise pour activer le mode hors ligne');
      return;
    }

    try {
      setSyncInProgress(true);
      
      // Simuler le téléchargement des données essentielles
      // En production, cela ferait des appels API réels
      const mockData: OfflineData = {
        expeditions: [],
        trips: [],
        reservations: [],
        profile: null,
        lastSync: new Date().toISOString()
      };

      saveOfflineData(mockData);
      setIsOfflineModeEnabled(true);
      localStorage.setItem(STORAGE_KEYS.IS_OFFLINE_MODE, 'true');
      
      toast.success('Mode hors ligne activé - Données synchronisées');
    } catch (error) {
      toast.error('Erreur lors de l\'activation du mode hors ligne');
    } finally {
      setSyncInProgress(false);
    }
  }, [isOnline, offlineData]);

  const disableOfflineMode = () => {
    setIsOfflineModeEnabled(false);
    localStorage.setItem(STORAGE_KEYS.IS_OFFLINE_MODE, 'false');
    
    // Optionnel : nettoyer les données hors ligne
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_DATA);
    setOfflineData(null);
    
    toast.success('Mode hors ligne désactivé');
  };

  const addPendingAction = (action: Omit<PendingAction, 'id' | 'timestamp'>) => {
    const pendingAction: PendingAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    const updated = [...pendingActions, pendingAction];
    setPendingActions(updated);
    localStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(updated));
    
    toast.info(`Action mise en file d'attente - Sera synchronisée à la reconnexion`);
  };

  const syncData = async () => {
    if (!isOnline) {
      toast.error('Connexion requise pour la synchronisation');
      return;
    }

    setSyncInProgress(true);
    try {
      // Synchroniser les actions en attente
      await syncPendingActions();
      
      // Mettre à jour les données locales (simulation)
      const updatedData = {
        ...offlineData,
        lastSync: new Date().toISOString()
      };
      
      saveOfflineData(updatedData);
      toast.success('Synchronisation terminée');
    } catch (error) {
      toast.error('Erreur lors de la synchronisation');
      throw error;
    } finally {
      setSyncInProgress(false);
    }
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    setSyncInProgress(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      for (const action of pendingActions) {
        try {
          // Ici, vous feriez les vrais appels API
          console.log('Synchronizing action:', action);
          
          // Simuler le succès
          await new Promise(resolve => setTimeout(resolve, 100));
          successCount++;
        } catch (error) {
          console.error('Failed to sync action:', action, error);
          failureCount++;
        }
      }

      // Nettoyer les actions synchronisées avec succès
      if (successCount > 0) {
        setPendingActions([]);
        localStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);
      }

      if (successCount > 0) {
        toast.success(`${successCount} action(s) synchronisée(s)`);
      }
      if (failureCount > 0) {
        toast.error(`${failureCount} action(s) ont échoué`);
      }

    } finally {
      setSyncInProgress(false);
    }
  };

  const getOfflineExpeditions = () => offlineData?.expeditions || [];
  const getOfflineTrips = () => offlineData?.trips || [];
  const getOfflineReservations = () => offlineData?.reservations || [];

  const canUseOffline = isOfflineModeEnabled && offlineData;
  const shouldUseOffline = canUseOffline && !isOnline;

  return {
    isOnline,
    isOfflineModeEnabled,
    canUseOffline,
    shouldUseOffline,
    offlineData,
    pendingSyncCount: pendingActions.length,
    lastSyncTime: offlineData?.lastSync ? new Date(offlineData.lastSync).getTime() : null,
    syncInProgress,
    toggleOfflineMode,
    enableOfflineMode,
    disableOfflineMode,
    addPendingAction,
    syncData,
    syncPendingActions,
    saveOfflineData,
    getOfflineExpeditions,
    getOfflineTrips,
    getOfflineReservations
  };
};