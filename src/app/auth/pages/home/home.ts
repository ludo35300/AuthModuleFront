import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  // Injections des dépendances
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  
  readonly isAuthenticated = this.auth.isAuthenticatedSignal;

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
