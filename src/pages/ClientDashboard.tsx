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
import DashboardStats from "@/components/DashboardStats";
import QuickActionsPanel from "@/components/QuickActionsPanel";
import RecentActivityFeed from "@/components/RecentActivityFeed";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

const ClientDashboard = () => {
  const { profile } = useAuth();
  const { t } = useTranslation();
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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-hero p-6 rounded-2xl text-white shadow-elegant">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t('dashboard.welcome')}, {profile?.first_name}! 👋
            </h1>
            <p className="text-white/90">
              Gérez vos expéditions et suivez vos envois facilement
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Package className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <DashboardStats userType="client" />

      {/* Quick Actions and Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        <QuickActionsPanel userType="client" onViewChange={setActiveView} />
        <RecentActivityFeed userType="client" />
      </div>
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