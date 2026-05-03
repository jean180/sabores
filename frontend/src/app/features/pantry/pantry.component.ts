import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PantryItem, RecipeSuggestion, Ingredient, PantryWithSuggestions } from '../../core/models/models';
import { PantryService } from '../../core/services/pantry.service';
import { IngredientService } from '../../core/services/ingredient.service';
import { UnitSelectComponent } from '../../shared/components/unit-select/unit-select.component';

const CATEGORY_META: Record<string, { label: string; icon: string; order: number }> = {
  VERDURAS:    { label: 'Verduras',    icon: '🥦', order: 1 },
  FRUTAS:      { label: 'Frutas',      icon: '🍋', order: 2 },
  CARNES:      { label: 'Carnes',      icon: '🥩', order: 3 },
  PESCADOS:    { label: 'Pescados',    icon: '🐟', order: 4 },
  LACTEOS:     { label: 'Lácteos',     icon: '🥛', order: 5 },
  CEREALES:    { label: 'Cereales',    icon: '🌾', order: 6 },
  LEGUMBRES:   { label: 'Legumbres',   icon: '🫘', order: 7 },
  CONDIMENTOS: { label: 'Condimentos', icon: '🧂', order: 8 },
  CALDOS:      { label: 'Caldos',      icon: '🍲', order: 9 },
  OTROS:       { label: 'Otros',       icon: '🛒', order: 10 },
};

