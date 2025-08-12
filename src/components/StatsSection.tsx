const stats = [
  {
    number: "10,000+",
    label: "Colis livrés",
    description: "avec succès entre le Maroc et le Sénégal"
  },
  {
    number: "500+",
    label: "Transporteurs",
    description: "vérifiés et notés par la communauté"
  },
  {
    number: "98%",
    label: "Satisfaction",
    description: "de nos utilisateurs recommandent GoColis"
  },
  {
    number: "24h",
    label: "Support",
    description: "disponible 7j/7 pour vous accompagner"
  }
];

const StatsSection = () => {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Ils nous font{" "}
            <span className="text-accent">
              confiance
            </span>
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui font confiance à GoColis pour leurs expéditions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center space-y-4 p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm hover:bg-primary-foreground/20 transition-all duration-300"
            >
              <div className="text-4xl lg:text-5xl font-bold text-accent">
                {stat.number}
              </div>
              <h3 className="text-xl font-semibold">
                {stat.label}
              </h3>
              <p className="text-primary-foreground/70 text-sm leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;