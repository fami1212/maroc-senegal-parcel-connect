import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Plane, Truck } from "lucide-react";
import heroImage from "@/assets/hero-shipping.png";

const HeroSection = () => {
  return (
    <section className="pt-24 pb-16 bg-gradient-subtle min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Expédiez vos{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  colis
                </span>{" "}
                entre le Maroc et le Sénégal
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                De porte à porte, partout dans le monde. Connectez-vous avec des transporteurs de confiance pour vos envois internationaux.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                Envoyer un colis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Devenir transporteur
              </Button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Suivi en temps réel</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Assurance incluse</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <img 
              src={heroImage} 
              alt="Expédition de colis internationale" 
              className="w-full h-auto rounded-2xl shadow-elegant animate-float"
            />
            <div className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground p-4 rounded-xl shadow-glow animate-float" style={{ animationDelay: '2s' }}>
              <Package className="h-8 w-8" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground p-4 rounded-xl shadow-glow animate-float" style={{ animationDelay: '4s' }}>
              <Plane className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;