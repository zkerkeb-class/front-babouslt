# Application Expo - Interface Admin

Cette application mobile Expo permet aux administrateurs de surveiller les services et consulter les statistiques de l'application.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Démarrer l'application
npm start
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les URLs de vos services :

```env
AUTH_API_URL=http://localhost:3001/api/
PAYMENT_API_URL=http://localhost:3002/api/
BDD_API_URL=http://localhost:3003/api/
IA_API_URL=http://localhost:3004/api/
```

### Configuration par défaut

Si vous n'avez pas de fichier `.env`, l'application utilise les URLs par défaut définies dans `config/env.ts`.

## 📱 Fonctionnalités

### Page Admin

La page admin est accessible uniquement aux utilisateurs avec le rôle `isAdmin: true`.

#### Onglet "Métriques" 📊

- **Surveillance des services** : Vérifie l'état de tous les services
- **Temps de réponse** : Mesure la latence de chaque service
- **Statut en temps réel** : Indique si les services sont opérationnels

#### Onglet "Statistiques" 📈

- **Utilisateurs** : Nombre total, premium vs gratuits, nouveaux utilisateurs
- **Analyses médicales** : Total, dernières 24h, évolution sur 7 jours
- **Abonnements** : Actifs, par statut, nouveaux abonnements

## 🔧 Services Requis

L'application nécessite que les services suivants soient en cours d'exécution :

1. **AuthService** (port 3001) - Authentification et statistiques
2. **PaymentService** (port 3002) - Gestion des paiements
3. **IAService** (port 3004) - Intelligence artificielle
4. **BDDService** (port 3003) - Base de données

## 📊 API de Statistiques

L'application récupère les données depuis l'endpoint `/stats/` de l'AuthService :

- `GET /stats/` - Toutes les statistiques
- `GET /stats/users` - Statistiques utilisateurs
- `GET /stats/analyses` - Statistiques analyses
- `GET /stats/subscriptions` - Statistiques abonnements

## 🔐 Authentification

L'application utilise JWT pour l'authentification. Le token est stocké dans AsyncStorage et envoyé automatiquement avec chaque requête.

## 🎨 Interface

- **Design moderne** avec Tailwind CSS
- **Interface responsive** adaptée aux mobiles
- **Pull-to-refresh** pour actualiser les données
- **Gestion d'erreurs** avec messages informatifs
- **Indicateurs visuels** pour les statuts

## 🚨 Dépannage

### Erreur de navigation

- Vérifiez que tous les services sont démarrés
- Redémarrez l'application Expo
- Vérifiez la configuration des routes

### Erreur de connexion aux services

- Vérifiez que tous les services sont démarrés
- Contrôlez les URLs dans la configuration
- Assurez-vous que les ports sont accessibles

### Erreur d'authentification

- Vérifiez que l'utilisateur a le rôle `isAdmin: true`
- Contrôlez que le token JWT est valide
- Reconnectez-vous si nécessaire

### Données manquantes

- Vérifiez que l'AuthService copy est configuré avec les bonnes routes
- Contrôlez les permissions d'accès aux statistiques
- Vérifiez la connexion à la base de données

## 📱 Développement

```bash
# Mode développement
npm run dev

# Build pour production
npm run build

# Linting
npm run lint

# Formatage
npm run format
```

## 🏗️ Architecture

```
my-expo-app/
├── app/                    # Pages de l'application
│   └── (tabs)/
│       └── admin.tsx      # Page admin avec onglets
├── components/
│   ├── api/               # Services API
│   │   └── stats.ts       # API des statistiques
│   └── StatsTab.tsx       # Composant statistiques
├── config/
│   └── env.ts             # Configuration des URLs
└── README.md              # Documentation
```

## 🔧 Configuration des URLs

Le fichier `config/env.ts` contient les URLs par défaut :

```typescript
export const ENV_CONFIG = {
  AUTH_API_URL: process.env.AUTH_API_URL || 'http://localhost:3001/api/',
  PAYMENT_API_URL: process.env.PAYMENT_API_URL || 'http://localhost:3002/api/',
  BDD_API_URL: process.env.BDD_API_URL || 'http://localhost:3003/api/',
  IA_API_URL: process.env.IA_API_URL || 'http://localhost:3004/api/',
};
```

Ces URLs peuvent être surchargées par un fichier `.env`.
