export const siteConfig = {
  name: "GameX",
  logo: {
    src: "/images/icon-gamex.png",
    width: 150,
    height: 40,
  },
  mainNav: [
    {
      title: "Accueil",
      href: "/",
    },
    {
      title: "Bibliothèque",
      href: "/library",
    },
  ],
  auth: {
    login: {
      title: "Connexion",
      href: "/login",
    },
  },
} as const

export type SiteConfig = typeof siteConfig 