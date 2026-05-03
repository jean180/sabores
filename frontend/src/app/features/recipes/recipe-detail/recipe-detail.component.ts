import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecipeDetail, Rating } from '../../../core/models/models';
import { RecipeService } from '../../../core/services/recipe.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { PantryService } from '../../../core/services/pantry.service';
import { RatingService } from '../../../core/services/rating.service';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { missingQty } from '../../../core/utils/unit.util';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, StarRatingComponent],
  template: `
    @if (loading()) {
      <div class="d-flex justify-content-center py-5 mt-5">
        <div class="spinner-border text-success"></div>
      </div>
    } @else if (recipe()) {
      <div class="detail-page">
        <!-- Hero -->
        <div class="detail-hero" [style.background]="heroBg()">
          <div class="detail-hero-overlay"></div>
          <div class="container detail-hero-content">
            <a routerLink="/recipes" class="back-link">
              <i class="bi bi-arrow-left me-1"></i> Volver
            </a>
            <h1 class="detail-title">{{ recipe()!.title }}</h1>
            <p class="detail-sub">{{ recipe()!.description }}</p>
            <div class="detail-pills">
              <span class="d-pill"><i class="bi bi-clock me-1"></i>{{ recipe()!.prepTime }} min</span>
              <span class="d-pill"><i class="bi bi-people me-1"></i>{{ recipe()!.servings }} personas</span>
              <span class="d-pill">{{ diffLabel() }}</span>
              @if (recipe()!.category) {
                <span class="d-pill">{{ recipe()!.category!.icon }} {{ recipe()!.category!.name }}</span>
              }
              @if (recipe()!.ratingCount > 0) {
                <span class="d-pill rating-pill">
                  <app-star-rating [score]="recipe()!.avgRating" [ratingCount]="recipe()!.ratingCount" [showCount]="true" />
                </span>
              }
            </div>
            <div class="detail-actions">
              @if (auth.isLoggedIn()) {
                <button class="btn btn-fav-hero" (click)="toggleFav()" [class.active]="recipe()!.isFavorite">
                  <i class="bi" [class.bi-heart]="!recipe()!.isFavorite" [class.bi-heart-fill]="recipe()!.isFavorite"></i>
                  {{ recipe()!.isFavorite ? 'En favoritos' : 'Guardar' }}
                </button>
              }
              @if (isOwner()) {
                <a [routerLink]="['/recipes', recipe()!.id, 'edit']" class="btn btn-edit-hero">
                  <i class="bi bi-pencil me-1"></i>Editar
                </a>
                <button class="btn btn-delete-hero" (click)="deleteRecipe()">
                  <i class="bi bi-trash me-1"></i>Eliminar
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="container detail-body">
          <div class="row g-4">
            <!-- Ingredientes -->
            <div class="col-lg-4">
              <div class="detail-card">
                <h2 class="detail-card-title">
                  <i class="bi bi-basket me-2"></i>Ingredientes
                  <span class="badge bg-success-subtle text-success ms-2">{{ recipe()!.ingredients.length }}</span>
                </h2>
                <div class="servings-row">
                  <button class="srv-btn" (click)="adjustServings(-1)">−</button>
                  <span class="srv-num">{{ servings() }}</span>
                  <button class="srv-btn" (click)="adjustServings(1)">+</button>
                  <span class="srv-label">personas</span>
                </div>
                <ul class="ingredient-list">
                  @for (ing of recipe()!.ingredients; track ing.id; let i = $index) {
                    <li class="ingredient-item"
                        [class.checked]="checkedIngredients.has(i)"
                        [class.in-pantry]="coveredIngredients().has(ing.id)"
                        (click)="toggleIngredient(i, ing.id)">
                      <div class="ing-check" [class.done]="checkedIngredients.has(i) || coveredIngredients().has(ing.id)">
                        @if (checkedIngredients.has(i) || coveredIngredients().has(ing.id)) {
                          <i class="bi bi-check"></i>
                        }
                      </div>
                      <span class="ing-name">{{ ing.ingredient.name }}</span>
                      <span class="ing-qty">{{ scaledQty(ing.quantity) }} {{ ing.unit }}</span>
                      @if (coveredIngredients().has(ing.id)) {
                        <i class="bi bi-basket-fill pantry-icon" title="En tu despensa"></i>
                      }
                    </li>
                  }
                </ul>

                <!-- Botón agregar al carrito -->
                <div class="cart-action-wrap">
                  @if (cartFeedback()) {
                    <div class="cart-feedback">
                      <i class="bi bi-check-circle-fill me-1"></i>{{ cartFeedback() }}
                    </div>
                  } @else {
                    <button class="btn btn-add-cart" (click)="addMissingToCart()" [disabled]="cartLoading()">
                      @if (cartLoading()) {
                        <span class="spinner-border spinner-border-sm me-1"></span>
                      } @else {
                        <i class="bi bi-cart-plus me-1"></i>
                      }
                      {{ auth.isLoggedIn() ? 'Agregar ingredientes faltantes' : 'Agregar ingredientes al carrito' }}
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Pasos -->
            <div class="col-lg-8">
              <div class="detail-card">
                <h2 class="detail-card-title">
                  <i class="bi bi-list-ol me-2"></i>Preparación
                </h2>
                <div class="steps-list">
                  @for (step of recipe()!.steps; track step.id) {
                    <div class="step-item" [class.done]="checkedSteps.has(step.stepNumber)"
                        (click)="toggleStep(step.stepNumber)">
                      <div class="step-num" [class.done]="checkedSteps.has(step.stepNumber)">
                        {{ step.stepNumber }}
                      </div>
                      <p class="step-text">{{ step.description }}</p>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <div class="author-row">
            <i class="bi bi-person-circle"></i>
            Receta de <strong>{{ recipe()!.author.name }}</strong>
          </div>

          <!-- Valoraciones -->
          <div class="detail-card ratings-section">
            <h2 class="detail-card-title">
              <i class="bi bi-star me-2"></i>Valoraciones
              @if (recipe()!.ratingCount > 0) {
                <span class="ms-2 d-flex align-items-center gap-2">
                  <app-star-rating [score]="recipe()!.avgRating" />
                  <span class="rating-avg-text">{{ recipe()!.avgRating.toFixed(1) }} / 5</span>
                  <span class="rating-count-text">({{ recipe()!.ratingCount }} valoraciones)</span>
                </span>
              }
            </h2>

            @if (auth.isLoggedIn()) {
              <div class="my-rating-form">
                <p class="my-rating-label">{{ myRating() ? 'Tu valoración' : 'Valora esta receta' }}</p>
                <app-star-rating
                  [score]="myScore()"
                  [interactive]="true"
                  (scoreChange)="myScore.set($event)" />
                <textarea
                  class="form-control rating-comment mt-2"
                  [(ngModel)]="myComment"
                  placeholder="Comentario opcional..."
                  rows="2">
                </textarea>
                <div class="rating-form-actions">
                  <button class="btn btn-rate" (click)="submitRating()" [disabled]="myScore() === 0">
                    {{ myRating() ? 'Actualizar' : 'Publicar' }}
                  </button>
                  @if (myRating()) {
                    <button class="btn btn-rate-delete" (click)="deleteRating()">Eliminar</button>
                  }
                </div>
              </div>
            }

            @if (ratings().length > 0) {
              <div class="ratings-list">
                @for (r of ratings(); track r.id) {
                  <div class="rating-item">
                    <div class="rating-item-header">
                      <strong class="rating-user">{{ r.userName }}</strong>
                      <app-star-rating [score]="r.score" />
                      <span class="rating-date">{{ formatDate(r.createdAt) }}</span>
                    </div>
                    @if (r.comment) {
                      <p class="rating-comment">{{ r.comment }}</p>
                    }
                  </div>
                }
              </div>
            } @else if (!auth.isLoggedIn()) {
              <p class="no-ratings-text">Sé el primero en valorar esta receta.</p>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-hero {
      min-height: 300px; position: relative;
      display: flex; align-items: flex-end; padding-bottom: 2rem;
    }
    .detail-hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(27,67,50,0.3), rgba(27,67,50,0.85));
    }
    .detail-hero-content { position: relative; z-index: 1; color: white; }
    .back-link { color: #B7E4C7; text-decoration: none; font-size: 0.875rem; display: inline-flex; align-items: center; margin-bottom: 1rem; }
    .back-link:hover { color: #fff; }
    .detail-title { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; }
    .detail-sub { color: #B7E4C7; font-size: 0.95rem; margin: 0 0 1rem; max-width: 600px; }
    .detail-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1rem; }
    .d-pill { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px; padding: 4px 12px; font-size: 0.82rem; }
    .detail-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn-fav-hero { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: #fff; border-radius: 8px; padding: 7px 16px; font-size: 0.875rem; cursor: pointer; }
    .btn-fav-hero.active { background: rgba(224,82,82,0.25); border-color: #e05252; color: #ffc; }
    .btn-edit-hero { background: rgba(82,183,136,0.25); border: 1px solid #52B788; color: #D8F3DC; border-radius: 8px; padding: 7px 16px; font-size: 0.875rem; text-decoration: none; }
    .btn-delete-hero { background: rgba(220,53,69,0.2); border: 1px solid rgba(220,53,69,0.4); color: #ffb3b3; border-radius: 8px; padding: 7px 16px; font-size: 0.875rem; cursor: pointer; }

    .detail-body { padding: 2rem 0; }
    .detail-card { background: #fff; border-radius: 16px; padding: 1.5rem; border: 1px solid #E9F5EE; }
    .detail-card-title { font-size: 1.1rem; font-weight: 600; color: #1B4332; margin-bottom: 1rem; display: flex; align-items: center; }

    .servings-row { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #E9F5EE; }
    .srv-btn { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #C8E6C9; background: #F0FAF4; color: #2D6A4F; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .srv-btn:hover { background: #2D6A4F; color: #fff; }
    .srv-num { font-size: 1.1rem; font-weight: 600; color: #1B4332; min-width: 24px; text-align: center; }
    .srv-label { font-size: 0.875rem; color: #52796F; }

    .ingredient-list { list-style: none; padding: 0; margin: 0; }
    .ingredient-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #F0FAF4; cursor: pointer; transition: opacity 0.15s; }
    .ingredient-item:last-child { border-bottom: none; }
    .ingredient-item.checked { opacity: 0.5; }
    .ingredient-item.in-pantry { opacity: 0.6; cursor: default; }
    .ingredient-item.in-pantry .ing-check.done { background: #95D5B2; border-color: #95D5B2; }
    .ing-check { width: 16px; height: 16px; border-radius: 4px; border: 1.5px solid #52B788; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; flex-shrink: 0; transition: all 0.15s; }
    .ing-check.done { background: #52B788; border-color: #52B788; color: #fff; }
    .ing-name { flex: 1; font-size: 0.9rem; color: #2D3436; }
    .ing-qty { font-size: 0.82rem; color: #52796F; }
    .pantry-icon { font-size: 0.75rem; color: #95D5B2; flex-shrink: 0; }

    .steps-list { display: flex; flex-direction: column; gap: 14px; }
    .step-item { display: flex; gap: 14px; cursor: pointer; transition: opacity 0.15s; }
    .step-item.done { opacity: 0.45; }
    .step-item.done .step-text { text-decoration: line-through; }
    .step-num { width: 30px; height: 30px; border-radius: 50%; background: #2D6A4F; color: #fff; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; transition: all 0.15s; }
    .step-num.done { background: #95D5B2; color: #1B4332; }
    .step-text { font-size: 0.9rem; color: #2D3436; line-height: 1.6; margin: 0; }

    .author-row { text-align: center; color: #52796F; font-size: 0.875rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #E9F5EE; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .author-row i { font-size: 1.2rem; }

    .cart-action-wrap { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #F0FAF4; }
    .btn-add-cart {
      width: 100%; background: #2D6A4F; color: #fff;
      border: none; border-radius: 10px; padding: 0.6rem 1rem;
      font-size: 0.875rem; font-weight: 500; cursor: pointer;
      transition: background 0.15s;
      display: flex; align-items: center; justify-content: center;
    }
    .btn-add-cart:hover:not(:disabled) { background: #1B4332; }
    .btn-add-cart:disabled { opacity: 0.6; cursor: not-allowed; }
    .cart-feedback {
      background: #D8F3DC; color: #1B4332;
      border-radius: 10px; padding: 0.55rem 1rem;
      font-size: 0.875rem; font-weight: 500;
      display: flex; align-items: center; justify-content: center;
    }

    .rating-pill { display: flex; align-items: center; padding: 4px 12px; }
    .ratings-section { margin-top: 2rem; }
    .rating-avg-text { font-size: 0.9rem; font-weight: 600; color: #1B4332; }
    .rating-count-text { font-size: 0.82rem; color: #52796F; }

    .my-rating-form { background: #F8FDF9; border: 1px solid #C8E6C9; border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem; }
    .my-rating-label { font-size: 0.875rem; font-weight: 600; color: #1B4332; margin-bottom: 0.5rem; }
    .rating-comment { border-color: #C8E6C9; border-radius: 8px; font-size: 0.875rem; resize: none; }
    .rating-comment:focus { border-color: #52B788; box-shadow: 0 0 0 2px rgba(82,183,136,0.15); }
    .rating-form-actions { display: flex; gap: 8px; margin-top: 0.75rem; }
    .btn-rate { background: #2D6A4F; color: #fff; border: none; border-radius: 8px; padding: 6px 16px; font-size: 0.875rem; cursor: pointer; }
    .btn-rate:hover:not(:disabled) { background: #1B4332; }
    .btn-rate:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-rate-delete { background: transparent; color: #dc3545; border: 1px solid #dc3545; border-radius: 8px; padding: 6px 16px; font-size: 0.875rem; cursor: pointer; }
    .btn-rate-delete:hover { background: #dc3545; color: #fff; }

    .ratings-list { display: flex; flex-direction: column; gap: 12px; }
    .rating-item { padding: 12px 0; border-bottom: 1px solid #F0FAF4; }
    .rating-item:last-child { border-bottom: none; }
    .rating-item-header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; flex-wrap: wrap; }
    .rating-user { font-size: 0.875rem; color: #1B4332; }
    .rating-date { font-size: 0.78rem; color: #95a5a6; margin-left: auto; }
    .rating-comment { font-size: 0.875rem; color: #2D3436; margin: 0; padding-left: 2px; }
    .no-ratings-text { font-size: 0.875rem; color: #52796F; margin: 0; }

    @media (max-width: 768px) {
      .detail-title { font-size: 1.5rem; }
      .detail-hero { min-height: 240px; }
      .detail-actions { gap: 6px; }
      .btn-fav-hero, .btn-edit-hero, .btn-delete-hero { font-size: 0.8rem; padding: 6px 12px; }
    }

    @media (max-width: 576px) {
      .detail-title { font-size: 1.25rem; }
      .detail-hero { min-height: 200px; padding-bottom: 1.25rem; }
      .detail-body { padding: 1.25rem 0; }
      .detail-card { padding: 1rem; }
      .detail-actions { flex-wrap: wrap; }
    }
  `]
})
export class RecipeDetailComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private recipeService  = inject(RecipeService);
  private favService     = inject(FavoritesService);
  private pantryService  = inject(PantryService);
  private cartService    = inject(CartService);
  private ratingService  = inject(RatingService);
  auth                   = inject(AuthService);

  recipe       = signal<RecipeDetail | null>(null);
  loading      = signal(true);
  servings     = signal(4);
  cartLoading  = signal(false);
  cartFeedback = signal('');
  pantryItems  = signal<{ name: string; qty: number | null; unit: string | null }[]>([]);

  ratings   = signal<Rating[]>([]);
  myRating  = signal<Rating | null>(null);
  myScore   = signal(0);
  myComment = '';

  checkedIngredients = new Set<number>();
  checkedSteps       = new Set<number>();

  coveredIngredients = computed(() => {
    const r = this.recipe();
    if (!r) return new Set<number>();
    const covered = new Set<number>();
    r.ingredients.forEach(ing => {
      const scaledQty = (ing.quantity / r.servings) * this.servings();
      const pantry = this.pantryItems().find(p => p.name === ing.ingredient.name.toLowerCase());
      if (missingQty(scaledQty, ing.unit, pantry?.qty ?? null, pantry?.unit ?? null) === null) {
        covered.add(ing.id);
      }
    });
    return covered;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.recipeService.getById(id).subscribe(r => {
      this.recipe.set(r);
      this.servings.set(r.servings);
      this.loading.set(false);
    });
    this.loadRatings(id);
    if (this.auth.isLoggedIn()) {
      this.pantryService.get().subscribe(data => {
        this.pantryItems.set(data.items.map(i => ({
          name: i.ingredient.name.toLowerCase(),
          qty: i.quantity,
          unit: i.unit
        })));
      });
      this.ratingService.getMyRating(id).subscribe({
        next: r => {
          if (r) { this.myRating.set(r); this.myScore.set(r.score); this.myComment = r.comment ?? ''; }
        },
        error: () => {}
      });
    }
  }

  private loadRatings(id: number): void {
    this.ratingService.getByRecipe(id).subscribe(rs => this.ratings.set(rs));
  }

  heroBg(): string {
    const colors = ['#2D6A4F','#1B4332','#40916C','#52B788','#095D3A'];
    return colors[(this.recipe()?.id ?? 0) % colors.length];
  }

  diffLabel(): string {
    return { EASY: 'Fácil', MEDIUM: 'Media', HARD: 'Difícil' }[this.recipe()?.difficulty ?? 'EASY'] ?? '';
  }

  isOwner(): boolean {
    return this.auth.currentUser()?.id === this.recipe()?.author.id;
  }

  adjustServings(delta: number): void {
    this.servings.update(s => Math.max(1, s + delta));
  }

  scaledQty(original: number): string {
    const base = this.recipe()!.servings;
    const raw = (original / base) * this.servings();
    const scaled = Math.round(raw * 100) / 100;
    return Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(2).replace(/\.?0+$/, '');
  }

  toggleIngredient(i: number, ingId: number): void {
    if (this.coveredIngredients().has(ingId)) return;
    this.checkedIngredients.has(i) ? this.checkedIngredients.delete(i) : this.checkedIngredients.add(i);
  }

  toggleStep(n: number): void {
    this.checkedSteps.has(n) ? this.checkedSteps.delete(n) : this.checkedSteps.add(n);
  }

  toggleFav(): void {
    this.favService.toggle(this.recipe()!.id).subscribe(() => {
      this.recipe.update(r => r ? { ...r, isFavorite: !r.isFavorite } : r);
    });
  }

  addMissingToCart(): void {
    const r = this.recipe();
    if (!r) return;

    const addToCart = (pantryItems: { name: string; qty: number | null; unit: string | null }[]) => {
      let added = 0;
      r.ingredients.forEach(ing => {
        const scaledQty = (ing.quantity / r.servings) * this.servings();
        const pantry = pantryItems.find(p => p.name === ing.ingredient.name.toLowerCase());
        const missing = missingQty(scaledQty, ing.unit, pantry?.qty ?? null, pantry?.unit ?? null);
        if (missing) {
          this.cartService.add(ing.ingredient.name, String(missing.quantity), missing.unit, ing.ingredient.category);
          added++;
        }
      });
      const msg = added === 0
        ? '¡Ya tienes todos los ingredientes!'
        : `${added} ingrediente${added > 1 ? 's' : ''} añadido${added > 1 ? 's' : ''} al carrito`;
      this.cartFeedback.set(msg);
      this.cartLoading.set(false);
      setTimeout(() => this.cartFeedback.set(''), 3500);
    };

    if (this.auth.isLoggedIn()) {
      this.cartLoading.set(true);
      this.pantryService.get().subscribe({
        next: data => {
          const pantryItems = data.items.map(i => ({
            name: i.ingredient.name.toLowerCase(),
            qty: i.quantity,
            unit: i.unit
          }));
          addToCart(pantryItems);
        },
        error: () => addToCart([])
      });
    } else {
      addToCart([]);
    }
  }

  deleteRecipe(): void {
    if (!confirm('¿Eliminar esta receta?')) return;
    this.recipeService.delete(this.recipe()!.id).subscribe(() => this.router.navigate(['/recipes']));
  }

  submitRating(): void {
    const id = this.recipe()!.id;
    this.ratingService.upsert(id, this.myScore(), this.myComment).subscribe(r => {
      this.myRating.set(r);
      this.loadRatings(id);
      this.recipe.update(rec => rec ? {
        ...rec,
        avgRating: this.computeAvg(r),
        ratingCount: this.myRating() ? rec.ratingCount : rec.ratingCount + 1
      } : rec);
    });
  }

  deleteRating(): void {
    const id = this.recipe()!.id;
    this.ratingService.delete(id).subscribe(() => {
      this.myRating.set(null);
      this.myScore.set(0);
      this.myComment = '';
      this.loadRatings(id);
      this.recipe.update(rec => rec ? { ...rec, ratingCount: Math.max(0, rec.ratingCount - 1) } : rec);
    });
  }

  private computeAvg(updated: Rating): number {
    const all = this.ratings().map(r => r.id === updated.id ? updated.score : r.score);
    if (!this.myRating()) all.push(updated.score);
    return all.length ? all.reduce((a, b) => a + b, 0) / all.length : 0;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
