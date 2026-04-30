import { Injectable, signal, computed } from '@angular/core';
import { normalizeUnit, canonicalUnit } from '../utils/unit.util';

export interface CartItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  checked: boolean;
  category?: string;
}

const STORAGE_KEY = 'sabores_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<CartItem[]>(this.load());

  readonly all = this.items.asReadonly();
  readonly pendingCount = computed(() => this.items().filter(i => !i.checked).length);

  add(name: string, quantity: string, unit: string, category?: string): void {
    const normName = name.trim().toLowerCase();
    const incomingCanonical = canonicalUnit(unit);

    const existing = this.items().find(i => {
      if (i.name.toLowerCase() !== normName) return false;
      if (canonicalUnit(i.unit) === incomingCanonical) return true;
      // Agrupar peso/volumen cross-unit (g+kg, ml+l+cucharadas…)
      const en = normalizeUnit(i.unit);
      const nn = normalizeUnit(unit);
      return !!en && !!nn
        && en.group === nn.group
        && (en.group === 'weight' || en.group === 'volume');
    });

    if (existing) {
      const existingQty = parseFloat(existing.quantity);
      const newQty = parseFloat(quantity);
      if (!isNaN(existingQty) && !isNaN(newQty)) {
        const rn = normalizeUnit(existing.unit);
        const pn = normalizeUnit(unit);
        let sum: number;
        if (rn && pn && rn.group === pn.group && rn.group !== 'other') {
          sum = (existingQty * rn.toBase + newQty * pn.toBase) / rn.toBase;
        } else {
          sum = existingQty + newQty;
        }
        const sumStr = Number.isInteger(sum) ? String(sum) : sum.toFixed(2).replace(/\.?0+$/, '');
        // Canonicalizar la unidad existente al actualizar
        const storedUnit = rn?.canonical ?? canonicalUnit(existing.unit);
        this.update(this.items().map(i => i.id === existing.id ? { ...i, quantity: sumStr, unit: storedUnit } : i));
        return;
      }
    }

    this.update([...this.items(), {
      id: crypto.randomUUID(),
      name: name.trim(),
      quantity: CartService.round2(quantity),
      unit: incomingCanonical,
      checked: false,
      category: category?.toUpperCase()
    }]);
  }

  toggle(id: string): void {
    this.update(this.items().map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  }

  remove(id: string): void {
    this.update(this.items().filter(i => i.id !== id));
  }

  clearChecked(): void {
    this.update(this.items().filter(i => !i.checked));
  }

  clearAll(): void {
    this.update([]);
  }

  toggleAllChecked(): void {
    const allChecked = this.items().every(i => i.checked);
    this.update(this.items().map(i => ({ ...i, checked: !allChecked })));
  }

  toggleCategoryChecked(category: string): void {
    const categoryItems = this.items().filter(i => {
      const cat = i.category?.toUpperCase() ?? 'OTROS';
      return (cat === category) || (category === 'OTROS' && !i.category);
    });
    const allChecked = categoryItems.every(i => i.checked);
    const ids = new Set(categoryItems.map(i => i.id));
    this.update(this.items().map(i => ids.has(i.id) ? { ...i, checked: !allChecked } : i));
  }

  private static round2(qty: string): string {
    const n = parseFloat(qty);
    if (isNaN(n)) return qty.trim();
    const r = Math.round(n * 100) / 100;
    return Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/\.?0+$/, '');
  }

  private update(items: CartItem[]): void {
    this.items.set(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  private load(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }
}
