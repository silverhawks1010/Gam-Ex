import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import Image from "next/image"
import banner from "@workspace/ui/images/banner.png"

export function Banner() {
  return (
    <section className="bg-background min-h-[600px] flex items-center">
      <div className="container pl-20 pr-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Colonne de gauche - Contenu */}
        <div className="flex flex-col justify-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Organisez votre{" "}
            <span className="text-primary">collection</span>{" "}
            de jeux comme un{" "}
            <span className="text-primary">pro</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-lg">
            Cataloguez, suivez et partagez votre bibliothèque de jeux vidéo.
            Gardez une trace de vos aventures et découvrez de nouveaux horizons gaming.
          </p>

          <div className="pt-4">
            <Button 
              asChild 
              size="lg" 
              variant="default"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/commencer">
                Commencer l'aventure
              </Link>
            </Button>
          </div>
        </div>

        {/* Colonne de droite - Image */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
            <Image
              src={banner}
              alt="Bannière Gam'Ex"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
} 