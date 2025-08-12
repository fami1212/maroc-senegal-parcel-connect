import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Truck, DollarSign, Clock, MapPin, Calendar, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";

const TransporteurDashboard = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Handle tab from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const mockTrips = [
    {
      id: "1",
      route: "Casablanca → Dakar",
      status: "disponible",
      departDate: "2024-01-20",
      capacity: "15 kg disponible",
      price: "25 MAD/kg",
      reservations: 3
    },
    {
      id: "2",
      route: "Rabat → Thiès",
      status: "en_cours",
      departDate: "2024-01-18",
      capacity: "Complet",
      price: "20 MAD/kg",
      reservations: 8
    }
  ];

  const mockEarnings = [
    {
      month: "Décembre 2023",
      amount: "2,450 MAD",
      trips: 12,
      rating: 4.9
    },
    {
      month: "Novembre 2023",
      amount: "1,890 MAD",
      trips: 8,
      rating: 4.8
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disponible":
        return <Badge className="bg-secondary text-secondary-foreground">Disponible</Badge>;
      case "en_cours":
        return <Badge variant="secondary">En cours</Badge>;
      case "complete":
        return <Badge variant="outline">Terminé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bonjour {profile?.first_name} !
          </h1>
          <p className="text-muted-foreground">
            Gérez vos trajets et maximisez vos revenus
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="trips">Mes trajets</TabsTrigger>
            <TabsTrigger value="earnings">Revenus</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

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

            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Proposez un nouveau trajet ou gérez vos réservations
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Button className="h-24 flex-col space-y-2" variant="outline">
                  <Plus className="h-6 w-6" />
                  <span>Nouveau trajet</span>
                </Button>
                
                <Button className="h-24 flex-col space-y-2" variant="outline">
                  <Calendar className="h-6 w-6" />
                  <span>Gérer réservations</span>
                </Button>
              </CardContent>
            </Card>

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

          <TabsContent value="trips" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Mes trajets</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau trajet
              </Button>
            </div>

            <div className="space-y-4">
              {mockTrips.map((trip) => (
                <Card key={trip.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{trip.route}</h3>
                          {getStatusBadge(trip.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(trip.departDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Truck className="h-4 w-4 mr-1" />
                            {trip.capacity}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{trip.price}</p>
                        <p className="text-sm text-muted-foreground">
                          {trip.reservations} réservations
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

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
                          <p className="text-sm text-muted-foreground">
                            {earning.trips} trajets • Note: {earning.rating}
                          </p>
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
                    <div className="flex justify-between">
                      <span>Total des revenus</span>
                      <span className="font-semibold">8,940 MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trajets terminés</span>
                      <span className="font-semibold">32</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux de satisfaction</span>
                      <span className="font-semibold">98%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clients réguliers</span>
                      <span className="font-semibold">15</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mon profil transporteur</CardTitle>
                <CardDescription>
                  Gérez vos informations et documents de vérification
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
                    <div className="flex items-center space-x-2">
                      {profile?.is_verified ? (
                        <Badge className="bg-secondary text-secondary-foreground">Vérifié</Badge>
                      ) : (
                        <Badge variant="outline">En attente</Badge>
                      )}
                    </div>
                  </div>
                  
                  {!profile?.is_verified && (
                    <div className="p-4 bg-accent rounded-lg">
                      <h4 className="font-medium mb-2">Documents requis pour la vérification</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Pièce d'identité ou passeport</li>
                        <li>• Permis de conduire</li>
                        <li>• Certificat d'immatriculation du véhicule</li>
                        <li>• Assurance véhicule</li>
                      </ul>
                      <Button className="mt-3" size="sm">
                        Télécharger documents
                      </Button>
                    </div>
                  )}
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