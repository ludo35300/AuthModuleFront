import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';

export const authRoutes: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    {
        path: 'home',
        component: Home,
        canActivate: [authGuard],
    },
];