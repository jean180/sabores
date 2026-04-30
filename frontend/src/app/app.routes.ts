import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/recipes', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'recipes',
    loadComponent: () => import('./features/recipes/recipe-list/recipe-list.component').then(m => m.RecipeListComponent)
  },
  {
    path: 'recipes/new',
    loadComponent: () => import('./features/recipes/recipe-form/recipe-form.component').then(m => m.RecipeFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'recipes/:id',
    loadComponent: () => import('./features/recipes/recipe-detail/recipe-detail.component').then(m => m.RecipeDetailComponent)
  },
  {
    path: 'recipes/:id/edit',
    loadComponent: () => import('./features/recipes/recipe-form/recipe-form.component').then(m => m.RecipeFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pantry',
    loadComponent: () => import('./features/pantry/pantry.component').then(m => m.PantryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'planner',
    loadComponent: () => import('./features/planner/planner.component').then(m => m.PlannerComponent),
    canActivate: [authGuard]
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/favorites/favorites.component').then(m => m.FavoritesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
  },
  { path: '**', redirectTo: '/recipes' }
];
