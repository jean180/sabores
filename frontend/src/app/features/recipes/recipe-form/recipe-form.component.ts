import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Category, Ingredient } from '../../../core/models/models';
import { RecipeService } from '../../../core/services/recipe.service';
import { CategoryService } from '../../../core/services/category.service';
import { IngredientService } from '../../../core/services/ingredient.service';
import { UnitSelectComponent } from '../../../shared/components/unit-select/unit-select.component';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, UnitSelectComponent],
  template: `
    <div class="page-container">
      <div class="container py-4">
        <div class="form-header">
          <a routerLink="/recipes" class="back-link">
            <i class="bi bi-arrow-left me-1"></i>Volver
          </a>
          <h1 class="page-title">{{ isEdit ? 'Editar receta' : 'Nueva receta' }}</h1>
        </div>

        @if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-grid">

            <!-- Columna izquierda: info básica -->
            <div class="form-col">
              <div class="form-card">
                <h2 class="card-section-title">Información básica</h2>

                <div class="mb-3">
                  <label class="form-label">Título <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="title"
                    placeholder="Ej: Pasta al pesto con tomates cherry"
                    [class.is-invalid]="invalid('title')">
                  @if (invalid('title')) {
                    <div class="invalid-feedback">El título es obligatorio</div>
                  }
                </div>

                <div class="mb-3">
                  <label class="form-label">Descripción</label>
                  <textarea class="form-control" formControlName="description" rows="3"
                    placeholder="Describe brevemente tu receta..."></textarea>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-6">
                    <label class="form-label">Tiempo de prep. (min) <span class="required">*</span></label>
                    <input type="number" class="form-control" formControlName="prepTime" min="1"
                      [class.is-invalid]="invalid('prepTime')">
                  </div>
                  <div class="col-6">
                    <label class="form-label">Raciones <span class="required">*</span></label>
                    <input type="number" class="form-control" formControlName="servings" min="1"
                      [class.is-invalid]="invalid('servings')">
                  </div>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-6">
                    <label class="form-label">Dificultad</label>
                    <select class="form-select" formControlName="difficulty">
                      <option value="EASY">Fácil</option>
                      <option value="MEDIUM">Media</option>
                      <option value="HARD">Difícil</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <label class="form-label">Categoría</label>
                    <select class="form-select" formControlName="categoryId">
                      <option [value]="null">Sin categoría</option>
                      @for (cat of categories(); track cat.id) {
                        <option [value]="cat.id">{{ cat.icon }} {{ cat.name }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">URL de imagen (opcional)</label>
                  <input type="url" class="form-control" formControlName="imageUrl"
                    placeholder="https://...">
                </div>

                <div class="form-check">
                  <input class="form-check-input" type="checkbox" formControlName="isPublic" id="isPublic">
                  <label class="form-check-label" for="isPublic">
                    Receta pública (visible para todos)
                  </label>
                </div>
              </div>

              <!-- Ingredientes -->
              <div class="form-card">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h2 class="card-section-title mb-0">Ingredientes <span class="required">*</span></h2>
                  <button type="button" class="btn btn-outline-success btn-sm" (click)="addIngredient()">
                    <i class="bi bi-plus-lg"></i> Añadir
                  </button>
                </div>

                <div formArrayName="ingredients">
                  @for (ing of ingredientsArray.controls; track $index; let i = $index) {
                    <div [formGroupName]="i" class="ingredient-row">
                      <div class="ing-search-wrapper">
                        <input type="text" class="form-control form-control-sm"
                          [value]="ing.get('ingredientName')?.value"
                          (input)="onIngredientSearch($event, i)"
                          placeholder="Ingrediente...">
                        @if (ingredientSearchResults[i] && ingredientSearchResults[i].length > 0) {
                          <ul class="search-dropdown">
                            @for (r of ingredientSearchResults[i]; track r.id) {
                              <li (click)="selectIngredient(r, i)">{{ r.name }}</li>
                            }
                          </ul>
                        }
                      </div>
                      <input type="number" class="form-control form-control-sm qty-input"
                        formControlName="quantity" placeholder="Cant." min="0.01" step="0.01">
                      <app-unit-select selectClass="form-select form-select-sm unit-input"
                        placeholder="Unidad" formControlName="unit"></app-unit-select>
                      <button type="button" class="remove-btn" (click)="removeIngredient(i)">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  }
                  @if (ingredientsArray.length === 0) {
                    <p class="text-muted small">Añade al menos un ingrediente</p>
                  }
                </div>
              </div>
            </div>

            <!-- Columna derecha: pasos -->
            <div class="form-col">
              <div class="form-card">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h2 class="card-section-title mb-0">Pasos de preparación <span class="required">*</span></h2>
                  <button type="button" class="btn btn-outline-success btn-sm" (click)="addStep()">
                    <i class="bi bi-plus-lg"></i> Añadir paso
                  </button>
                </div>

                <div formArrayName="steps">
                  @for (step of stepsArray.controls; track $index; let i = $index) {
                    <div [formGroupName]="i" class="step-row">
                      <div class="step-num-badge">{{ i + 1 }}</div>
                      <textarea class="form-control form-control-sm"
                        formControlName="description" rows="2"
                        [placeholder]="'Describe el paso ' + (i + 1) + '...'"></textarea>
                      <button type="button" class="remove-btn" (click)="removeStep(i)">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  }
                  @if (stepsArray.length === 0) {
                    <p class="text-muted small">Añade al menos un paso</p>
                  }
                </div>
              </div>

              <!-- Acciones -->
              <div class="form-actions">
                <a routerLink="/recipes" class="btn btn-outline-secondary">Cancelar</a>
                <button type="submit" class="btn btn-sabores" [disabled]="loading()">
                  @if (loading()) { <span class="spinner-border spinner-border-sm me-2"></span> }
                  {{ isEdit ? 'Guardar cambios' : 'Publicar receta' }}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container { background: #F0FAF4; min-height: 100vh; }
    .form-header { margin-bottom: 1.5rem; }
    .back-link { color: #52796F; text-decoration: none; font-size: 0.875rem; }
    .back-link:hover { color: #2D6A4F; }
    .page-title { font-size: 1.75rem; font-weight: 700; color: #1B4332; margin: 0.5rem 0 0; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 900px) { .form-grid { grid-template-columns: 1fr; } }

    .form-col { display: flex; flex-direction: column; gap: 20px; }
    .form-card { background: #fff; border-radius: 16px; border: 1px solid #E9F5EE; padding: 1.5rem; }
    .card-section-title { font-size: 1rem; font-weight: 600; color: #1B4332; margin-bottom: 1.25rem; }

    .form-label { font-size: 0.875rem; font-weight: 500; color: #2D6A4F; }
    .required { color: #e05252; }
    .form-control, .form-select {
      border-color: #C8E6C9; border-radius: 8px; font-size: 0.9rem;
    }
    .form-control:focus, .form-select:focus {
      border-color: #52B788; box-shadow: 0 0 0 3px rgba(82,183,136,0.15);
    }

    .ingredient-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
    .ing-search-wrapper { flex: 1; position: relative; }
    .qty-input  { width: 70px; }
    .unit-input { width: 130px; }

    .step-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
    .step-num-badge {
      width: 26px; height: 26px; border-radius: 50%;
      background: #2D6A4F; color: #fff;
      font-size: 0.8rem; font-weight: 600;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 4px;
    }

    .remove-btn { background: none; border: none; color: #C8E6C9; cursor: pointer; font-size: 1.1rem; padding: 0 2px; flex-shrink: 0; }
    .remove-btn:hover { color: #e05252; }

    .search-dropdown {
      position: absolute; top: 100%; left: 0; right: 0; z-index: 100;
      list-style: none; padding: 0; margin: 2px 0 0;
      background: #fff; border: 1px solid #C8E6C9; border-radius: 8px;
      max-height: 160px; overflow-y: auto;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    .search-dropdown li { padding: 7px 12px; font-size: 0.875rem; cursor: pointer; color: #2D3436; }
    .search-dropdown li:hover { background: #F0FAF4; }

    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .btn-sabores { background: #2D6A4F; color: #fff; border: none; border-radius: 10px; padding: 0.65rem 1.75rem; font-weight: 600; }
    .btn-sabores:hover:not(:disabled) { background: #1B4332; color: #fff; }
    .btn-sabores:disabled { opacity: 0.7; }
  `]
})
export class RecipeFormComponent implements OnInit {
  private fb              = inject(FormBuilder);
  private route           = inject(ActivatedRoute);
  private router             = inject(Router);
  private recipeService      = inject(RecipeService);
  private categoryService    = inject(CategoryService);
  private ingredientService  = inject(IngredientService);

