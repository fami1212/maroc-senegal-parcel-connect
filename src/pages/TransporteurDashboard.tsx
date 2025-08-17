import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, MapPin, DollarSign, Star, Calendar, Plus } from "lucide-react";
import TripsList from "@/components/TripsList";
import NewTripForm from "@/components/forms/NewTripForm";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import ReservationsList from "@/components/ReservationsList";

const TransporteurDashboard = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewTripForm, setShowNewTripForm] = useState(false);

  useEffect(() => {
    const tabFromUrl = new URLSearchParams(location.search).get("tab");
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [location.search]);

  const mockTrips = [
    { id: "1", route: "Casablanca → Dakar", status: "disponible", departDate: "2024-01-20", capacity: "15 kg disponible", price: "25 MAD/kg", reservations: 3 },
    { id: "2", route: "Rabat → Thiès", status: "en_cours", departDate: "2024-01-18", capacity: "Complet", price: "20 MAD/kg", reservations: 8 },
  ];

  const mockEarnings = [
    { month: "Décembre 2023", amount: "2,450 MAD", trips: 12, rating: 4.9 },
    { month: "Novembre 2023", amount: "1,890 MAD", trips: 8, rating: 4.8 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disponible": return <Badge className="bg-secondary text-secondary-foreground">Disponible</Badge>;
      case "en_cours": return <Badge variant="secondary">En cours</Badge>;
      case "complete": return <Badge variant="outline">Terminé</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 bg-gradient-subtle min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bonjour {profile?.first_name} !
          </h1>
          <p className="text-muted-foreground">Gérez vos trajets et maximisez vos revenus</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="trips">Mes trajets</TabsTrigger>
            <TabsTrigger value="reservations">Réservations</TabsTrigger>
            <TabsTrigger value="earnings">Revenus</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          {/* Aperçu */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trajets actifs</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Ce mois</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus du mois</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,450 MAD</div>
                  <p className="text-xs text-muted-foreground">+15% vs mois dernier</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Colis transportés</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-muted-foreground">Ce mois</p>
                </CardContent>
              </Card>
              <Card>
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

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>Proposez un nouveau trajet ou gérez vos réservations</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Button className="h-24 flex-col space-y-2" variant="outline" onClick={() => setActiveTab("trips")}>
                  <Plus className="h-6 w-6" />
                  <span>Nouveau trajet</span>
                </Button>
                <Button className="h-24 flex-col space-y-2" variant="outline" onClick={() => setActiveTab("reservations")}>
                  <Calendar className="h-6 w-6" />
                  <span>Gérer réservations</span>
                </Button>
              </CardContent>
            </Card>

            {/* Prochains trajets */}
            <Card>
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
          </TabsContent>

          {/* Mes trajets */}
          <TabsContent value="trips" className="space-y-6">
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
          </TabsContent>

          {/* Mes réservations */}
          <TabsContent value="reservations" className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Mes réservations</h2>
            {profile?.id ? (
              <ReservationsList transporteurId={profile.id} />
            ) : (
              <p>Chargement des réservations...</p>
            )}
          </TabsContent>

          {/* Revenus */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenus récents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockEarnings.map((earning, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{earning.month}</p>
                          <p className="text-sm text-muted-foreground">{earning.trips} trajets • Note: {earning.rating}</p>
                        </div>
                        <p className="font-semibold text-lg">{earning.amount}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between"><span>Total des revenus</span><span className="font-semibold">8,940 MAD</span></div>
                    <div className="flex justify-between"><span>Trajets terminés</span><span className="font-semibold">32</span></div>
                    <div className="flex justify-between"><span>Taux de satisfaction</span><span className="font-semibold">98%</span></div>
                    <div className="flex justify-between"><span>Clients réguliers</span><span className="font-semibold">15</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
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
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default TransporteurDashboard;
