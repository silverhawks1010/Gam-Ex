import Link from "next/link";
import Image from "next/image";
import { FaTwitter, FaFacebook, FaInstagram, FaDiscord } from "react-icons/fa";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="backdrop-blur-md bg-background/80 border-t border-border/60 shadow-inner rounded-t-2xl mt-24">
      <div className="w-full max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-12 justify-between items-center md:items-start">
          {/* Logo et Description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/icon-gamex.png"
                alt="GameX Logo"
                width={180}
                height={40}
                className="rounded-lg shadow-md"
              />
            </Link>
            <p className="mt-4 text-muted-foreground max-w-xs">
              Votre destination pour explorer, partager et discuter de vos jeux préférés.
            </p>
          </div>
          {/* Liens Utiles */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Liens Utiles</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/cgu" className="text-muted-foreground hover:text-primary transition-colors text-base">
                  Conditions Générales d'Utilisation
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="text-muted-foreground hover:text-primary transition-colors text-base">
                  Mentions Légales
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-base">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          {/* Réseaux Sociaux */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="font-semibold mb-4 text-lg">Suivez-nous</h3>
            <div className="flex space-x-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <FaTwitter size={32} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <FaFacebook size={32} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <FaInstagram size={32} />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <FaDiscord size={32} />
              </a>
            </div>
          </div>
        </div>
        {/* Copyright */}
        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground text-sm">
          <p>© {currentYear} GameX. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}; 