  categories = signal<Category[]>([]);
  loading    = signal(false);
  error      = signal('');
  isEdit     = false;
  editId: number | null = null;

  ingredientSearchResults: Ingredient[][] = [];

  form = this.fb.group({
    title:       ['', Validators.required],
    description: [''],
    imageUrl:    [''],
    prepTime:    [30, [Validators.required, Validators.min(1)]],
    servings:    [4,  [Validators.required, Validators.min(1)]],
    difficulty:  ['EASY'],
    categoryId:  [null as number | null],
    isPublic:    [true],
    ingredients: this.fb.array([]),
    steps:       this.fb.array([])
  });

  get ingredientsArray() { return this.form.get('ingredients') as FormArray; }
  get stepsArray()       { return this.form.get('steps') as FormArray;       }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(cats => this.categories.set(cats));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = Number(id);
      this.recipeService.getById(this.editId).subscribe(recipe => {
        this.form.patchValue({
          title: recipe.title, description: recipe.description,
          imageUrl: recipe.imageUrl, prepTime: recipe.prepTime,
          servings: recipe.servings, difficulty: recipe.difficulty,
          categoryId: recipe.category?.id ?? null, isPublic: recipe.isPublic
        });
        recipe.ingredients.forEach(ing => {
          this.ingredientsArray.push(this.fb.group({
            ingredientId:   [ing.ingredient.id],
            ingredientName: [ing.ingredient.name],
            quantity:       [ing.quantity, Validators.required],
            unit:           [ing.unit, Validators.required]
          }));
          this.ingredientSearchResults.push([]);
        });
        recipe.steps.forEach(step => {
          this.stepsArray.push(this.fb.group({
            stepNumber:  [step.stepNumber],
            description: [step.description, Validators.required]
          }));
        });
      });
    } else {
      this.addIngredient();
      this.addStep();
    }
  }

  addIngredient(): void {
    this.ingredientsArray.push(this.fb.group({
      ingredientId:   [null as number | null],
      ingredientName: [''],
      quantity:       [null, Validators.required],
      unit:           ['', Validators.required]
    }));
    this.ingredientSearchResults.push([]);
  }

  removeIngredient(i: number): void {
    this.ingredientsArray.removeAt(i);
    this.ingredientSearchResults.splice(i, 1);
  }

  addStep(): void {
    const num = this.stepsArray.length + 1;
    this.stepsArray.push(this.fb.group({
      stepNumber:  [num],
      description: ['', Validators.required]
    }));
  }

  removeStep(i: number): void {
    this.stepsArray.removeAt(i);
    this.stepsArray.controls.forEach((ctrl, idx) => ctrl.get('stepNumber')?.setValue(idx + 1));
  }

  onIngredientSearch(event: Event, index: number): void {
    const val = (event.target as HTMLInputElement).value;
    this.ingredientsArray.at(index).get('ingredientName')?.setValue(val);
    this.ingredientsArray.at(index).get('ingredientId')?.setValue(null);
    if (val.length < 2) { this.ingredientSearchResults[index] = []; return; }
    this.ingredientService.search(val)
      .subscribe(r => this.ingredientSearchResults[index] = r);
  }

  selectIngredient(ing: Ingredient, index: number): void {
    this.ingredientsArray.at(index).patchValue({ ingredientId: ing.id, ingredientName: ing.name });
    this.ingredientSearchResults[index] = [];
  }

  invalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set('');

    const value = this.form.value;
    const payload = {
      ...value,
      ingredients: value.ingredients?.map((ing: any) => ({
        ingredientId:   ing.ingredientId || null,
        ingredientName: ing.ingredientId ? null : ing.ingredientName,
        quantity:       ing.quantity,
        unit:           ing.unit
      })),
      steps: value.steps?.map((s: any, i: number) => ({
        stepNumber: i + 1, description: s.description
      }))
    };

    const request$ = this.isEdit
      ? this.recipeService.update(this.editId!, payload)
      : this.recipeService.create(payload);

    request$.subscribe({
      next: (recipe) => this.router.navigate(['/recipes', recipe.id]),
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al guardar la receta');
        this.loading.set(false);
      }
    });
  }
}
