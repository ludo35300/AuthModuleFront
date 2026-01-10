import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { guestGuard } from './guards/guest-guard';

export const authRoutes: Routes = [
    { path: 'login', component: Login, title: 'Connexion' , canActivate: [guestGuard],},
    { path: 'register', component: Register, title: 'Inscription', canActivate: [guestGuard], },
    { path: 'home', component: Home, title: 'Accueil', canActivate: [authGuard], }
];