import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import goColisLogo from "@/assets/gocolis-logo.png";

const Footer = () => {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <img src={goColisLogo} alt="GoColis" className="h-10 w-10 filter invert" />
              <span className="text-2xl font-bold">GoColis</span>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              De porte à porte, partout dans le monde. La solution de confiance pour vos expéditions entre le Maroc et le Sénégal.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-primary-foreground/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Services</h3>
            <ul className="space-y-3 text-primary-foreground/80">
              <li><a href="#" className="hover:text-accent transition-colors">Expédition express</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Transport sécurisé</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Suivi temps réel</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Assurance colis</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Support</h3>
            <ul className="space-y-3 text-primary-foreground/80">
              <li><a href="#" className="hover:text-accent transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Conditions d'utilisation</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Nous contacter</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Contact</h3>
            <div className="space-y-4 text-primary-foreground/80">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-accent" />
                <span>contact@gocolis.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-accent" />
                <span>+212 6 XX XX XX XX</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-accent" />
                <span>Casablanca, Maroc</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/70">
          <p>&copy; 2024 GoColis. Tous droits réservés. De porte à porte, partout dans le monde.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;