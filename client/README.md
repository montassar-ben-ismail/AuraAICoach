# AuraCoach AI

Client React + Vite + TypeScript réorganisé autour de `src/` avec un alias d'import `@`.

## Démarrage

1. Installer les dépendances : `npm install`
2. Configurer les variables d'environnement dans `.env`
3. Lancer le mode développement : `npm run dev`

## Variables d'environnement

- `PORT`
- `VITE_API_BASE_URL`
- `VITE_GOOGLE_CLIENT_ID`
- `GEMINI_API_KEY`

## Structure

- `src/components/` pour les composants réutilisables
- `src/pages/` pour les écrans
- `src/context/` pour les providers
- `src/services/` pour les appels API
- `src/types/` pour les types partagés
- `src/utils/` pour les utilitaires
