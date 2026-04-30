import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg fixed-top sabores-navbar">
      <div class="container">
        <a class="navbar-brand" routerLink="/recipes">
          <i class="bi bi-flower1 me-2"></i>sabores
        </a>
        <button class="navbar-toggler" type="button"
          data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/recipes" routerLinkActive="active">
                <i class="bi bi-search me-1"></i>Explorar
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link cart-link" routerLink="/cart" routerLinkActive="active">
                <i class="bi bi-cart3 me-1"></i>Carrito
                @if (cartSvc.pendingCount() > 0) {
                  <span class="cart-badge">{{ cartSvc.pendingCount() }}</span>
                }
              </a>
            </li>
            @if (auth.isLoggedIn()) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/pantry" routerLinkActive="active">
                  <i class="bi bi-basket me-1"></i>Despensa
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/planner" routerLinkActive="active">
                  <i class="bi bi-calendar3 me-1"></i>Planificador
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/favorites" routerLinkActive="active">
                  <i class="bi bi-heart me-1"></i>Favoritos
                </a>
              </li>
            }
          </ul>
          <div class="d-flex align-items-center gap-2">
            @if (auth.isLoggedIn()) {
              <a routerLink="/recipes/new" class="btn btn-success-soft btn-sm">
                <i class="bi bi-plus-lg me-1"></i>Nueva receta
              </a>
              <div class="dropdown-wrapper">
                <button class="btn btn-user" (click)="toggleDropdown($event)">
                  <span class="avatar-circle">{{ initials() }}</span>
                  <span class="d-none d-lg-inline ms-2">{{ auth.currentUser()?.name }}</span>
                  <i class="bi bi-chevron-down ms-1 small"></i>
                </button>
                @if (dropdownOpen()) {
                  <ul class="dropdown-menu-custom">
                    <li><span class="dropdown-email">{{ auth.currentUser()?.email }}</span></li>
                    <li><hr class="dropdown-divider m-1"></li>
                    <li><button class="dropdown-item text-danger" (click)="auth.logout()">
                      <i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión
                    </button></li>
                  </ul>
                }
              </div>
            } @else {
              <a routerLink="/login" class="btn btn-outline-light btn-sm">Iniciar sesión</a>
              <a routerLink="/register" class="btn btn-primary-soft btn-sm">Crear cuenta</a>
            }
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .sabores-navbar {
      background-color: #2D6A4F;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }
    .navbar-brand {
      color: #D8F3DC !important;
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .nav-link {
      color: #B7E4C7 !important;
      font-size: 0.9rem;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      transition: background 0.15s, color 0.15s;
    }
    .nav-link:hover, .nav-link.active {
      color: #fff !important;
      background: rgba(255,255,255,0.12);
    }
    .navbar-toggler { border-color: rgba(255,255,255,0.3); }
    .navbar-toggler-icon { filter: invert(1); }

    .btn-success-soft {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: #fff;
      font-size: 0.85rem;
    }
    .btn-success-soft:hover { background: rgba(255,255,255,0.25); color: #fff; }

    .btn-primary-soft {
      background: #52B788;
      border: none;
      color: #fff;
      font-size: 0.85rem;
    }
    .btn-primary-soft:hover { background: #40916C; color: #fff; }

    .btn-user {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.25);
      color: #D8F3DC;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
    }
    .btn-user:hover { background: rgba(255,255,255,0.1); color: #fff; }

    .avatar-circle {
      width: 28px; height: 28px; border-radius: 50%;
      background: #52B788;
      color: #fff;
      font-size: 0.75rem; font-weight: 600;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .dropdown-wrapper { position: relative; }
    .dropdown-menu-custom {
      position: absolute; right: 0; top: calc(100% + 6px);
      background: #fff; border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      list-style: none; padding: 6px 0; margin: 0;
      min-width: 200px; z-index: 1000;
    }
    .dropdown-email { display: block; padding: 6px 16px; font-size: 0.8rem; color: #6c757d; }
    .dropdown-item { width: 100%; background: none; border: none; text-align: left; padding: 8px 16px; font-size: 0.875rem; cursor: pointer; }
    .dropdown-item:hover { background: #f8f9fa; }

    .cart-link { position: relative; }
    .cart-badge {
      position: absolute; top: 2px; right: -4px;
      background: #f8c200; color: #1B4332;
      font-size: 0.65rem; font-weight: 700;
      min-width: 17px; height: 17px;
      border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      line-height: 1;
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  cartSvc = inject(CartService);
  dropdownOpen = signal(false);

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen.update(v => !v);
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  initials(): string {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
