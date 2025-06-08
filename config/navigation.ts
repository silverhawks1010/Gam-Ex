import { FaHome, FaBook, FaListOl, FaGamepad } from "react-icons/fa";
import React from "react";

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
      icon: React.createElement(FaHome),
    },
    {
      title: "Bibliothèque",
      href: "/library",
      icon: React.createElement(FaBook),
    },
    {
      title: "Tier List",
      href: "/tier-list",
      icon: React.createElement(FaListOl),
    },
    {
      title: "Jeux",
      href: "/guess-the-game",
      icon: React.createElement(FaGamepad),
    },
  ],
  auth: {
    login: {
      title: "Connexion",
      href: "/auth/login",
    },
  },
} as const

export type SiteConfig = typeof siteConfig 