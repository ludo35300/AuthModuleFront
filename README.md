AuthModuleFront
[
[
[

Module d'authentification Angular 21 réutilisable
Sécurité maximale : Cookies HttpOnly + CSRF double-submit (pas de localStorage !)

✨ Fonctionnalités
Fonctionnalité	Statut
Login/Register/Logout/Refresh	✅
Guards Angular (routes protégées)	✅
Signals réactifs (Angular 21)	✅
Configuration injectée	✅
Cache intelligent /me	✅
Standalone components	✅
HttpOnly cookies + CSRF	✅
Responsive + i18n prêt	✅
🚀 Installation (2 minutes)
bash
# 1. Installer la lib
npm install @ludo35300/auth-module-front

# 2. Dans app.config.ts
import { provideAuth } from '@ludo35300/auth-module-front';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    provideAuth({
      apiPrefix: 'http://localhost:5000'  // Votre Flask backend
    })
  ]
};
🔧 Configuration Avancée
typescript
provideAuth({
  apiPrefix: 'https://mon-api.com/api',  // Backend URL
  csrf: {
    headerName: 'X-CSRF-TOKEN',
    accessCookieName: 'csrf_access_token',
    refreshCookieName: 'csrf_refresh_token'
  },
  endpoints: {
    login: '/auth/login',
    me: '/me',
    refresh: '/auth/refresh'
  }
});
📖 Utilisation Rapide
1. Login Component
typescript
import { AuthService } from '@ludo35300/auth-module-front';

@Component({...})
export class LoginComponent {
  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.auth.loginOnlyHttp(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => console.error('Login failed')
    });
  }
}
2. Route Protégée (Guard)
typescript
const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [() => inject(AuthService).isAuthenticated()],
    component: DashboardComponent
  }
];
3. Template (Signals)
xml
@if (authService.isAuthenticatedSignal()) {
  <span>👋 Bienvenue !</span>
  <button (click)="authService.logoutHttp().subscribe()">Logout</button>
} @else {
  <app-login-form></app-login-form>
}
🛠 Backend Flask (Endpoints Requis)
python
@app.route('/auth/login', methods=['POST'])
def login():
    # Vérifier email/password
    response = jsonify({"ok": True})
    response.set_cookie('access_token', jwt_token, httponly=True, secure=True)
    response.set_cookie('csrf_access_token', csrf_token, httponly=False)
    return response

@app.route('/me')
@jwt_required()
def me():
    return jsonify({"id": 1, "email": current_user.email})
🎯 Test Local
bash
git clone https://github.com/ludo35300/AuthModuleFront.git
cd AuthModuleFront
npm install
ng serve          # Frontend: http://localhost:4200
# Backend Flask séparé sur port 5000
📁 Architecture du Projet
text
src/
├── app/
│   ├── auth/                 # Service + Interceptor CSRF
│   │   ├── auth.service.ts
│   │   ├── credentials-interceptor.ts
│   │   └── auth.config.ts
│   ├── core/                 # Guards
│   └── shared/
├── models/                   # Interfaces TS typées
└── app.config.ts            # Bootstrap standalone
🔒 Sécurité (Production Ready)
Menace	Protection
XSS	HttpOnly cookies (non lisibles JS)
CSRF	Double-submit (cookie + header)
Token Leak	Pas de localStorage/sessionStorage
Session Fixation	Refresh token rotation
MITM	Cookies secure=True (HTTPS)
📦 Publication npm
bash
# 1. Build lib
npm run build:lib

# 2. Login npm
npm login

# 3. Publier
npm publish dist/auth-module-front
🤝 Contribution
bash
git clone https://github.com/ludo35300/AuthModuleFront.git
npm install
npm run lint
npm test
npm run build:lib
📄 License
MIT License - Voir LICENSE

Auteur : Ludovic (ludo35300)
Stack : Angular 21 + TypeScript strict + Flask JWT + PostgreSQL
🚀 Prêt pour la production !

⭐ N'oubliez pas de star si utile ⭐