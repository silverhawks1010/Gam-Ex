import Image from "next/image";
import { Navbar } from "@/components/molecules/Navbar"

export default function Home() {
  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Contenu de la page d'accueil à venir */}
      </div>
    </main>
  );
}