@Component({
  selector: 'app-pantry',
  standalone: true,
  imports: [FormsModule, RouterLink, UnitSelectComponent],
  template: `
    <div class="page-container">
      <div class="container py-4">
        <div class="page-header">
          <div>
            <h1 class="page-title"><i class="bi bi-basket me-2"></i>Mi despensa</h1>
            <p class="page-sub">Añade lo que tienes y descubre qué puedes cocinar hoy</p>
          </div>
          <button class="btn btn-sabores" (click)="showAddModal = true">
            <i class="bi bi-plus-lg me-1"></i>Añadir ingrediente
          </button>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-num">{{ items().length }}</span>
            <span class="stat-label">ingredientes</span>
          </div>
          <div class="stat-card">
            <span class="stat-num text-success">{{ suggestions().length }}</span>
            <span class="stat-label">recetas posibles</span>
          </div>
          <div class="stat-card">
            <span class="stat-num text-warning">{{ fullMatches() }}</span>
            <span class="stat-label">recetas completas</span>
          </div>
        </div>

        <div class="pantry-grid">
          <div class="pantry-panel">
            <h2 class="panel-title">Ingredientes <span class="badge bg-success-subtle text-success">{{ items().length }}</span></h2>
            @if (items().length === 0) {
              <div class="empty-panel">
                <i class="bi bi-basket"></i>
                <p>Tu despensa está vacía</p>
                <button class="btn btn-outline-success btn-sm" (click)="showAddModal = true">Añadir ingrediente</button>
              </div>
            } @else {
              @for (group of groupedItems(); track group.category) {
                <div class="category-group">
                  <button class="category-header" (click)="toggleCategory(group.category)"
                    [attr.aria-expanded]="!collapsedCategories().has(group.category)">
                    <span class="category-icon">{{ group.icon }}</span>
                    <span class="category-name">{{ group.label }}</span>
                    <span class="category-count">{{ group.items.length }}</span>
                    <i class="bi ms-auto" [class.bi-chevron-down]="collapsedCategories().has(group.category)"
                      [class.bi-chevron-up]="!collapsedCategories().has(group.category)"></i>
                  </button>
                  @if (!collapsedCategories().has(group.category)) {
                    <ul class="pantry-list">
                      @for (item of group.items; track item.id) {
                        <li class="pantry-item">
                          <span class="pantry-item-name">{{ item.ingredient.name }}</span>
                          <span class="pantry-item-qty">
                            @if (item.quantity) { {{ item.quantity }} {{ item.unit }} }
                          </span>
                          <button class="remove-btn" (click)="removeItem(item)" title="Eliminar">
                            <i class="bi bi-x"></i>
                          </button>
                        </li>
                      }
                    </ul>
                  }
                </div>
              }
            }
          </div>

          <div class="pantry-panel">
            <h2 class="panel-title">Puedes cocinar <span class="badge bg-success-subtle text-success">{{ suggestions().length }}</span></h2>
            @if (suggestions().length === 0) {
              <div class="empty-panel">
                <i class="bi bi-lightbulb"></i>
                <p>Añade ingredientes para ver sugerencias</p>
              </div>
            } @else {
              <div class="suggestions-list">
                @for (s of suggestions(); track s.recipe.id) {
                  <div class="suggestion-item">
                    <div class="sug-recipe-info">
                      <a [routerLink]="['/recipes', s.recipe.id]" class="sug-title">{{ s.recipe.title }}</a>
                      <span class="sug-meta">{{ s.matchedIngredients }}/{{ s.totalIngredients }} ingredientes · {{ s.recipe.prepTime }} min</span>
                      <div class="match-bar-bg">
                        <div class="match-bar" [style.width.%]="s.matchPercentage"
                          [class.full]="s.matchPercentage === 100"></div>
                      </div>
                      @if (s.missingIngredients.length > 0) {
                        <span class="missing-label">Falta: {{ s.missingIngredients.join(', ') }}</span>
                      }
                    </div>
                    <a [routerLink]="['/recipes', s.recipe.id]" class="sug-btn">Ver</a>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      @if (showAddModal) {
        <div class="modal-backdrop" (click)="showAddModal = false">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <h3 class="modal-title">Añadir ingrediente</h3>
            <div class="mb-3">
              <label class="form-label">Ingrediente</label>
              <input type="text" class="form-control" [(ngModel)]="search"
                (ngModelChange)="searchIngredients()" placeholder="Buscar ingrediente...">
              @if (searchResults.length > 0) {
                <ul class="search-dropdown">
                  @for (r of searchResults; track r.id) {
                    <li (click)="selectIngredient(r)">{{ r.name }}</li>
                  }
                </ul>
              }
            </div>
            @if (selected) {
              <div class="selected-ing">
                <i class="bi bi-check-circle-fill text-success me-2"></i>{{ selected.name }}
              </div>
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">Cantidad (opcional)</label>
                  <input type="number" class="form-control" [(ngModel)]="qty" min="0" step="0.01">
                </div>
                <div class="col-6">
                  <label class="form-label">Unidad (opcional)</label>
                  <app-unit-select [(ngModel)]="unit" name="unit"></app-unit-select>
                </div>
              </div>
            }
            <div class="d-flex gap-2 justify-content-end">
              <button class="btn btn-outline-secondary btn-sm" (click)="showAddModal = false">Cancelar</button>
              <button class="btn btn-sabores btn-sm" (click)="addItem()" [disabled]="!selected">Añadir</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { background: #F0FAF4; min-height: 100vh; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .page-title { font-size: 1.75rem; font-weight: 700; color: #1B4332; margin: 0; }
    .page-sub { color: #52796F; margin: 0; font-size: 0.9rem; }
    .btn-sabores { background: #2D6A4F; color: #fff; border: none; border-radius: 10px; padding: 0.6rem 1.2rem; font-weight: 500; }
    .btn-sabores:hover:not(:disabled) { background: #1B4332; color: #fff; }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 1.5rem; }
    .stat-card { background: #fff; border-radius: 12px; border: 1px solid #E9F5EE; padding: 1rem; text-align: center; }
    .stat-num { font-size: 1.75rem; font-weight: 700; color: #2D6A4F; display: block; }
    .stat-label { font-size: 0.8rem; color: #52796F; }
    .pantry-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .pantry-panel { background: #fff; border-radius: 16px; border: 1px solid #E9F5EE; padding: 1.25rem; }
    .panel-title { font-size: 1rem; font-weight: 600; color: #1B4332; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; }
    .empty-panel { text-align: center; padding: 2.5rem 0; color: #52796F; }
    .empty-panel i { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; opacity: 0.4; }
    .pantry-list { list-style: none; padding: 0; margin: 0; }
    .pantry-item { display: flex; align-items: center; gap: 8px; padding: 9px 0; border-bottom: 1px solid #F0FAF4; }
    .pantry-item:last-child { border-bottom: none; }
    .pantry-item-name { flex: 1; font-size: 0.9rem; color: #2D3436; }
    .pantry-item-qty { font-size: 0.8rem; color: #52796F; }
    .remove-btn { background: none; border: none; color: #ccc; cursor: pointer; font-size: 1rem; padding: 0 4px; }
    .remove-btn:hover { color: #e05252; }
    .category-group { margin-bottom: 0.5rem; }
    .category-group:last-child { margin-bottom: 0; }
    .category-header { display: flex; align-items: center; gap: 6px; width: 100%; padding: 7px 8px; border: none; background: #F0FAF4; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
    .category-header:hover { background: #E9F5EE; }
    .category-icon { font-size: 1rem; }
    .category-name { font-size: 0.8rem; font-weight: 600; color: #2D6A4F; text-transform: uppercase; letter-spacing: 0.05em; flex: 1; text-align: left; }
    .category-count { font-size: 0.75rem; color: #52796F; background: #fff; border-radius: 10px; padding: 1px 7px; }
    .category-header .bi { font-size: 0.75rem; color: #52796F; }
    .suggestions-list { display: flex; flex-direction: column; gap: 12px; }
    .suggestion-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #F0FAF4; }
    .suggestion-item:last-child { border-bottom: none; }
    .sug-recipe-info { flex: 1; }
    .sug-title { font-size: 0.9rem; font-weight: 600; color: #1B4332; text-decoration: none; display: block; }
    .sug-title:hover { color: #2D6A4F; }
    .sug-meta { font-size: 0.78rem; color: #52796F; }
    .match-bar-bg { height: 4px; background: #E9F5EE; border-radius: 2px; margin: 5px 0; }
    .match-bar { height: 4px; border-radius: 2px; background: #52B788; transition: width 0.3s; }
    .match-bar.full { background: #2D6A4F; }
    .missing-label { font-size: 0.75rem; color: #e07d52; }
    .sug-btn { font-size: 0.8rem; color: #2D6A4F; border: 1px solid #C8E6C9; border-radius: 6px; padding: 4px 12px; text-decoration: none; white-space: nowrap; }
    .sug-btn:hover { background: #2D6A4F; color: #fff; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-card { background: #fff; border-radius: 16px; padding: 1.75rem; width: 100%; max-width: 440px; position: relative; }
    .modal-title { font-size: 1.1rem; font-weight: 600; color: #1B4332; margin-bottom: 1.25rem; }
    .form-label { font-size: 0.875rem; font-weight: 500; color: #2D6A4F; }
    .form-control { border-color: #C8E6C9; border-radius: 8px; }
    .form-control:focus { border-color: #52B788; box-shadow: 0 0 0 3px rgba(82,183,136,0.15); }
    .search-dropdown { list-style: none; padding: 0; margin: 4px 0 0; border: 1px solid #C8E6C9; border-radius: 8px; overflow: hidden; max-height: 180px; overflow-y: auto; }
    .search-dropdown li { padding: 8px 12px; cursor: pointer; font-size: 0.9rem; color: #2D3436; }
    .search-dropdown li:hover { background: #F0FAF4; }
    .selected-ing { font-size: 0.875rem; color: #1B4332; margin-bottom: 1rem; }

    @media (max-width: 768px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .pantry-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; align-items: flex-start; }
      .page-title { font-size: 1.4rem; }
    }

    @media (max-width: 480px) {
      .stats-row { grid-template-columns: 1fr; }
      .suggestion-item { flex-wrap: wrap; }
      .sug-btn { width: 100%; text-align: center; margin-top: 4px; }
    }
  `]
})
export class PantryComponent implements OnInit {
  private pantryService     = inject(PantryService);
  private ingredientService = inject(IngredientService);

  items                = signal<PantryItem[]>([]);
  suggestions          = signal<RecipeSuggestion[]>([]);
  collapsedCategories  = signal<Set<string>>(new Set(Object.keys(CATEGORY_META)));

  groupedItems = computed(() => {
    const map = new Map<string, PantryItem[]>();
    for (const item of this.items()) {
      const cat = item.ingredient.category ?? 'OTROS';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return [...map.entries()]
      .map(([category, items]) => ({
        category,
        items,
        label: CATEGORY_META[category]?.label ?? category,
        icon:  CATEGORY_META[category]?.icon  ?? '🛒',
        order: CATEGORY_META[category]?.order ?? 99,
      }))
      .sort((a, b) => a.order - b.order);
  });

  showAddModal  = false;
  search        = '';
  searchResults: Ingredient[] = [];
  selected: Ingredient | null = null;
  qty: number | null = null;
  unit = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.pantryService.get().subscribe((data: PantryWithSuggestions) => {
      this.items.set(data.items);
      this.suggestions.set(data.suggestions);
    });
  }

  fullMatches(): number {
    return this.suggestions().filter((s: RecipeSuggestion) => s.matchPercentage === 100).length;
  }

  searchIngredients(): void {
    if (this.search.length < 2) { this.searchResults = []; return; }
    this.ingredientService.search(this.search)
      .subscribe((r: Ingredient[]) => this.searchResults = r);
  }

  selectIngredient(ing: Ingredient): void {
    this.selected = ing; this.search = ing.name; this.searchResults = [];
  }

  addItem(): void {
    if (!this.selected) return;
    this.pantryService.upsert(this.selected.id, this.qty ?? undefined, this.unit || undefined)
      .subscribe(() => {
        this.showAddModal = false;
        this.selected = null; this.search = ''; this.qty = null; this.unit = '';
        this.load();
      });
  }

  toggleCategory(category: string): void {
    this.collapsedCategories.update(set => {
      const next = new Set(set);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  }

  removeItem(item: PantryItem): void {
    this.pantryService.remove(item.ingredient.id).subscribe(() => this.load());
  }
}
