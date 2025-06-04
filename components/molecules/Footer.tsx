import Link from "next/link";
import Image from "next/image";
import { FaTwitter, FaFacebook, FaInstagram, FaDiscord } from "react-icons/fa";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 py-8 mt-16">
      <div className="container mx-auto px-5">
        <div className="flex flex-col md:flex-row gap-8 justify-evenly">
          {/* Logo et Description */}
          <div className="">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/icon-gamex.png"
                alt="GameX Logo"
                width={250}
                height={40}
                className="rounded-lg"
              />
            </Link>
            <p className="mt-4 text-muted-foreground">
              Votre destination pour explorer, partager et discuter de vos jeux préférés.
            </p>
          </div>

          {/* Liens Utiles */}
          <div>
            <h3 className="font-semibold mb-4">Liens Utiles</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/cgu" className="text-muted-foreground hover:text-primary">
                  Conditions Générales d'Utilisation
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="text-muted-foreground hover:text-primary">
                  Mentions Légales
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Réseaux Sociaux */}
          <div>
            <h3 className="font-semibold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <FaTwitter size={24} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <FaFacebook size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <FaInstagram size={24} />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <FaDiscord size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>© {currentYear} GameX. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}; 