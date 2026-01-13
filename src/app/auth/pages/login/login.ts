import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faApple, faFacebookF, faGoogle } from '@fortawesome/free-brands-svg-icons';

import { AuthService } from '../../services/auth.service';
import { loginConfig } from './login.config';
import { appInfos } from '../../../app.config';
/**
 * Page de connexion.
 *
 * Responsabilités:
 * - Afficher le formulaire email/mot de passe.
 * - Appeler le backend (mock) via AuthService.
 * - Gérer l'état UI (loading, erreurs, toggle mot de passe).
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, FontAwesomeModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  /** Configuration UI (textes/couleurs) */
  public readonly appConfig = appInfos;
  public readonly loginConfig = loginConfig;
  /** Etat UI */
  public readonly loading = signal(false);
  public readonly errorMessage = signal<string | null>(null);
  /** Toggle affichage mot de passe */
  public readonly showPassword = signal(false);
  /** Icônes */
  public readonly faEye = faEye;
  public readonly faEyeSlash = faEyeSlash;
  public readonly faGoogle = faGoogle;
  public readonly faApple = faApple;
  public readonly faFacebook = faFacebookF;
  /** Injections des dépendances */
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  /**
   * Formulaire Reactive Forms. 
   * `nonNullable` évite les `string | null` et simplifie l'usage.
   */
  public readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });
  /** Raccourcis pour template / debug */
  public get emailControl(){ return this.loginForm.controls.email; }
  public get passwordControl(){ return this.loginForm.controls.password;}
  private get returnUrl(): string {
    const ru = this.route.snapshot.queryParamMap.get('returnUrl');
    return ru?.startsWith('/') ? ru : '/home';
  }
  /** Affiche/masque le mot de passe. */
  public togglePassword() { this.showPassword.update((v) => !v); }
  /**
   * Soumission du formulaire.
   * - Valide le form
   * - Appelle loginHttp (mock backend)
   * - Redirige vers /home en cas de succès
   */
  public async login(): Promise<void> {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Veuillez corriger les erreurs.');
      return;
    }

    this.errorMessage.set(null);
    this.loading.set(true);
    const { email, password } = this.loginForm.getRawValue();

    try {
      // Appel HTTP (mock backend)
      await firstValueFrom(this.auth.loginHttp(email, password));
      await this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
    } catch (err: any) {
      // err.error.message vient du mock { message: string }
      this.errorMessage.set(err?.error?.message ?? this.loginConfig.validation.errors.authFailed);
    } finally { this.loading.set(false); }
  }

}
