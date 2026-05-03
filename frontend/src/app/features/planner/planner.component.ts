import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { MealPlanEntry, WeeklyPlan, RecipeSummary } from '../../core/models/models';
import { MealPlanService } from '../../core/services/meal-plan.service';
import { RecipeService } from '../../core/services/recipe.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { PantryService } from '../../core/services/pantry.service';
import { missingQty } from '../../core/utils/unit.util';

type MealType = 'DESAYUNO' | 'ALMUERZO' | 'COMIDA' | 'MERIENDA' | 'CENA';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <div class="container py-4">
        <div class="page-header">
          <h1 class="page-title"><i class="bi bi-calendar3 me-2"></i>Planificador semanal</h1>
          <div class="week-nav">
            <button class="nav-btn" (click)="changeWeek(-1)"><i class="bi bi-chevron-left"></i></button>
            <span class="week-label">{{ weekLabel() }}</span>
            <button class="nav-btn" (click)="changeWeek(1)"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>

        @if (loading()) {
          <div class="d-flex justify-content-center py-5">
            <div class="spinner-border text-success"></div>
          </div>
        } @else {
          <div class="planner-scroll-wrapper">
          <div class="planner-grid">
            <div class="meal-col-label"></div>
            @for (day of weekDays(); track day.iso) {
              <div class="day-header" [class.today]="day.isToday">
                <span class="day-name">{{ day.name }}</span>
                <span class="day-num">{{ day.num }}</span>
              </div>
            }
            @for (meal of mealTypes; track meal.key) {
              <div class="meal-col-label">
                <i class="bi" [class]="meal.icon"></i>
                <span>{{ meal.label }}</span>
              </div>
              @for (day of weekDays(); track day.iso) {
                <div class="planner-cell" [class.today-col]="day.isToday">
                  @if (getEntry(day.iso, meal.key); as entry) {
                    <div class="cell-filled">
                      <a [routerLink]="['/recipes', entry.recipe.id]" class="cell-recipe-name">
                        {{ entry.recipe.title }}
                      </a>
                      <span class="cell-time">{{ entry.recipe.prepTime }} min</span>
                      <button class="cell-remove" (click)="removeEntry(day.iso, meal.key)">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  } @else {
                    <button class="cell-add" (click)="openAdd(day.iso, meal.key)">
                      <i class="bi bi-plus"></i>
                    </button>
                  }
                </div>
              }
            }
          </div>
          </div>

          <div class="week-summary">
            <div class="sum-item">
              <span class="sum-num">{{ plannedCount() }}</span>
              <span class="sum-label">comidas planificadas</span>
            </div>
            <div class="sum-item">
              <span class="sum-num">{{ emptySlots() }}</span>
              <span class="sum-label">huecos libres</span>
            </div>
            @if (plannedCount() > 0) {
              <div class="sum-cart-action">
                @if (cartFeedback()) {
                  <div class="cart-feedback-inline">
                    <i class="bi bi-check-circle-fill me-1"></i>{{ cartFeedback() }}
                  </div>
                } @else {
                  <button class="btn btn-add-to-cart" (click)="addWeekToCart()" [disabled]="cartLoading()">
                    @if (cartLoading()) {
                      <span class="spinner-border spinner-border-sm me-1"></span>Cargando…
                    } @else {
                      <i class="bi bi-cart-plus me-1"></i>Añadir ingredientes al carrito
                    }
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>

      @if (addModal) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <h3 class="modal-title">Añadir al planificador</h3>
            <p class="modal-sub">{{ addingDate }} · {{ mealLabel(addingMeal) }}</p>
            <div class="recipe-search-wrapper">
              <input
                type="text"
                class="form-control mb-1"
                [(ngModel)]="recipeSearch"
                (input)="onRecipeSearch()"
                placeholder="Buscar receta..."
                autocomplete="off">
              @if (recipeSearchResults.length > 0) {
                <ul class="search-dropdown">
                  @for (r of recipeSearchResults; track r.id) {
                    <li (click)="selectRecipe(r)">{{ r.title }}</li>
                  }
                </ul>
              }
            </div>
            <div class="d-flex gap-2 justify-content-end mt-3">
              <button class="btn btn-outline-secondary btn-sm" (click)="closeModal()">Cancelar</button>
              <button class="btn btn-sabores btn-sm" [disabled]="!selectedRecipe" (click)="confirmAdd()">Añadir</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { background: #F0FAF4; min-height: 100vh; }
    .page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
    .page-title { font-size: 1.75rem; font-weight: 700; color: #1B4332; margin: 0; }
    .week-nav { display: flex; align-items: center; gap: 10px; }
    .nav-btn { background: #fff; border: 1px solid #C8E6C9; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #2D6A4F; }
    .nav-btn:hover { background: #2D6A4F; color: #fff; }
    .week-label { font-size: 0.9rem; font-weight: 500; color: #1B4332; min-width: 160px; text-align: center; }
    .planner-scroll-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 1.5rem; }
    .planner-grid { display: grid; grid-template-columns: 70px repeat(7, minmax(90px, 1fr)); gap: 4px; min-width: 700px; }
    .day-header { text-align: center; padding: 8px 4px; }
    .day-name { display: block; font-size: 0.75rem; font-weight: 600; color: #2D6A4F; text-transform: uppercase; letter-spacing: 0.5px; }
    .day-num { display: block; font-size: 0.85rem; color: #52796F; }
    .day-header.today .day-name, .day-header.today .day-num { color: #1B4332; font-weight: 700; }
    .meal-col-label { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6px; font-size: 0.72rem; color: #52796F; gap: 3px; }
    .meal-col-label i { font-size: 1rem; color: #52B788; }
    .planner-cell { background: #fff; border-radius: 10px; border: 1px solid #E9F5EE; min-height: 60px; display: flex; align-items: center; justify-content: center; position: relative; }
    .planner-cell.today-col { border-color: #52B788; border-width: 1.5px; }
    .cell-filled { padding: 8px; width: 100%; }
    .cell-recipe-name { font-size: 0.78rem; font-weight: 500; color: #1B4332; text-decoration: none; display: block; line-height: 1.3; margin-bottom: 3px; }
    .cell-recipe-name:hover { color: #2D6A4F; }
    .cell-time { font-size: 0.7rem; color: #52796F; }
    .cell-remove { position: absolute; top: 4px; right: 4px; background: none; border: none; color: #ccc; cursor: pointer; font-size: 0.85rem; padding: 0; }
    .cell-remove:hover { color: #e05252; }
    .cell-add { background: none; border: none; color: #C8E6C9; cursor: pointer; font-size: 1.5rem; width: 100%; min-height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 10px; }
    .cell-add:hover { background: #F0FAF4; color: #2D6A4F; }
    .week-summary { background: #fff; border-radius: 14px; border: 1px solid #E9F5EE; padding: 1rem 1.5rem; display: flex; align-items: center; gap: 2rem; flex-wrap: wrap; }
    .sum-item { text-align: center; }
    .sum-num { font-size: 1.5rem; font-weight: 700; color: #2D6A4F; display: block; }
    .sum-label { font-size: 0.78rem; color: #52796F; }
    .sum-cart-action { margin-left: auto; }
    .btn-add-to-cart { background: #2D6A4F; color: #fff; border: none; border-radius: 10px; padding: 0.55rem 1.1rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; transition: background 0.15s; }
    .btn-add-to-cart:hover:not(:disabled) { background: #1B4332; }
    .btn-add-to-cart:disabled { opacity: 0.6; cursor: not-allowed; }
    .cart-feedback-inline { background: #D8F3DC; color: #1B4332; border-radius: 10px; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-card { background: #fff; border-radius: 16px; padding: 1.75rem; width: 100%; max-width: 400px; }
    .modal-title { font-size: 1.1rem; font-weight: 600; color: #1B4332; margin-bottom: 0.25rem; }
    .modal-sub { font-size: 0.875rem; color: #52796F; margin-bottom: 1rem; }
    .form-control { border-color: #C8E6C9; border-radius: 8px; }
    .form-control:focus { border-color: #52B788; box-shadow: 0 0 0 3px rgba(82,183,136,0.15); }
    .btn-sabores { background: #2D6A4F; color: #fff; border: none; border-radius: 8px; padding: 0.5rem 1rem; }
    .btn-sabores:hover { background: #1B4332; color: #fff; }
    .btn-sabores:disabled { background: #a0c4b0; cursor: not-allowed; }
    .recipe-search-wrapper { position: relative; }
    .search-dropdown { position: absolute; top: 100%; left: 0; right: 0; z-index: 100; list-style: none; padding: 0; margin: 0; background: #fff; border: 1px solid #C8E6C9; border-radius: 8px; max-height: 180px; overflow-y: auto; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
    .search-dropdown li { padding: 8px 12px; font-size: 0.875rem; cursor: pointer; color: #1B4332; }
    .search-dropdown li:hover { background: #F0FAF4; }

    @media (max-width: 768px) {
      .page-title { font-size: 1.4rem; }
      .week-label { min-width: 120px; font-size: 0.8rem; }
      .week-summary { gap: 1rem; padding: 0.75rem 1rem; }
      .sum-cart-action { margin-left: 0; width: 100%; }
      .btn-add-to-cart { width: 100%; justify-content: center; }
    }

    @media (max-width: 480px) {
      .page-header { flex-direction: column; align-items: flex-start; }
      .sum-num { font-size: 1.25rem; }
    }
  `]
})
export class PlannerComponent implements OnInit {
  private mealPlanService = inject(MealPlanService);
  private recipeService   = inject(RecipeService);
  private cartService     = inject(CartService);
  private pantryService   = inject(PantryService);
  auth                    = inject(AuthService);

  plan    = signal<WeeklyPlan>({ meals: [] });
  loading = signal(true);
  cartLoading  = signal(false);
  cartFeedback = signal('');
  weekStart = this.getMonday(new Date());

  addModal       = false;
  addingDate     = '';
  addingMeal: MealType = 'COMIDA';
  recipeSearch        = '';
  selectedRecipe: RecipeSummary | null = null;
  recipeSearchResults: RecipeSummary[] = [];

  mealTypes: { key: MealType; label: string; icon: string }[] = [
    { key: 'DESAYUNO',  label: 'Desayuno', icon: 'bi-sun'             },
    { key: 'ALMUERZO',  label: 'Almuerzo', icon: 'bi-cup-hot'         },
    { key: 'COMIDA',    label: 'Comida',   icon: 'bi-fire'            },
    { key: 'MERIENDA',  label: 'Merienda', icon: 'bi-cake2'           },
    { key: 'CENA',      label: 'Cena',     icon: 'bi-moon-stars'      },
  ];

  ngOnInit(): void { this.loadWeek(); }

  loadWeek(): void {
    this.loading.set(true);
    this.mealPlanService.getWeek(this.isoDate(this.weekStart)).subscribe((plan: WeeklyPlan) => {
      this.plan.set(plan);
      this.loading.set(false);
    });
  }

  changeWeek(delta: number): void {
    const d = new Date(this.weekStart);
    d.setDate(d.getDate() + delta * 7);
    this.weekStart = d;
    this.loadWeek();
  }

  weekDays(): { iso: string; name: string; num: string; isToday: boolean }[] {
    const today = this.isoDate(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart);
      d.setDate(d.getDate() + i);
      return {
        iso: this.isoDate(d),
        name: d.toLocaleDateString('es-ES', { weekday: 'short' }),
        num: String(d.getDate()),
        isToday: this.isoDate(d) === today
      };
    });
  }

  weekLabel(): string {
    const end = new Date(this.weekStart);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    return `${fmt(this.weekStart)} – ${fmt(end)}`;
  }

  getEntry(date: string, mealType: MealType): MealPlanEntry | undefined {
    return this.plan().meals.find((m: MealPlanEntry) => m.planDate === date && m.mealType === mealType);
  }

  plannedCount(): number { return this.plan().meals.length; }
  emptySlots(): number   { return 35 - this.plannedCount(); }

  mealLabel(key: MealType): string {
    return this.mealTypes.find(m => m.key === key)?.label ?? '';
  }

  openAdd(date: string, meal: MealType): void {
    this.addingDate = date;
    this.addingMeal = meal;
    this.recipeSearch = '';
    this.selectedRecipe = null;
    this.recipeSearchResults = [];
    this.addModal = true;
  }

  closeModal(): void {
    this.addModal = false;
    this.recipeSearchResults = [];
  }

  onRecipeSearch(): void {
    this.selectedRecipe = null;
    if (this.recipeSearch.length < 2) { this.recipeSearchResults = []; return; }
    this.recipeService.search({ search: this.recipeSearch, size: 6 })
      .subscribe(res => this.recipeSearchResults = res.content);
  }

  selectRecipe(recipe: RecipeSummary): void {
    this.selectedRecipe = recipe;
    this.recipeSearch = recipe.title;
    this.recipeSearchResults = [];
  }

  confirmAdd(): void {
    if (!this.selectedRecipe) return;
    this.mealPlanService.upsert(this.addingDate, this.addingMeal, this.selectedRecipe.id)
      .subscribe(() => { this.closeModal(); this.loadWeek(); });
  }

  removeEntry(date: string, mealType: MealType): void {
    this.mealPlanService.remove(date, mealType).subscribe(() => this.loadWeek());
  }

  async addWeekToCart(): Promise<void> {
    this.cartLoading.set(true);

    // IDs únicos de recetas planificadas esta semana
    const recipeIds = [...new Set(this.plan().meals.map(m => m.recipe.id))];

    // Cargar detalles de todas las recetas en paralelo
    const details = await Promise.all(
      recipeIds.map(id => firstValueFrom(this.recipeService.getById(id)))
    );

    // Cargar despensa si el usuario está autenticado
    let pantryItems: { name: string; qty: number | null; unit: string | null }[] = [];
    if (this.auth.isLoggedIn()) {
      try {
        const pantry = await firstValueFrom(this.pantryService.get());
        pantryItems = pantry.items.map(i => ({
          name: i.ingredient.name.toLowerCase(),
          qty:  i.quantity,
          unit: i.unit
        }));
      } catch { /* continuar sin despensa */ }
    }

    let added = 0;
    for (const recipe of details) {
      for (const ri of recipe.ingredients) {
        const pantry = pantryItems.find(p => p.name === ri.ingredient.name.toLowerCase());
        const missing = missingQty(ri.quantity, ri.unit, pantry?.qty ?? null, pantry?.unit ?? null);
        // Si está en despensa y cubre la cantidad, omitir
        if (this.auth.isLoggedIn() && missing === null) continue;
        const qty  = (this.auth.isLoggedIn() && missing) ? String(missing.quantity) : String(ri.quantity);
        const unit = (this.auth.isLoggedIn() && missing) ? missing.unit : ri.unit;
        this.cartService.add(ri.ingredient.name, qty, unit, ri.ingredient.category);
        added++;
      }
    }

    this.cartLoading.set(false);
    const msg = added === 0
      ? '¡Ya tienes todos los ingredientes en la despensa!'
      : `${added} ingrediente${added !== 1 ? 's' : ''} añadido${added !== 1 ? 's' : ''} al carrito`;
    this.cartFeedback.set(msg);
    setTimeout(() => this.cartFeedback.set(''), 4000);
  }

  private getMonday(d: Date): Date {
    const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(new Date(d).setDate(diff));
  }

  private isoDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
