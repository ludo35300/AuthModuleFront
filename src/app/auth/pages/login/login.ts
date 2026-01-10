import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { loginConfig } from './login.config';
import { appInfos } from '../../../app.config';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  public readonly loginConfig = loginConfig; // UI Config (couleurs, image, textes)
  public readonly appConfig = appInfos;
  // Formulaire 
  public readonly loginForm: FormGroup;
  public showPassword = signal(false);
  public readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Etat (UI)
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  // //  Etat UX (calculé), permet d'activer/désactiver le bouton de soumission
  // public canSubmit = computed(() => {
    
  //   return (
  //     this.emailRegex.test(this.email().trim()) && 
  //     this.password().trim().length >= 4 && 
  //     !this.loading()
  //   );
  // });
  // Injections des dépendances
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  

  constructor(private readonly fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }
  get emailControl() { return this.loginForm.get('email'); }
  get passwordControl() { return this.loginForm.get('password'); }

  public togglePassword() {
    this.showPassword.update((v) => !v);
  }

  public async login(): Promise<void> {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Veuillez corriger les erreurs.');
      return;
    }
    this.errorMessage.set(null);  // Réinitialise le message d'erreur
    this.loading.set(true);        // Active le spinner

    

    try {
      await this.fakeApiDelay();  // Simule un appel API (délai 1,2 secondes)
      const isSuccess = this.auth.login(this.loginForm.value.email, this.loginForm.value.password);
      if(!isSuccess) throw new Error('Invalid credentials'); // Déclenche le catch
      await this.router.navigate(['/home']);  // Redirection vers la page d'accueil
    }catch(error){
      console.error(error);
      this.errorMessage.set(this.loginConfig.validation.errors.authFailed);
    } finally {
      this.loading.set(false);
    }
  
  }

  /** SIMULATION */
  // Faux délai d'attente de réponse API (test spinner)
  private fakeApiDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 1200));
  }
}
