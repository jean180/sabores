import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CartService, CartItem } from '../../core/services/cart.service';
import { PantryService } from '../../core/services/pantry.service';
import { AuthService } from '../../core/services/auth.service';
import { IngredientService } from '../../core/services/ingredient.service';
import { UnitSelectComponent } from '../../shared/components/unit-select/unit-select.component';
import { Ingredient } from '../../core/models/models';

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

interface CartGroup {
  category: string;
  label: string;
  icon: string;
  order: number;
  items: CartItem[];
}

interface ModalItem {
  cartId: string;
  name: string;
  qty: string;
  unit: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FormsModule, UnitSelectComponent],
  template: `
    <div class="cart-page">
      <div class="container py-4">

        <!-- Header -->
        <div class="page-header mb-4">
          <div>
            <h1 class="page-title"><i class="bi bi-cart3 me-2"></i>Lista de la compra</h1>
            <p class="page-subtitle">Anota los ingredientes que necesitas comprar</p>
          </div>
          @if (cart.all().length > 0) {
            <div class="header-actions">
              <button class="btn btn-check-all btn-sm" (click)="cart.toggleAllChecked()">
                @if (allChecked()) {
                  <i class="bi bi-circle me-1"></i>Desmarcar todos
                } @else {
                  <i class="bi bi-check2-circle me-1"></i>Marcar todos
                }
              </button>
              @if (checkedCount() > 0 && auth.isLoggedIn()) {
                <button class="btn btn-pantry btn-sm" (click)="openPantryModal()">
                  <i class="bi bi-basket-fill me-1"></i>Despensa ({{ checkedCount() }})
                </button>
              }
              @if (checkedCount() > 0) {
                <button class="btn btn-outline-secondary btn-sm" (click)="cart.clearChecked()">
                  <i class="bi bi-check2-all me-1"></i>Eliminar marcados
                </button>
              }
              <button class="btn btn-print btn-sm" (click)="printList()">
                <i class="bi bi-printer me-1"></i>Imprimir
              </button>
              <button class="btn btn-outline-danger btn-sm" (click)="confirmClear()">
                <i class="bi bi-trash me-1"></i>Vaciar lista
              </button>
            </div>
          }
        </div>

        <!-- Add item form -->
        <div class="add-form-card mb-4">
          <h6 class="form-section-title"><i class="bi bi-plus-circle me-2"></i>Añadir ingrediente</h6>
          <form class="add-form" (ngSubmit)="addItem()">
            <div class="form-row">
              <div class="form-group flex-grow-1">
                <label class="form-label">Ingrediente</label>
                <input type="text" class="form-control" placeholder="ej. Tomates, Harina, Leche…"
                  [(ngModel)]="newName" name="name" autocomplete="off"/>
              </div>
              <div class="form-group qty-field">
                <label class="form-label">Cantidad</label>
                <input type="number" class="form-control" placeholder="ej. 500"
                  [(ngModel)]="newQty" name="qty" min="0.01" step="0.01"/>
              </div>
              <div class="form-group unit-field">
                <label class="form-label">Unidad</label>
                <app-unit-select [(ngModel)]="newUnit" name="unit"></app-unit-select>
              </div>
              <div class="form-group btn-group-add">
                <label class="form-label invisible">Añadir</label>
                <button type="submit" class="btn btn-primary-add w-100" [disabled]="!newName.trim()">
                  <i class="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Stats bar -->
        @if (cart.all().length > 0) {
          <div class="stats-bar mb-3">
            <span class="stat-chip">
              <i class="bi bi-list-ul me-1"></i>{{ cart.all().length }} artículos
            </span>
            <span class="stat-chip pending">
              <i class="bi bi-circle me-1"></i>{{ cart.pendingCount() }} pendientes
            </span>
            @if (checkedCount() > 0) {
              <span class="stat-chip done">
                <i class="bi bi-check-circle me-1"></i>{{ checkedCount() }} cogidos
              </span>
            }
          </div>
        }

        <!-- Item list -->
        @if (cart.all().length === 0) {
          <div class="empty-state">
            <i class="bi bi-cart-x"></i>
            <p>Tu lista está vacía</p>
            <span>Añade ingredientes usando el formulario de arriba</span>
          </div>
        } @else {
          @for (group of groupedItems(); track group.category) {
            <div class="category-group mb-2">
              <div class="category-header">
                <button class="category-header-main" (click)="toggleCategory(group.category)"
                  [attr.aria-expanded]="!collapsedCategories().has(group.category)">
                  <span class="category-icon">{{ group.icon }}</span>
                  <span class="category-name">{{ group.label }}</span>
                  <span class="category-count">{{ group.items.length }}</span>
                </button>
                <button class="btn-check-cat"
                  [class.all-checked]="isCategoryAllChecked(group.category)"
                  (click)="cart.toggleCategoryChecked(group.category)"
                  [title]="isCategoryAllChecked(group.category) ? 'Desmarcar categoría' : 'Marcar categoría'">
                  <i class="bi" [class.bi-check2-circle]="!isCategoryAllChecked(group.category)"
                     [class.bi-circle]="isCategoryAllChecked(group.category)"></i>
                </button>
                <button class="category-chevron" (click)="toggleCategory(group.category)">
                  <i class="bi"
                     [class.bi-chevron-down]="collapsedCategories().has(group.category)"
                     [class.bi-chevron-up]="!collapsedCategories().has(group.category)"></i>
                </button>
              </div>
              @if (!collapsedCategories().has(group.category)) {
                <div class="items-list">
                  @for (item of group.items; track item.id) {
                    <div class="item-row" [class.checked]="item.checked">
                      <button class="check-btn" (click)="cart.toggle(item.id)">
                        <i class="bi" [class.bi-circle]="!item.checked" [class.bi-check-circle-fill]="item.checked"></i>
                      </button>
                      <span class="item-name">{{ item.name }}</span>
                      <span class="item-qty">
                        @if (item.quantity) { {{ item.quantity }} }
                        @if (item.unit) { <em>{{ item.unit }}</em> }
                      </span>
                      <button class="remove-btn" (click)="cart.remove(item.id)">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          }
        }

      </div>
    </div>

    <!-- Vista solo impresión -->
    <div class="print-sheet">
      <div class="print-header">
        <div class="print-logo">🛒</div>
        <div>
          <h1 class="print-title">Lista de la compra</h1>
          <p class="print-date">{{ printDate() }}</p>
        </div>
      </div>
      @for (group of groupedItems(); track group.category) {
        <div class="print-category">
          <div class="print-category-header">
            <span>{{ group.icon }} {{ group.label }}</span>
          </div>
          <table class="print-table">
            <tbody>
              @for (item of group.items; track item.id) {
                <tr>
                  <td class="col-check"><span class="print-checkbox"></span></td>
                  <td class="col-name">{{ item.name }}</td>
                  <td class="col-qty">
                    @if (item.quantity) { {{ item.quantity }} }
                    @if (item.unit) { {{ item.unit }} }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
      <p class="print-footer">Generado con Sabores · {{ printDate() }}</p>
    </div>

    <!-- Modal: Agregar a despensa -->
    @if (showModal()) {
      <div class="modal-backdrop" (click)="showModal.set(false)">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header-row">
            <div>
              <h3 class="modal-title"><i class="bi bi-basket-fill me-2"></i>Agregar a despensa</h3>
              <p class="modal-subtitle">Ajusta las cantidades reales que has comprado</p>
            </div>
            <button class="modal-close" (click)="showModal.set(false)">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="modal-body">
            @for (item of modalItems; track item.cartId; let i = $index) {
              <div class="modal-item-row">
                <span class="modal-item-name">{{ item.name }}</span>
                <input type="number" class="form-control form-control-sm modal-qty"
                  [(ngModel)]="modalItems[i].qty" [name]="'qty_' + i"
                  min="0" step="0.01" placeholder="Cant.">
                <app-unit-select selectClass="form-select form-select-sm modal-unit"
                  [(ngModel)]="modalItems[i].unit" [name]="'unit_' + i"></app-unit-select>
              </div>
            }
          </div>

          @if (pantryError()) {
            <p class="modal-error"><i class="bi bi-exclamation-circle me-1"></i>{{ pantryError() }}</p>
          }

          <div class="modal-footer-row">
            <button class="btn btn-outline-secondary btn-sm" (click)="showModal.set(false)" [disabled]="pantryLoading()">
              Cancelar
            </button>
            <button class="btn btn-pantry btn-sm" (click)="confirmAddToPantry()" [disabled]="pantryLoading()">
              @if (pantryLoading()) {
                <span class="spinner-border spinner-border-sm me-1"></span>Guardando…
              } @else {
                <i class="bi bi-basket-fill me-1"></i>Agregar a despensa
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .cart-page {
      min-height: 100vh;
      background: var(--color-bg, #F0FAF4);
      padding-top: 70px;
    }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .page-title { font-size: 1.6rem; font-weight: 700; color: var(--color-text, #1B4332); margin: 0; }
    .page-subtitle { color: var(--color-muted, #52796F); margin: 0.25rem 0 0; font-size: 0.9rem; }
    .header-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }

    .btn-pantry { background: #2D6A4F; color: #fff; border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 500; }
    .btn-pantry:hover:not(:disabled) { background: #1B4332; color: #fff; }
    .btn-pantry:disabled { opacity: 0.65; }

    .add-form-card { background: #fff; border-radius: 14px; padding: 1.25rem 1.5rem; box-shadow: 0 1px 6px rgba(0,0,0,0.06); border: 1px solid var(--color-border, #E9F5EE); }
    .form-section-title { font-weight: 600; color: var(--color-text, #1B4332); margin-bottom: 1rem; }
    .form-row { display: flex; gap: 0.75rem; align-items: flex-end; flex-wrap: wrap; }
    .form-group { display: flex; flex-direction: column; }
    .form-label { font-size: 0.8rem; color: var(--color-muted, #52796F); margin-bottom: 0.3rem; font-weight: 500; }
    .qty-field { width: 100px; }
    .unit-field { width: 130px; }
    .btn-group-add { width: 48px; }
    .form-control, .form-select { border: 1px solid #D1E8D9; border-radius: 8px; font-size: 0.9rem; color: var(--color-text, #1B4332); background: #FAFFFE; }
    .form-control:focus, .form-select:focus { border-color: #52B788; box-shadow: 0 0 0 3px rgba(82,183,136,0.15); outline: none; }
    .btn-primary-add { background: #2D6A4F; border: none; color: #fff; border-radius: 8px; font-size: 1.1rem; padding: 0.45rem; transition: background 0.15s; }
    .btn-primary-add:hover:not(:disabled) { background: #1B4332; }
    .btn-primary-add:disabled { opacity: 0.5; cursor: not-allowed; }

    .stats-bar { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .stat-chip { font-size: 0.8rem; font-weight: 500; padding: 0.3rem 0.75rem; border-radius: 20px; background: #E9F5EE; color: var(--color-muted, #52796F); }
    .stat-chip.pending { background: #FFF8E1; color: #7d6a00; }
    .stat-chip.done { background: #D8F3DC; color: #2D6A4F; }

    .items-list { background: #fff; border-radius: 14px; box-shadow: 0 1px 6px rgba(0,0,0,0.06); border: 1px solid var(--color-border, #E9F5EE); overflow: hidden; }
    .item-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1.25rem; border-bottom: 1px solid #F0FAF4; transition: background 0.1s; }
    .item-row:last-child { border-bottom: none; }
    .item-row:hover { background: #FAFFFE; }
    .item-row.checked { opacity: 0.55; }
    .item-row.checked .item-name { text-decoration: line-through; }
    .check-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #52B788; padding: 0; line-height: 1; flex-shrink: 0; transition: color 0.15s, transform 0.1s; }
    .check-btn:hover { color: #2D6A4F; transform: scale(1.1); }
    .item-name { flex: 1; font-size: 0.95rem; color: var(--color-text, #1B4332); font-weight: 500; }
    .item-qty { font-size: 0.85rem; color: var(--color-muted, #52796F); white-space: nowrap; }
    .item-qty em { font-style: normal; margin-left: 2px; }
    .remove-btn { background: none; border: none; cursor: pointer; font-size: 1.1rem; color: #adb5bd; padding: 0; line-height: 1; flex-shrink: 0; transition: color 0.15s; }
    .remove-btn:hover { color: #dc3545; }
    .category-group { border-radius: 14px; overflow: hidden; border: 1px solid var(--color-border, #E9F5EE); }
    .category-header {
      width: 100%; display: flex; align-items: center;
      background: #F0FAF4; transition: background 0.15s;
    }
    .category-header:has(.category-header-main:hover) { background: #D8F3DC; }
    .category-header-main {
      flex: 1; display: flex; align-items: center; gap: 0.6rem;
      padding: 0.75rem 0.75rem 0.75rem 1.25rem; background: none; border: none; cursor: pointer;
      font-size: 0.9rem; font-weight: 600; color: var(--color-text, #1B4332); text-align: left;
    }
    .category-icon { font-size: 1.1rem; line-height: 1; }
    .category-name { flex: 1; }
    .category-count { background: #fff; color: #2D6A4F; border-radius: 20px; padding: 1px 8px; font-size: 0.75rem; font-weight: 600; border: 1px solid #C8E6C9; }
    .btn-check-cat {
      background: none; border: none; cursor: pointer; padding: 0.75rem 0.5rem;
      font-size: 1.05rem; color: #52B788; line-height: 1; flex-shrink: 0; transition: color 0.15s;
    }
    .btn-check-cat:hover { color: #2D6A4F; }
    .btn-check-cat.all-checked { color: #2D6A4F; }
    .category-chevron {
      background: none; border: none; cursor: pointer; padding: 0.75rem 1rem 0.75rem 0.5rem;
      font-size: 0.85rem; color: #52796F; line-height: 1; flex-shrink: 0;
    }
    .category-group .items-list { border-radius: 0; border: none; box-shadow: none; }

    .empty-state { text-align: center; padding: 4rem 1rem; color: var(--color-muted, #52796F); }
    .empty-state i { font-size: 3.5rem; display: block; margin-bottom: 1rem; opacity: 0.4; }
    .empty-state p { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.25rem; color: var(--color-text, #1B4332); }
    .empty-state span { font-size: 0.9rem; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 1rem; }
    .modal-card { background: #fff; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); display: flex; flex-direction: column; max-height: 90vh; }
    .modal-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1.5rem 1.5rem 1rem; border-bottom: 1px solid #E9F5EE; }
    .modal-title { font-size: 1.1rem; font-weight: 700; color: #1B4332; margin: 0; }
    .modal-subtitle { font-size: 0.82rem; color: #52796F; margin: 0.2rem 0 0; }
    .modal-close { background: none; border: none; font-size: 1rem; color: #adb5bd; cursor: pointer; padding: 0; flex-shrink: 0; }
    .modal-close:hover { color: #495057; }
    .modal-body { padding: 1rem 1.5rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 0.6rem; }
    .modal-item-row { display: flex; align-items: center; gap: 0.6rem; }
    .modal-item-name { flex: 1; font-size: 0.9rem; font-weight: 500; color: #1B4332; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .modal-qty { width: 80px; flex-shrink: 0; }
    .modal-unit { width: 130px; flex-shrink: 0; }
    .modal-error { margin: 0 1.5rem; font-size: 0.82rem; color: #dc3545; }
    .modal-footer-row { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 1rem 1.5rem; border-top: 1px solid #E9F5EE; }

    .btn-check-all { background: #F0FAF4; color: #2D6A4F; border: 1px solid #C8E6C9; border-radius: 8px; font-size: 0.85rem; font-weight: 500; }
    .btn-check-all:hover { background: #D8F3DC; color: #1B4332; }
    .btn-print { background: #fff; color: #2D6A4F; border: 1px solid #52B788; border-radius: 8px; font-size: 0.85rem; font-weight: 500; }
    .btn-print:hover { background: #F0FAF4; color: #1B4332; }

    /* Oculta en pantalla; los estilos de impresión van en styles.scss global */
    .print-sheet { display: none; }

    @media (max-width: 768px) {
      .page-title { font-size: 1.35rem; }
      .header-actions { gap: 0.35rem; }
      .header-actions .btn { font-size: 0.78rem; padding: 0.35rem 0.6rem; }
      .modal-card { max-width: 100%; border-radius: 12px; }
    }

    @media (max-width: 576px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
      .header-actions { flex-wrap: wrap; width: 100%; }
      .header-actions .btn { flex: 1 1 auto; justify-content: center; font-size: 0.8rem; }
      .form-row { flex-direction: column; }
      .qty-field { width: 100%; }
      .unit-field { width: 100%; }
      .btn-group-add { width: 100%; }
      .btn-primary-add { width: 100% !important; font-size: 1rem; padding: 0.55rem; }
      .modal-item-row { flex-wrap: wrap; }
      .modal-item-name { width: 100%; white-space: normal; min-width: 0; }
      .modal-qty { width: 90px; }
      .modal-unit { width: calc(100% - 100px); }
      .item-name { font-size: 0.88rem; }
      .item-qty { font-size: 0.78rem; }
    }
  `]
})
export class CartComponent {
  cart              = inject(CartService);
  auth              = inject(AuthService);
  pantryService     = inject(PantryService);
  ingredientService = inject(IngredientService);

