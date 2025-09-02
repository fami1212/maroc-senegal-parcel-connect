import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, MapPin, Clock, Star, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExpeditionsList from "@/components/ExpeditionsList";
import TripsList from "@/components/TripsList";
import NewExpeditionForm from "@/components/forms/NewExpeditionForm";
import ClientReservationsList from "@/components/ClientReservationsList";
import AdvancedStats from "@/components/AdvancedStats";
import VerificationStatus from "@/components/VerificationStatus";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { useAuth } from "@/hooks/useAuth";

const ClientDashboard = () => {
  const { profile } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [showNewExpeditionForm, setShowNewExpeditionForm] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'expeditions':
        return renderExpeditions();
      case 'reservations':
        return renderReservations();
      case 'trips-search':
        return renderTripsSearch();
        case 'stats':
          return renderStats();
        case 'profile':
          return renderProfile();
        default:
          return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Aperçu</h2>
        <p className="text-muted-foreground">Vue d'ensemble de vos expéditions</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total expéditions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 ce mois</p>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En transit</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Actuellement</p>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Économisé</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450 MAD</div>
            <p className="text-xs text-muted-foreground">vs livraison classique</p>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">Note moyenne</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Commencez votre prochaine expédition ou trouvez un transporteur</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Button 
            className="h-24 flex-col space-y-2" 
            variant="outline"
            onClick={() => setActiveView("expeditions")}
          >
            <Plus className="h-6 w-6" />
            <span>Nouvelle expédition</span>
          </Button>
          
          <Button 
            className="h-24 flex-col space-y-2" 
            variant="outline"
            onClick={() => setActiveView("trips-search")}
          >
            <Search className="h-6 w-6" />
            <span>Rechercher transporteurs</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderExpeditions = () => (
    <div className="space-y-6">
      {showNewExpeditionForm ? (
        <NewExpeditionForm 
          onSuccess={() => setShowNewExpeditionForm(false)}
          onCancel={() => setShowNewExpeditionForm(false)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Mes Expéditions</h2>
              <p className="text-muted-foreground">Gérez vos envois de colis</p>
            </div>
            <Button onClick={() => setShowNewExpeditionForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Expédition
            </Button>
          </div>
          <ExpeditionsList showMyExpeditions={true} />
        </>
      )}
    </div>
  );

  const renderReservations = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mes Réservations</h2>
        <p className="text-muted-foreground">Suivez vos réservations de transport</p>
      </div>
      
      <VerificationStatus />
      
      {profile?.user_id ? (
        <ClientReservationsList clientId={profile.user_id} />
      ) : (
        <p>Chargement des réservations...</p>
      )}
    </div>
  );

  const renderTripsSearch = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Rechercher des transporteurs</h2>
        <p className="text-muted-foreground">Trouvez le transporteur idéal pour votre expédition</p>
      </div>
      <TripsList onSelectTrip={(trip) => {
        console.log("Selected trip:", trip);
      }} />
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mes statistiques</h2>
        <p className="text-muted-foreground">Analyse de votre utilisation de la plateforme</p>
      </div>
      <AdvancedStats userType="client" />
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Mon profil</CardTitle>
          <CardDescription>Gérez vos informations personnelles</CardDescription>
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
              <p className="text-muted-foreground">
                {profile?.is_verified ? "Vérifié" : "En attente de vérification"}
              </p>
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

export default ClientDashboard;