import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecipeSummary } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [RouterLink, StarRatingComponent],
  template: `
    <div class="recipe-card h-100">
      <a [routerLink]="['/recipes', recipe.id]" class="recipe-card-img-link">
        <div class="recipe-card-img" [style.background]="imgBg()">
          @if (recipe.imageUrl) {
            <img [src]="recipe.imageUrl" [alt]="recipe.title" class="w-100 h-100 object-fit-cover">
          } @else {
            <span class="recipe-placeholder-emoji">🍽️</span>
          }
        </div>
      </a>
      <div class="recipe-card-body">
        <div class="d-flex align-items-start justify-content-between gap-2 mb-1">
          <a [routerLink]="['/recipes', recipe.id]" class="recipe-card-title">
            {{ recipe.title }}
          </a>
          @if (auth.isLoggedIn()) {
            <button class="btn-fav" (click)="toggleFav($event)" [class.active]="recipe.isFavorite">
              <i class="bi" [class.bi-heart]="!recipe.isFavorite" [class.bi-heart-fill]="recipe.isFavorite"></i>
            </button>
          }
        </div>
        <div class="recipe-card-meta">
          <span class="meta-item">
            <i class="bi bi-clock"></i> {{ recipe.prepTime }} min
          </span>
          <span class="meta-item">
            <i class="bi bi-people"></i> {{ recipe.servings }}
          </span>
          <span class="badge-difficulty" [class]="'diff-' + recipe.difficulty.toLowerCase()">
            {{ difficultyLabel() }}
          </span>
        </div>
        @if (recipe.category) {
          <span class="category-pill">{{ recipe.category.icon }} {{ recipe.category.name }}</span>
        }
        @if (recipe.ratingCount > 0) {
          <div class="card-rating">
            <app-star-rating [score]="recipe.avgRating" [ratingCount]="recipe.ratingCount" [showCount]="true" />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .recipe-card {
      background: #fff;
      border-radius: 14px;
      border: 1px solid #E9F5EE;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex; flex-direction: column;
    }
    .recipe-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(45,106,79,0.12); }

    .recipe-card-img-link { display: block; }
    .recipe-card-img {
      height: 160px; position: relative; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
    }
    .recipe-placeholder-emoji { font-size: 3rem; }

    .recipe-card-body { padding: 14px; flex: 1; display: flex; flex-direction: column; gap: 8px; }

    .recipe-card-title {
      font-size: 0.95rem; font-weight: 600;
      color: #1B4332; text-decoration: none; line-height: 1.3;
    }
    .recipe-card-title:hover { color: #2D6A4F; }

    .btn-fav {
      background: none; border: none; padding: 2px 4px;
      color: #aaa; font-size: 1rem; cursor: pointer; flex-shrink: 0;
      transition: color 0.15s;
    }
    .btn-fav:hover, .btn-fav.active { color: #e05252; }

    .recipe-card-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .meta-item { font-size: 0.8rem; color: #52796F; display: flex; align-items: center; gap: 3px; }

    .badge-difficulty {
      font-size: 0.72rem; border-radius: 20px; padding: 2px 8px; font-weight: 500;
    }
    .diff-easy   { background: #D8F3DC; color: #1B4332; }
    .diff-medium { background: #FFF3CD; color: #664D03; }
    .diff-hard   { background: #FDECEA; color: #842029; }

    .category-pill {
      font-size: 0.75rem; background: #F0FAF4; color: #2D6A4F;
      border-radius: 20px; padding: 3px 10px; width: fit-content;
      border: 1px solid #C8E6C9;
    }
    .card-rating { margin-top: 2px; }
  `]
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: RecipeSummary;
  @Output() favoriteToggled = new EventEmitter<void>();

  auth = inject(AuthService);
  private favService = inject(FavoritesService);

  private bgColors = ['#B7E4C7','#95D5B2','#74C69D','#D8F3DC','#A8DAAD'];

  imgBg(): string {
    return this.bgColors[this.recipe.id % this.bgColors.length];
  }

  difficultyLabel(): string {
    return { EASY: 'Fácil', MEDIUM: 'Media', HARD: 'Difícil' }[this.recipe.difficulty] ?? '';
  }

  toggleFav(e: Event): void {
    e.preventDefault();
    this.favService.toggle(this.recipe.id).subscribe(() => {
      this.recipe = { ...this.recipe, isFavorite: !this.recipe.isFavorite };
      this.favoriteToggled.emit();
    });
  }
}
