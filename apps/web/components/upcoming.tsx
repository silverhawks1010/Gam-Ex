import { Badge } from "@workspace/ui/components/badge"
import { Calendar, Gamepad2, Users, Smartphone } from "lucide-react"

const upcomingFeatures = [
  {
    icon: Calendar,
    title: "Calendrier des Sorties",
    description: "Suivez les dates de sortie des jeux les plus attendus et créez des rappels personnalisés.",
    date: "Q1 2024"
  },
  {
    icon: Users,
    title: "Groupes de Joueurs",
    description: "Créez et rejoignez des groupes pour partager vos expériences et organiser des sessions de jeu.",
    date: "Q2 2024"
  },
  {
    icon: Gamepad2,
    title: "Intégration Steam",
    description: "Synchronisez automatiquement votre bibliothèque Steam avec votre collection Gam'Ex.",
    date: "Q2 2024"
  },
  {
    icon: Smartphone,
    title: "Application Mobile",
    description: "Accédez à votre collection depuis votre smartphone avec notre application native.",
    date: "Q3 2024"
  }
]

export function Upcoming() {
  return (
    <section className="py-20">
      <div className="container px-[15%]">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter mb-4">
            Nouveautés à Venir
          </h2>
          <p className="text-muted-foreground mx-auto max-w-[700px]">
            Découvrez les fonctionnalités excitantes que nous préparons pour améliorer votre expérience.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {upcomingFeatures.map((feature, index) => (
            <div 
              key={index}
              className="flex items-start p-6 bg-muted rounded-xl space-x-4"
            >
              <div className="p-2 bg-background rounded-full">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <Badge variant="secondary">{feature.date}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}