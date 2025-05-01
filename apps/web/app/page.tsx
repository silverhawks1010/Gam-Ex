import {Navbar} from "@/components/navbar"
import { Banner } from "@/components/banner"
import { Features } from "@/components/features"
import { Upcoming } from "@/components/upcoming"
import { TopGames } from "@/components/top-games"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  return (
    <main>
      <Navbar />
      <Banner />
      <Features />
      <Upcoming />
      <TopGames />
      <Testimonials />
      <Footer />
    </main>
  )
}
