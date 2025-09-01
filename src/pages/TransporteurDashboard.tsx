import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, MapPin, DollarSign, Star, Calendar, Plus } from "lucide-react";
import TripsList from "@/components/TripsList";
import NewTripForm from "@/components/forms/NewTripForm";
import ReservationsList from "@/components/ReservationsList";
import EarningsManagement from "@/components/EarningsManagement";
import KYCVerification from "@/components/KYCVerification";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { useAuth } from "@/hooks/useAuth";

const TransporteurDashboard = () => {
  const { profile } = useAuth();
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Aperçu</h2>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité de transport</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trajets actifs</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus du mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450 MAD</div>
            <p className="text-xs text-muted-foreground">+15% vs mois dernier</p>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colis transportés</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9</div>
            <p className="text-xs text-muted-foreground">Excellent</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Proposez un nouveau trajet ou gérez vos réservations</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Button className="h-24 flex-col space-y-2" variant="outline" onClick={() => setActiveView("trips")}>
            <Plus className="h-6 w-6" />
            <span>Nouveau trajet</span>
          </Button>
          <Button className="h-24 flex-col space-y-2" variant="outline" onClick={() => setActiveView("reservations")}>
            <Calendar className="h-6 w-6" />
            <span>Gérer réservations</span>
          </Button>
        </CardContent>
      </Card>

      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Prochains trajets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTrips.slice(0, 2).map((trip) => (
              <div key={trip.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{trip.route}</h4>
                  <p className="text-sm text-muted-foreground">
                    Départ: {new Date(trip.departDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(trip.status)}
                  <span className="text-sm font-medium">{trip.reservations} réservations</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTrips = () => (
    <div className="space-y-6">
      {showNewTripForm ? (
        <NewTripForm onSuccess={() => setShowNewTripForm(false)} onCancel={() => setShowNewTripForm(false)} />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Mes Trajets</h2>
              <p className="text-muted-foreground">Gérez vos offres de transport</p>
            </div>
            <Button onClick={() => setShowNewTripForm(true)}>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mes réservations</h2>
        <p className="text-muted-foreground">Gérez les réservations de vos trajets</p>
      </div>
      {profile?.id ? (
        <ReservationsList transporteurId={profile.id} />
      ) : (
        <p>Chargement des réservations...</p>
      )}
    </div>
  );

  const renderEarnings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestion des revenus</h2>
        <p className="text-muted-foreground">Suivez vos gains et paiements</p>
      </div>
      <EarningsManagement />
    </div>
  );

  const renderKYC = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Vérification d'identité</h2>
        <p className="text-muted-foreground">Vérifiez votre identité pour débloquer toutes les fonctionnalités</p>
      </div>
      <KYCVerification />
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Mon profil transporteur</CardTitle>
          <CardDescription>Gérez vos informations et documents de vérification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Prénom</label>
                <p className="text-muted-foreground">{profile?.first_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Nom</label>
                <p className="text-muted-foreground">{profile?.last_name}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Type de compte</label>
              <p className="text-muted-foreground capitalize">{profile?.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Statut de vérification</label>
              <div className="flex items-center space-x-2">
                {profile?.is_verified ? <Badge className="bg-secondary text-secondary-foreground">Vérifié</Badge> : <Badge variant="outline">En attente</Badge>}
              </div>
            </div>
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
