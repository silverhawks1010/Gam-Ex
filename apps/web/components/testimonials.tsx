"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"

const testimonials = [
  {
    name: "Marie Laurent",
    avatar: "/avatars/marie.jpg",
    role: "Streameuse Gaming",
    content: "Gam'Ex est devenu mon outil principal pour gérer ma collection. Le suivi des jeux en cours n'a jamais été aussi simple."
  },
  {
    name: "Lucas Bernard",
    avatar: "/avatars/lucas.jpg",
    role: "YouTubeur Gaming",
    content: "Une solution élégante qui répond parfaitement à mes besoins. L'équipe adore l'utiliser au quotidien."
  },
  {
    name: "Sarah Martin",
    avatar: "/avatars/sarah.jpg",
    role: "Chroniqueuse JV",
    content: "Gam'Ex a révolutionné la façon dont je gère ma ludothèque. L'interface est super intuitive !"
  },
  {
    name: "Thomas Dubois",
    avatar: "/avatars/thomas.jpg",
    role: "Collectionneur",
    content: "Un outil indispensable pour tout gamer qui veut bien gérer sa collection."
  },
  {
    name: "Julie Moreau",
    avatar: "/avatars/julie.jpg",
    role: "Game Designer",
    content: "Je peux enfin organiser ma bibliothèque de jeux de manière efficace."
  },
  {
    name: "Antoine Petit",
    avatar: "/avatars/antoine.jpg",
    role: "Speedrunner",
    content: "Le tracking de progression est parfait pour suivre mes performances."
  }
]

const duplicatedTestimonials = [...testimonials, ...testimonials]

export function Testimonials() {
  const [position, setPosition] = useState(0)

  useEffect(() => {
    const animation = () => {
      setPosition(prev => {
        const newPosition = prev - 0.5
        if (newPosition < -(testimonials.length * 100)) {
          return 0
        }
        return newPosition
      })
    }

    const interval = setInterval(animation, 30)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 overflow-hidden">
      <div className="container px-20 pl-20 pr-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter mb-4 text-foreground">
            Ils nous font confiance
          </h2>
          <p className="text-foreground mx-auto max-w-[700px]">
            Découvrez ce que disent nos utilisateurs de leur expérience avec Gam'Ex.
          </p>
        </div>
        <div className="relative overflow-hidden">
          <div 
            className="flex gap-6 transition-transform"
            style={{ 
              transform: `translateX(${position}px)`,
              width: 'fit-content'
            }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="w-[300px] flex-shrink-0 bg-muted border-zinc-800 rounded-xl overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-10 w-10 border-2 border-zinc-800">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                      <p className="text-sm text-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-foreground text-sm">{testimonial.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}