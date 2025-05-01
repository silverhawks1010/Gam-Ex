# Gam'Ex - Gestionnaire de Bibliothèque de Jeux

Une application moderne pour gérer votre collection de jeux vidéo, construite avec Next.js, React Native, et Tamagui.

## Technologies Utilisées

- 🏗️ **Monorepo** - Turborepo
- 🎨 **UI** - Tamagui, shadcn/ui
- 🔄 **État** - Zustand, TanStack Query
- 🌐 **API** - RAWG API
- 🗃️ **Base de données** - Supabase
- 🌍 **i18n** - react-i18next
- 💳 **Paiements** - Stripe

## Structure du Projet

```
.
├── apps/
│   ├── web/          # Application Next.js
│   └── mobile/       # Application React Native (Expo)
└── packages/
    ├── ui/           # Composants UI partagés
    ├── api/          # Intégration RAWG API
    ├── database/     # Couche Supabase
    └── config/       # Configurations partagées
```

## Démarrage

1. Installer les dépendances :
   ```bash
   pnpm install
   ```

2. Configurer les variables d'environnement :
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

3. Démarrer l'application web :
   ```bash
   pnpm dev
   ```

## Fonctionnalités

- 📚 Gestion de bibliothèque de jeux
- 🎮 Intégration RAWG pour les données de jeux
- 👤 Authentification avec Supabase
- 🌓 Mode sombre/clair
- 📱 Design responsive
- 🌍 Internationalisation
- 💳 Abonnements premium

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'feat: add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. 