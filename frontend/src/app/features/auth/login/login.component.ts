import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <i class="bi bi-flower1 auth-logo"></i>
          <h1 class="auth-title">Bienvenido de nuevo</h1>
          <p class="auth-subtitle">Entra a tu cocina personal</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          @if (error) {
            <div class="alert alert-danger py-2 small">{{ error }}</div>
          }
          <div class="mb-3">
            <label class="form-label">Correo electrónico</label>
            <input type="email" class="form-control" formControlName="email" placeholder="tu@email.com"
              [class.is-invalid]="form.get('email')?.invalid && form.get('email')?.touched">
          </div>
          <div class="mb-3">
            <label class="form-label">Contraseña</label>
            <input type="password" class="form-control" formControlName="password" placeholder="••••••••"
              [class.is-invalid]="form.get('password')?.invalid && form.get('password')?.touched">
          </div>
          <button type="submit" class="btn btn-sabores w-100" [disabled]="loading">
            @if (loading) { <span class="spinner-border spinner-border-sm me-2"></span> }
            Entrar a mi cocina
          </button>
        </form>

        <div class="auth-footer">
          ¿No tienes cuenta? <a routerLink="/register">Créala gratis</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #D8F3DC 0%, #B7E4C7 100%);
      padding: 2rem 1rem;
    }
    .auth-card {
      background: #fff; border-radius: 20px; padding: 2.5rem 2rem;
      width: 100%; max-width: 420px;
      box-shadow: 0 8px 40px rgba(45,106,79,0.15);
    }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-logo { font-size: 2.5rem; color: #2D6A4F; display: block; margin-bottom: 0.75rem; }
    .auth-title { font-size: 1.5rem; font-weight: 700; color: #1B4332; margin: 0 0 0.25rem; }
    .auth-subtitle { color: #52796F; font-size: 0.9rem; margin: 0; }

    .form-label { font-size: 0.875rem; font-weight: 500; color: #2D6A4F; }
    .form-control {
      border-color: #C8E6C9; border-radius: 10px; padding: 0.6rem 0.9rem;
      font-size: 0.9rem;
    }
    .form-control:focus { border-color: #52B788; box-shadow: 0 0 0 3px rgba(82,183,136,0.15); }

    .btn-sabores {
      background: #2D6A4F; color: #fff; border: none;
      border-radius: 10px; padding: 0.7rem; font-weight: 600;
      margin-top: 0.5rem;
    }
    .btn-sabores:hover:not(:disabled) { background: #1B4332; color: #fff; }
    .btn-sabores:disabled { opacity: 0.7; }

    .auth-footer { text-align: center; margin-top: 1.5rem; font-size: 0.875rem; color: #52796F; }
    .auth-footer a { color: #2D6A4F; font-weight: 500; text-decoration: none; }
    .auth-footer a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = false;
  error   = '';

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/recipes']),
      error: () => { this.error = 'Credenciales incorrectas'; this.loading = false; }
    });
  }
}
