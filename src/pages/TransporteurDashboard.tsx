import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, MapPin, DollarSign, Star, Calendar, Plus } from "lucide-react";
import TripsList from "@/components/TripsList";
import NewTripForm from "@/components/forms/NewTripForm";
import ReservationsList from "@/components/ReservationsList";
import EarningsManagement from "@/components/EarningsManagement";
import AdvancedStats from "@/components/AdvancedStats";
import KYCVerification from "@/components/KYCVerification";
import VerificationStatus from "@/components/VerificationStatus";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import DashboardStats from "@/components/DashboardStats";
import QuickActionsPanel from "@/components/QuickActionsPanel";
import RecentActivityFeed from "@/components/RecentActivityFeed";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

const TransporteurDashboard = () => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState("dashboard");
  const [showNewTripForm, setShowNewTripForm] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'trips':
        return renderTrips();
      case 'reservations':
        return renderReservations();
      case 'earnings':
        return renderEarnings();
      case 'kyc':
        return renderKYC();
        case 'stats':
          return renderStats();
        case 'profile':
          return renderProfile();
        default:
          return renderDashboard();
    }
  };

  const mockTrips = [
    { id: "1", route: "Casablanca → Dakar", status: "disponible", departDate: "2024-01-20", capacity: "15 kg disponible", price: "25 MAD/kg", reservations: 3 },
    { id: "2", route: "Rabat → Thiès", status: "en_cours", departDate: "2024-01-18", capacity: "Complet", price: "20 MAD/kg", reservations: 8 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disponible": return <Badge className="bg-secondary text-secondary-foreground">Disponible</Badge>;
      case "en_cours": return <Badge variant="secondary">En cours</Badge>;
      case "complete": return <Badge variant="outline">Terminé</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-hero p-6 rounded-2xl text-white shadow-elegant">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t('dashboard.welcome')}, {profile?.first_name}! 🚚
            </h1>
            <p className="text-white/90">
              Gérez vos trajets et livraisons facilement
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Truck className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <DashboardStats userType="transporteur" />

      {/* Quick Actions and Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        <QuickActionsPanel userType="transporteur" onViewChange={setActiveView} />
        <RecentActivityFeed userType="transporteur" />
      </div>

      {/* Upcoming Trips Preview */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Prochains trajets
          </CardTitle>
          <CardDescription>Vos trajets planifiés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTrips.slice(0, 2).map((trip) => (
              <div key={trip.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                <div>
                  <h4 className="font-semibold text-lg">{trip.route}</h4>
                  <p className="text-sm text-muted-foreground">
                    Départ: {new Date(trip.departDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {trip.capacity} • {trip.price}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(trip.status)}
                  <div className="text-right">
                    <p className="text-sm font-medium">{trip.reservations}</p>
                    <p className="text-xs text-muted-foreground">réservations</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTrips = () => (
    <div className="space-y-6 animate-fade-in">
      {showNewTripForm ? (
        <div className="card-modern p-6">
          <NewTripForm 
            onSuccess={() => setShowNewTripForm(false)} 
            onCancel={() => setShowNewTripForm(false)} 
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t('nav.trips')}</h2>
              <p className="text-muted-foreground">Gérez vos offres de transport</p>
            </div>
            <Button onClick={() => setShowNewTripForm(true)} className="btn-delivery">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Trajet
            </Button>
          </div>
          <TripsList showMyTrips={true} />
        </>
      )}
    </div>
  );

  const renderReservations = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">{t('nav.reservations')}</h2>
        <p className="text-muted-foreground">Gérez les réservations de vos trajets</p>
      </div>
      
      <VerificationStatus />
      
      {profile?.user_id ? (
        <ReservationsList transporteurId={profile.user_id} />
      ) : (
        <div className="card-modern p-8 text-center">
          <p className="text-muted-foreground">Chargement des réservations...</p>
        </div>
      )}
    </div>
  );

  const renderEarnings = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">{t('nav.earnings')}</h2>
        <p className="text-muted-foreground">Suivez vos gains et paiements</p>
      </div>
      <EarningsManagement />
    </div>
  );

  const renderKYC = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">{t('nav.kyc')}</h2>
        <p className="text-muted-foreground">Vérifiez votre identité pour débloquer toutes les fonctionnalités</p>
      </div>
      <KYCVerification />
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Statistiques avancées</h2>
        <p className="text-muted-foreground">Analyse détaillée de votre performance</p>
      </div>
      <AdvancedStats userType="transporteur" />
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            {t('nav.profile')} transporteur
          </CardTitle>
          <CardDescription>Gérez vos informations et documents de vérification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Prénom</label>
                <p className="text-lg font-semibold">{profile?.first_name || "Non renseigné"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nom</label>
                <p className="text-lg font-semibold">{profile?.last_name || "Non renseigné"}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type de compte</label>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {profile?.role}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Statut de vérification</label>
                <div className="flex items-center space-x-2 mt-1">
                  {profile?.is_verified ? (
                    <Badge className="bg-success text-success-foreground">
                      Vérifié ✓
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-warning">
                      En attente de vérification
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {profile?.role === 'transporteur' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Livraisons effectuées</label>
                  <p className="text-2xl font-bold text-primary">{(profile as any)?.completed_deliveries || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Note moyenne</label>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-accent">{(profile as any)?.average_rating || 0}</p>
                    <Star className="w-5 h-5 fill-accent text-accent" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Revenus totaux</label>
                  <p className="text-2xl font-bold text-success">{(profile as any)?.total_earnings || 0} MAD</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <RoleBasedLayout activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </RoleBasedLayout>
  );
};

export default TransporteurDashboard;
