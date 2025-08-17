import { Button } from "@/components/ui/button";
import { ArrowRight, Package2, Truck, Search, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserTypesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Une solution pour{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              chacun
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Que vous souhaitiez envoyer un colis ou devenir transporteur, GoColis s'adapte à vos besoins.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          {/* Section Clients */}
          <div id="clients" className="bg-card p-10 rounded-3xl shadow-elegant hover:shadow-glow transition-all duration-300">
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="bg-secondary p-4 rounded-xl">
                  <Package2 className="h-10 w-10 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-foreground">Pour les clients</h3>
                  <p className="text-muted-foreground">Expédiez facilement vos colis</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Search className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Trouvez un transporteur</h4>
                    <p className="text-muted-foreground">Recherchez parmi nos transporteurs vérifiés selon vos critères de prix, date et mode de transport.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Package2 className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Décrivez votre colis</h4>
                    <p className="text-muted-foreground">Renseignez les détails de votre envoi : dimensions, poids, contenu et destination au Sénégal.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <DollarSign className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Payez en sécurité</h4>
                    <p className="text-muted-foreground">Paiement sécurisé avec suivi temps réel jusqu'à la livraison chez vos proches.</p>
                  </div>
                </div>
              </div>

              <Button variant="cta" size="lg" className="w-full" onClick={() => navigate("/auth")}>
                Envoyer un colis maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Section Transporteurs */}
          <div id="transporteurs" className="bg-card p-10 rounded-3xl shadow-elegant hover:shadow-glow transition-all duration-300">
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="bg-primary p-4 rounded-xl">
                  <Truck className="h-10 w-10 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-foreground">Pour les transporteurs</h3>
                  <p className="text-muted-foreground">Monétisez vos trajets</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Truck className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Proposez votre trajet</h4>
                    <p className="text-muted-foreground">Indiquez vos trajets Maroc-Sénégal et l'espace disponible dans votre véhicule.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Package2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Acceptez les colis</h4>
                    <p className="text-muted-foreground">Choisissez les colis que vous souhaitez transporter selon votre capacité et itinéraire.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <DollarSign className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Gagnez de l'argent</h4>
                    <p className="text-muted-foreground">Recevez vos paiements directement dans l'app après chaque livraison réussie.</p>
                  </div>
                </div>
              </div>

              <Button variant="hero" size="lg" className="w-full" onClick={() => navigate("/auth")}>
                Devenir transporteur
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserTypesSection;