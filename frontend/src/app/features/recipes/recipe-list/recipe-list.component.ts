import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { Category, Ingredient, RecipeSummary } from '../../../core/models/models';
import { RecipeService } from '../../../core/services/recipe.service';
import { CategoryService } from '../../../core/services/category.service';
import { IngredientService } from '../../../core/services/ingredient.service';
import { RecipeCardComponent } from '../../../shared/components/recipe-card/recipe-card.component';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [FormsModule, RouterLink, RecipeCardComponent],
  template: `
    <div class="page-container">
      <!-- Hero con buscador -->
      <div class="hero-banner">
        <div class="container">
          <h1 class="hero-title">Descubre recetas increíbles</h1>
          <p class="hero-sub">Filtra por nombre, ingredientes, tiempo o dificultad</p>
          <div class="search-bar">
            <i class="bi bi-search search-icon"></i>
            <input type="text" class="form-control search-input"
              placeholder="Buscar recetas por nombre..."
              [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)">
          </div>
        </div>
      </div>

      <div class="container py-4">
        <!-- Categorías -->
        <div class="categories-strip">
          <button class="cat-btn" [class.active]="!selectedCategory" (click)="selectCategory(null)">
            🍽️ Todas
          </button>
          @for (cat of categories(); track cat.id) {
            <button class="cat-btn" [class.active]="selectedCategory === cat.id"
              (click)="selectCategory(cat.id)">
              {{ cat.icon }} {{ cat.name }}
            </button>
          }
        </div>

        <!-- Panel de filtros -->
        <div class="filters-panel">
          <span class="results-count">{{ totalElements() }} recetas</span>

          <!-- Dificultad -->
          @for (diff of difficulties; track diff.value) {
            <button class="filter-btn" [class.active]="selectedDifficulty === diff.value"
              (click)="selectDifficulty(diff.value)">
              {{ diff.label }}
            </button>
          }

          <!-- Separador -->
          <div class="filter-sep"></div>

          <!-- Tiempo máximo -->
          <div class="time-filter">
            <i class="bi bi-clock"></i>
            <input type="number" class="form-control form-control-sm time-input"
              placeholder="Máx. min" min="1" [(ngModel)]="maxPrepTime"
              (ngModelChange)="onTimeChange()">
          </div>

          <!-- Separador -->
          <div class="filter-sep"></div>

          <!-- Ingredientes -->
          <div class="ing-search-wrapper">
            <i class="bi bi-basket2 ing-icon"></i>
            <input type="text" class="form-control form-control-sm ing-input"
              placeholder="Filtrar por ingrediente..."
              [(ngModel)]="ingredientSearch"
              (ngModelChange)="onIngredientSearch($event)"
              (blur)="clearIngredientResults()">
            @if (ingredientResults().length > 0) {
              <ul class="ing-dropdown">
                @for (ing of ingredientResults(); track ing.id) {
                  <li (mousedown)="addIngredientFilter(ing)">{{ ing.name }}</li>
                }
              </ul>
            }
          </div>

          <!-- Tags de ingredientes seleccionados -->
          @for (ing of selectedIngredients(); track ing.id) {
            <span class="ing-tag">
              {{ ing.name }}
              <button (click)="removeIngredientFilter(ing.id)"><i class="bi bi-x"></i></button>
            </span>
          }

          <!-- Limpiar -->
          @if (hasActiveFilters()) {
            <button class="btn-clear ms-auto" (click)="resetFilters()">
              <i class="bi bi-x-circle me-1"></i>Limpiar
            </button>
          }
        </div>

        <!-- Grid -->
        @if (loading()) {
          <div class="d-flex justify-content-center py-5">
            <div class="spinner-border text-success"></div>
          </div>
        } @else if (recipes().length === 0) {
          <div class="empty-state">
            <i class="bi bi-search"></i>
            <p>No se encontraron recetas</p>
            <button class="btn btn-outline-success btn-sm" (click)="resetFilters()">Limpiar filtros</button>
          </div>
        } @else {
          <div class="recipes-grid">
            @for (recipe of recipes(); track recipe.id) {
              <app-recipe-card [recipe]="recipe" />
            }
          </div>
          @if (!isLastPage()) {
            <div class="d-flex justify-content-center mt-4">
              <button class="btn btn-load-more" (click)="loadMore()" [disabled]="loadingMore()">
                @if (loadingMore()) { <span class="spinner-border spinner-border-sm me-2"></span> }
                Ver más recetas
              </button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { background: #F0FAF4; min-height: 100vh; }
    .hero-banner {
      background: linear-gradient(135deg, #2D6A4F 0%, #40916C 100%);
      padding: 3rem 0 2rem; color: white; text-align: center;
    }
    .hero-title { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
    .hero-sub { color: #B7E4C7; font-size: 1rem; margin-bottom: 1.5rem; }
    .search-bar { position: relative; max-width: 520px; margin: 0 auto; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #52796F; z-index: 1; }
    .search-input { padding-left: 2.5rem; border-radius: 50px; border: none; font-size: 0.95rem; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
    .search-input:focus { box-shadow: 0 4px 20px rgba(0,0,0,0.15); }

    .categories-strip { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 1rem; }
    .categories-strip::-webkit-scrollbar { height: 4px; }
    .cat-btn {
      white-space: nowrap; border: 1px solid #C8E6C9; border-radius: 20px;
      padding: 6px 14px; background: #fff; color: #2D6A4F;
      font-size: 0.85rem; cursor: pointer; transition: all 0.15s; flex-shrink: 0;
    }
    .cat-btn:hover, .cat-btn.active { background: #2D6A4F; color: #fff; border-color: #2D6A4F; }

    .filters-panel { background: #fff; border-radius: 14px; border: 1px solid #E9F5EE; padding: 0.65rem 1rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .results-count { font-size: 0.82rem; color: #52796F; white-space: nowrap; margin-right: 4px; }
    .filter-sep { width: 1px; height: 20px; background: #E9F5EE; flex-shrink: 0; }
    .filter-btn { border: 1px solid #C8E6C9; border-radius: 8px; padding: 4px 11px; background: #fff; color: #2D6A4F; font-size: 0.8rem; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
    .filter-btn:hover, .filter-btn.active { background: #52B788; color: #fff; border-color: #52B788; }
    .time-filter { display: flex; align-items: center; gap: 5px; color: #52796F; font-size: 0.85rem; }
    .time-input { width: 90px; border-radius: 8px; border-color: #C8E6C9; font-size: 0.8rem; }
    .time-input:focus { border-color: #52B788; box-shadow: 0 0 0 3px rgba(82,183,136,0.15); }
    .ing-search-wrapper { position: relative; flex-shrink: 0; }
    .ing-icon { position: absolute; left: 8px; top: 50%; transform: translateY(-50%); color: #52796F; font-size: 0.8rem; pointer-events: none; }
    .ing-input { padding-left: 1.7rem; width: 190px; border-radius: 8px; border-color: #C8E6C9; font-size: 0.8rem; }
    .ing-input:focus { border-color: #52B788; box-shadow: 0 0 0 3px rgba(82,183,136,0.15); }
    .ing-dropdown { position: absolute; top: calc(100% + 2px); left: 0; width: 190px; z-index: 100; list-style: none; padding: 0; margin: 0; background: #fff; border: 1px solid #C8E6C9; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); max-height: 160px; overflow-y: auto; }
    .ing-dropdown li { padding: 7px 12px; font-size: 0.875rem; cursor: pointer; color: #1B4332; }
    .ing-dropdown li:hover { background: #F0FAF4; }
    .ing-tag { display: inline-flex; align-items: center; gap: 4px; background: #D8F3DC; color: #1B4332; border-radius: 20px; padding: 3px 8px 3px 11px; font-size: 0.8rem; font-weight: 500; white-space: nowrap; }
    .ing-tag button { background: none; border: none; padding: 0; cursor: pointer; color: #2D6A4F; font-size: 0.75rem; line-height: 1; display: flex; align-items: center; }
    .ing-tag button:hover { color: #e05252; }
    .btn-clear { background: none; border: none; font-size: 0.8rem; color: #e05252; cursor: pointer; padding: 4px 8px; border-radius: 8px; white-space: nowrap; }
    .btn-clear:hover { background: #fff0f0; }

    .recipes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
    .empty-state { text-align: center; padding: 4rem 0; color: #52796F; }
    .empty-state i { font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.4; }
    .btn-load-more {
      background: #fff; border: 1px solid #C8E6C9; color: #2D6A4F;
      border-radius: 50px; padding: 0.6rem 2rem; font-weight: 500;
    }
    .btn-load-more:hover { background: #2D6A4F; color: #fff; }

    @media (max-width: 768px) {
      .hero-title { font-size: 1.5rem; }
      .hero-sub { font-size: 0.9rem; }
      .hero-banner { padding: 2rem 0 1.5rem; }
      .ing-input { width: 150px; }
    }

    @media (max-width: 576px) {
      .hero-title { font-size: 1.3rem; }
      .filters-panel { flex-direction: column; align-items: flex-start; gap: 0.6rem; }
      .filter-sep { display: none; }
      .time-filter { width: 100%; }
      .time-input { width: 100px; }
      .ing-search-wrapper { width: 100%; }
      .ing-input { width: 100%; }
      .ing-dropdown { width: 100%; }
      .recipes-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
    }
  `]
})
export class RecipeListComponent implements OnInit {
  private recipeService     = inject(RecipeService);
  private categoryService   = inject(CategoryService);
  private ingredientService = inject(IngredientService);

  recipes           = signal<RecipeSummary[]>([]);
  categories        = signal<Category[]>([]);
  ingredientResults = signal<Ingredient[]>([]);
  selectedIngredients = signal<Ingredient[]>([]);
  loading           = signal(true);
  loadingMore       = signal(false);
  totalElements     = signal(0);
  isLastPage        = signal(false);

  searchTerm         = '';
  selectedCategory: number | null = null;
  selectedDifficulty = '';
  maxPrepTime: number | null = null;
  ingredientSearch   = '';
  currentPage        = 0;

  private search$     = new Subject<string>();
  private ingSearch$  = new Subject<string>();

  difficulties = [
    { value: '',       label: 'Todas'   },
    { value: 'EASY',   label: 'Fácil'   },
    { value: 'MEDIUM', label: 'Media'   },
    { value: 'HARD',   label: 'Difícil' }
  ];

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(cats => this.categories.set(cats));
    this.loadRecipes();
    this.search$.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => this.loadRecipes());
    this.ingSearch$.pipe(debounceTime(300), distinctUntilChanged(), switchMap(q =>
      q.length >= 2 ? this.ingredientService.search(q) : []
    )).subscribe(results => this.ingredientResults.set(results));
  }

  onSearch(term: string): void       { this.search$.next(term); }
  onIngredientSearch(q: string): void { this.ingSearch$.next(q); }
  onTimeChange(): void               { this.loadRecipes(); }

  selectCategory(id: number | null): void {
    this.selectedCategory = id;
    this.loadRecipes();
  }

  selectDifficulty(diff: string): void {
    this.selectedDifficulty = diff;
    this.loadRecipes();
  }

  addIngredientFilter(ing: Ingredient): void {
    if (!this.selectedIngredients().find(i => i.id === ing.id)) {
      this.selectedIngredients.update(list => [...list, ing]);
      this.loadRecipes();
    }
    this.ingredientSearch = '';
    this.ingredientResults.set([]);
  }

  removeIngredientFilter(id: number): void {
    this.selectedIngredients.update(list => list.filter(i => i.id !== id));
    this.loadRecipes();
  }

  clearIngredientResults(): void {
    setTimeout(() => this.ingredientResults.set([]), 150);
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedCategory || this.selectedDifficulty
      || this.maxPrepTime || this.selectedIngredients().length);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.selectedDifficulty = '';
    this.maxPrepTime = null;
    this.selectedIngredients.set([]);
    this.ingredientSearch = '';
    this.loadRecipes();
  }

  loadMore(): void {
    this.currentPage++;
    this.loadingMore.set(true);
    this.fetchRecipes(true);
  }

  private loadRecipes(): void {
    this.currentPage = 0;
    this.loading.set(true);
    this.fetchRecipes(false);
  }

  private fetchRecipes(append: boolean): void {
    this.recipeService.search({
      categoryId:    this.selectedCategory ?? undefined,
      difficulty:    this.selectedDifficulty || undefined,
      maxPrepTime:   this.maxPrepTime ?? undefined,
      search:        this.searchTerm || undefined,
      ingredientIds: this.selectedIngredients().map(i => i.id),
      page:          this.currentPage
    }).subscribe(page => {
      this.recipes.update(prev => append ? [...prev, ...page.content] : page.content);
      this.totalElements.set(page.totalElements);
      this.isLastPage.set(page.last);
      this.loading.set(false);
      this.loadingMore.set(false);
    });
  }
}
