import { Shield, Clock, MapPin, CreditCard, Users, Star } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Livraison rapide",
    description: "Expédition express avec suivi en temps réel de votre colis jusqu'à destination."
  },
  {
    icon: Shield,
    title: "Sécurité garantie",
    description: "Vos colis sont assurés et nos transporteurs sont vérifiés et notés par la communauté."
  },
  {
    icon: MapPin,
    title: "Suivi géolocalisé",
    description: "Suivez votre colis en temps réel grâce à notre système de géolocalisation avancé."
  },
  {
    icon: CreditCard,
    title: "Paiement sécurisé",
    description: "Payez en toute sécurité avec nos partenaires de confiance : carte bancaire, mobile money."
  },
  {
    icon: Users,
    title: "Communauté de confiance",
    description: "Rejoignez une communauté de milliers d'utilisateurs satisfaits au Maroc et au Sénégal."
  },
  {
    icon: Star,
    title: "Service premium",
    description: "Support client 24/7 et garantie satisfaction pour une expérience exceptionnelle."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Pourquoi choisir{" "}
            <span className="bg-gradient-secondary bg-clip-text text-transparent">
              GoColis
            </span>
            ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nous révolutionnons l'expédition de colis entre le Maroc et le Sénégal avec une plateforme moderne, sécurisée et facile à utiliser.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-elegant transition-all duration-300 hover:scale-105 group"
            >
              <div className="bg-gradient-primary p-4 rounded-xl w-fit mb-6 group-hover:shadow-glow transition-all duration-300">
                <feature.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;