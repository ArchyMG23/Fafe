# FAFE Platform

La plateforme numérique officielle du FAFE (Forum Africain des Femmes Entrepreneures) pour connecter, accompagner et valoriser les femmes entrepreneures à travers l'Afrique.

## Architecture

Ce projet est une application full-stack utilisant :
- **Frontend** : React avec Vite et Tailwind CSS.
- **Backend** : Express.js (TypeScript).
- **Base de données / Auth** : Firebase (Firestore).
- **IA** : Intégration de l'API Gemini (Server-side).

## Prérequis

- Node.js (v20+ recommandé)
- npm

## Installation

```bash
# Installer les dépendances
npm install
```

## Développement

Pour lancer le serveur de développement (mode full-stack) :

```bash
npm run dev
```

## Production

Pour compiler et lancer l'application en production :

```bash
# Build
npm run build

# Start
npm run start
```

## Configuration

Assurez-vous de définir les variables d'environnement nécessaires dans un fichier `.env` (basé sur `.env.example`).
