import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecipeSummary, PageResponse } from '../../core/models/models';
import { FavoritesService } from '../../core/services/favorites.service';
import { RecipeCardComponent } from '../../shared/components/recipe-card/recipe-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RecipeCardComponent, RouterLink],
  template: `
    <div class="page-container">
      <div class="container py-4">
        <div class="page-header">
          <h1 class="page-title"><i class="bi bi-heart me-2"></i>Mis favoritos</h1>
          <p class="page-sub">Las recetas que más te gustan, siempre a mano</p>
        </div>
        @if (loading()) {
          <div class="d-flex justify-content-center py-5">
            <div class="spinner-border text-success"></div>
          </div>
        } @else if (recipes().length === 0) {
          <div class="empty-state">
            <i class="bi bi-heart"></i>
            <p>Aún no tienes recetas favoritas</p>
            <a routerLink="/recipes" class="btn btn-outline-success btn-sm">Explorar recetas</a>
          </div>
        } @else {
          <p class="total-label">{{ totalElements() }} recetas guardadas</p>
          <div class="recipes-grid">
            @for (recipe of recipes(); track recipe.id) {
              <app-recipe-card [recipe]="recipe" (favoriteToggled)="load()" />
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { background: #F0FAF4; min-height: 100vh; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.75rem; font-weight: 700; color: #1B4332; margin: 0; }
    .page-sub { color: #52796F; margin: 0.25rem 0 0; font-size: 0.9rem; }
    .total-label { font-size: 0.875rem; color: #52796F; margin-bottom: 1rem; }
    .recipes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
    .empty-state { text-align: center; padding: 4rem 0; color: #52796F; }
    .empty-state i { font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.35; }
  `]
})
export class FavoritesComponent implements OnInit {
  private favService = inject(FavoritesService);

  recipes       = signal<RecipeSummary[]>([]);
  loading       = signal(true);
  totalElements = signal(0);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.favService.getAll().subscribe((page: PageResponse<RecipeSummary>) => {
      this.recipes.set(page.content);
      this.totalElements.set(page.totalElements);
      this.loading.set(false);
    });
  }
}
