import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin, Clock, DollarSign, Star, Search, Plus, Filter } from "lucide-react";
import ExpeditionsList from "@/components/ExpeditionsList";
import TripsList from "@/components/TripsList";
import NewExpeditionForm from "@/components/forms/NewExpeditionForm";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";

const ClientDashboard = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewExpeditionForm, setShowNewExpeditionForm] = useState(false);

  // Handle tab from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const mockShipments = [
    {
      id: "1",
      destination: "Dakar, Sénégal",
      status: "en_transit",
      transporteur: "Ahmed Diallo",
      price: "150 MAD",
      createdAt: "2024-01-15",
      estimatedDelivery: "2024-01-18"
    },
    {
      id: "2",
      destination: "Thiès, Sénégal",
      status: "livre",
      transporteur: "Fatou Seck",
      price: "120 MAD",
      createdAt: "2024-01-10",
      estimatedDelivery: "2024-01-13"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "en_transit":
        return <Badge variant="secondary">En transit</Badge>;
      case "livre":
        return <Badge className="bg-secondary text-secondary-foreground">Livré</Badge>;
      case "en_attente":
        return <Badge variant="outline">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 bg-gradient-subtle min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bonjour {profile?.first_name} !
          </h1>
          <p className="text-muted-foreground">
            Gérez vos expéditions et suivez vos colis en temps réel
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="shipments">Mes expéditions</TabsTrigger>
            <TabsTrigger value="search">Rechercher GP</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total expéditions</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 ce mois</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En transit</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Actuellement</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Économisé</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">450 MAD</div>
                  <p className="text-xs text-muted-foreground">vs livraison classique</p>
                </CardContent>
              </Card>

              <Card>
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

            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Commencez votre prochaine expédition ou trouvez un transporteur
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Button 
                  className="h-24 flex-col space-y-2" 
                  variant="outline"
                  onClick={() => setActiveTab("shipments")}
                >
                  <Plus className="h-6 w-6" />
                  <span>Nouvelle expédition</span>
                </Button>
                
                <Button 
                  className="h-24 flex-col space-y-2" 
                  variant="outline"
                  onClick={() => setActiveTab("search")}
                >
                  <Search className="h-6 w-6" />
                  <span>Rechercher transporteurs</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipments" className="space-y-6">
            {showNewExpeditionForm ? (
              <NewExpeditionForm 
                onSuccess={() => {
                  setShowNewExpeditionForm(false);
                  // Optionally refresh the expeditions list
                }}
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
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Rechercher des transporteurs</h2>
                <p className="text-muted-foreground">Trouvez le transporteur idéal pour votre expédition</p>
              </div>
              
              <TripsList onSelectTrip={(trip) => {
                // TODO: Implement trip selection logic for booking
                console.log("Selected trip:", trip);
              }} />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mon profil</CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles
                </CardDescription>
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
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ClientDashboard;