import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Plane, Truck } from "lucide-react";
import heroImage from "@/assets/hero-shipping.png";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="pt-24 pb-16 bg-gradient-subtle min-h-screen flex items-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-primary rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-secondary rounded-full opacity-10 blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-accent rounded-full text-accent-foreground text-sm font-medium shadow-button">
                🇲🇦 ⟷ 🇸🇳 Maroc - Sénégal
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Livraison rapide{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  entre communautés
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Connectez-vous avec des transporteurs sénégalais de confiance pour envoyer vos colis du Maroc vers le Sénégal. Rapide, sécurisé et abordable.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="delivery" size="xl" onClick={() => navigate("/auth")}>
                <Package className="mr-2 h-5 w-5" />
                Envoyer un colis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="xl" onClick={() => navigate("/auth")}>
                <Truck className="mr-2 h-5 w-5" />
                Devenir transporteur
              </Button>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 bg-secondary/10 p-4 rounded-xl border border-secondary/20">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-secondary">Suivi temps réel</span>
              </div>
              <div className="flex items-center space-x-3 bg-primary/10 p-4 rounded-xl border border-primary/20">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-primary">Paiement sécurisé</span>
              </div>
              <div className="flex items-center space-x-3 bg-accent/10 p-4 rounded-xl border border-accent/20">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-accent">Assurance incluse</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-gradient-card p-8 rounded-3xl shadow-float">
              <img 
                src={heroImage} 
                alt="Expédition de colis entre Maroc et Sénégal" 
                className="w-full h-auto rounded-2xl shadow-elegant"
              />
              
              {/* Floating status cards */}
              <div className="absolute -top-4 -right-4 bg-gradient-secondary text-secondary-foreground p-4 rounded-xl shadow-glow animate-float" style={{ animationDelay: '1s' }}>
                <Package className="h-6 w-6" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-gradient-primary text-primary-foreground p-4 rounded-xl shadow-glow animate-float" style={{ animationDelay: '2s' }}>
                <Plane className="h-6 w-6" />
              </div>
              
              <div className="absolute top-1/2 -right-8 bg-gradient-accent text-accent-foreground px-4 py-2 rounded-full shadow-glow animate-float text-sm font-semibold" style={{ animationDelay: '3s' }}>
                Livré en 3-5j
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;