  newName = '';
  newQty  = '';
  newUnit = '';

  showModal    = signal(false);
  pantryLoading = signal(false);
  pantryError  = signal('');
  modalItems: ModalItem[] = [];

  checkedItems     = computed(() => this.cart.all().filter(i => i.checked));
  checkedCount     = computed(() => this.checkedItems().length);
  allChecked       = computed(() => this.cart.all().length > 0 && this.cart.all().every(i => i.checked));
  collapsedCategories = signal<Set<string>>(new Set());

  isCategoryAllChecked(category: string): boolean {
    const group = this.groupedItems().find(g => g.category === category);
    return !!group && group.items.length > 0 && group.items.every(i => i.checked);
  }

  groupedItems = computed<CartGroup[]>(() => {
    const map = new Map<string, CartItem[]>();
    for (const item of this.cart.all()) {
      const cat = item.category?.toUpperCase() ?? 'OTROS';
      const key = CATEGORY_META[cat] ? cat : 'OTROS';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return [...map.entries()]
      .map(([category, items]) => ({
        category,
        items,
        ...(CATEGORY_META[category] ?? CATEGORY_META['OTROS'])
      }))
      .sort((a, b) => a.order - b.order);
  });

  toggleCategory(cat: string): void {
    this.collapsedCategories.update(s => {
      const next = new Set(s);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  addItem(): void {
    if (!this.newName.trim()) return;
    this.cart.add(this.newName, this.newQty, this.newUnit);
    this.newName = '';
    this.newQty  = '';
    this.newUnit = '';
  }

  openPantryModal(): void {
    this.modalItems = this.checkedItems().map(item => ({
      cartId: item.id,
      name:   item.name,
      qty:    item.quantity,
      unit:   item.unit
    }));
    this.pantryError.set('');
    this.showModal.set(true);
  }

  async confirmAddToPantry(): Promise<void> {
    this.pantryLoading.set(true);
    this.pantryError.set('');
    let added = 0;

    for (const item of this.modalItems) {
      try {
        const results = await firstValueFrom(
          this.ingredientService.search(item.name)
        );
        const ingredient = results.find(r => r.name.toLowerCase() === item.name.toLowerCase())
                        ?? results[0];
        if (!ingredient) continue;

        const qty = parseFloat(item.qty);
        await firstValueFrom(
          this.pantryService.upsert(ingredient.id, isNaN(qty) ? undefined : qty, item.unit || undefined)
        );
        this.cart.remove(item.cartId);
        added++;
      } catch {
        // ingrediente no encontrado o error puntual, se omite
      }
    }

    this.pantryLoading.set(false);
    if (added === 0) {
      this.pantryError.set('No se encontraron los ingredientes en la base de datos.');
    } else {
      this.showModal.set(false);
    }
  }

  confirmClear(): void {
    if (confirm('¿Vaciar toda la lista de la compra?')) {
      this.cart.clearAll();
    }
  }

  printList(): void {
    window.print();
  }

  printDate(): string {
    return new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
