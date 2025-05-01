import { Library, ListChecks, Share2, Trophy } from "lucide-react"

const features = [
  {
    icon: Library,
    title: "Bibliothèque Intelligente",
    description: "Organisez votre collection de jeux avec des filtres avancés et une recherche intelligente."
  },
  {
    icon: ListChecks,
    title: "Suivi de Progression",
    description: "Gardez une trace de vos jeux terminés, en cours et à faire avec des statistiques détaillées."
  },
  {
    icon: Share2,
    title: "Partage Social",
    description: "Partagez votre collection et vos avis avec la communauté des gamers."
  },
  {
    icon: Trophy,
    title: "Système de Succès",
    description: "Débloquez des succès en complétant des objectifs et montez en niveau."
  }
]

export function Features() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container px-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter mb-4">
            Fonctionnalités Principales
          </h2>
          <p className="text-muted-foreground mx-auto max-w-[700px]">
            Découvrez tous les outils dont vous avez besoin pour gérer votre collection de jeux comme un pro.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}