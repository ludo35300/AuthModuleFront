import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = signal('');
  password = signal('');

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  login() {
    this.auth.login(this.email(), this.password());   // Lecture avec les parenthèses () pour signals
    this.router.navigate(['/home']);
  }
}
