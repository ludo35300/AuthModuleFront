# AuthModuleFront

Module d'authentification Angular 21 complet et modulaire avec support des Cookies HttpOnly, CSRF protection et Signals réactifs.

## 📋 Vue d'ensemble

Ce projet est une application frontend Angular standalone complète intégrant un système d'authentification sécurisé avec :

- **Login/Register** : Pages complètes d'authentification
- **Gestion des sessions** : Refresh token + Logout
- **Récupération mot de passe** : Forgot password + Reset password  
- **Routes protégées** : Guards Angular pour contrôler l'accès
- **Sécurité maximale** : Cookies HttpOnly + CSRF double-submit
- **Signals réactifs** : State management moderne avec Angular 21

## ✨ Fonctionnalités principales

| Fonctionnalité | Statut |
|---|---|
| Login/Register/Logout | ✅ |
| Routes protégées (Guards) | ✅ |
| Tokens refresh automatique | ✅ |
| Signals réactifs (Angular 21) | ✅ |
| HttpOnly Cookies + CSRF | ✅ |
| Interceptors HTTP | ✅ |
| Validateurs personnalisés | ✅ |
| Pages responsive | ✅ |

## 📁 Architecture du projet

```
src/
├── app/
│   ├── auth-lib/                    # Librairie d'authentification réutilisable
│   │   ├── services/
│   │   │   └── auth.service.ts     # Service principal Auth
│   │   ├── guards/
│   │   │   ├── auth.guard.ts       # Protège les routes authentifiées
│   │   │   └── guest-guard.ts      # Bloque les utilisateurs authentifiés
│   │   ├── interceptors/
│   │   │   ├── credentials-interceptor.ts   # Gère les cookies
│   │   │   └── error-interceptor.ts        # Traite les erreurs HTTP
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── models/
│   │   │   └── auth.model.ts
│   │   ├── validators/
│   │   │   └── password-match.validator.ts
│   │   ├── auth.config.ts          # Configuration
│   │   ├── provide-auth.ts         # Providers
│   │   └── public-api.ts           # Exports publics
│   ├── pages/
│   │   └── home/                   # Page d'accueil
│   ├── app.config.ts               # Configuration app
│   ├── app.routes.ts               # Routes
│   └── app.ts                      # Composant principal
├── styles.scss                     # Styles globaux
└── main.ts                         # Point d'entrée
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- Angular 21+
- npm ou yarn

### Installation

```bash
# 1. Cloner le projet
git clone <repository-url>
cd AuthModuleFront

# 2. Installer les dépendances
npm install

# 3. Configuration du proxy (optionnel)
# Vérifier proxy.conf.json pour l'API backend
```

### Démarrage du serveur de développement

```bash
npm start
# ou
ng serve
```

L'application sera accessible à `http://localhost:4200`

## 🔧 Configuration

### Configuration de l'authentification

Dans [src/app/app.config.ts](src/app/app.config.ts) :

```typescript
import { provideAuth } from './app/auth-lib/provide-auth';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... autres providers
    provideAuth({
      apiPrefix: 'http://localhost:5000', // URL de votre backend
      // Configuration optionnelle détaillée dans auth.config.ts
    })
  ]
};
```

### Variables d'environnement

Créer un fichier `.env` (optionnel) :

```
NG_APP_API_PREFIX=http://localhost:5000
NG_APP_SECURE_COOKIES=false
```

## 📚 Utilisation

### Utiliser le service d'authentification

```typescript
import { AuthService } from './app/auth-lib/services/auth.service';

@Component({...})
export class MyComponent {
  constructor(private authService: AuthService) {}

  login() {
    this.authService.login(email, password).subscribe({
      next: () => console.log('Connecté !'),
      error: (err) => console.error('Erreur:', err)
    });
  }
}
```

### Protéger une route

Dans [src/app/app.routes.ts](src/app/app.routes.ts) :

```typescript
import { authGuard } from './app/auth-lib/guards/auth.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  }
];
```

### Afficher l'état d'authentification dans les templates

```html
@if (authService.isAuthenticated()) {
  <p>Bienvenue {{ authService.currentUser()?.username }}</p>
  <button (click)="authService.logout().subscribe()">
    Déconnexion
  </button>
} @else {
  <app-login-form></app-login-form>
}
```

## 🔒 Sécurité

- **HttpOnly Cookies** : Les tokens sont stockés dans des cookies inaccessibles au JavaScript
- **CSRF Protection** : Double-submit token mechanism
- **Secured Headers** : Tokens envoyés via headers HTTP
- **Pas de localStorage** : Aucune donnée sensible en mémoire JavaScript

## 🧪 Tests

### Exécuter les tests unitaires

```bash
npm test
# ou
ng test
```

### Exécuter les tests e2e

```bash
npm run e2e
# ou
ng e2e
```

### Coverage

```bash
ng test --code-coverage
```

## 🏗️ Build pour la production

```bash
npm run build
# ou
ng build --configuration production
```

Les fichiers compilés seront dans le dossier `dist/`

## 📦 Dépendances principales

- **Angular 21+** : Framework frontend
- **TypeScript** : Langage typé
- **SCSS** : Préprocesseur CSS
- **RxJS** : Programmation réactive

Voir [package.json](package.json) pour la liste complète.

## 🤝 Contribution

Les contributions sont bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue GitHub
- Contacter l'auteur

---

**Fait par Ludo35300 (ludo35300)**