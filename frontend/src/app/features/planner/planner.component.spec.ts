import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PlannerComponent } from './planner.component';
import { MealPlanService } from '../../core/services/meal-plan.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { RecipeSummary, WeeklyPlan } from '../../core/models/models';

const emptyPlan: WeeklyPlan = { meals: [] };

function makeRecipe(id = 1, title = 'Pasta'): RecipeSummary {
  return {
    id,
    title,
    description: '',
    imageUrl: '',
    prepTime: 20,
    servings: 2,
    difficulty: 'EASY',
    isPublic: true,
    category: null,
    authorName: 'Chef',
    createdAt: '2024-01-01',
    isFavorite: false,
  };
}

describe('PlannerComponent', () => {
  let fixture: ComponentFixture<PlannerComponent>;
  let component: PlannerComponent;
  let httpMock: HttpTestingController;
  let mealPlanSpy: jasmine.SpyObj<MealPlanService>;

  beforeEach(async () => {
    mealPlanSpy = jasmine.createSpyObj<MealPlanService>('MealPlanService', [
      'getWeek',
      'upsert',
      'remove',
    ]);
    mealPlanSpy.getWeek.and.returnValue(of(emptyPlan));
    mealPlanSpy.upsert.and.returnValue(of({} as any));
    mealPlanSpy.remove.and.returnValue(of(undefined as any));

    await TestBed.configureTestingModule({
      imports: [PlannerComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MealPlanService, useValue: mealPlanSpy },
      ],
    }).compileComponents();

    httpMock  = TestBed.inject(HttpTestingController);
    fixture   = TestBed.createComponent(PlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();   // triggers ngOnInit → loadWeek
  });

  afterEach(() => httpMock.verify());

  // ------------------------------------------------------------------ openAdd

  describe('openAdd()', () => {
    it('opens the modal and stores date and meal', () => {
      component.openAdd('2025-04-21', 'LUNCH');

      expect(component.addModal).toBeTrue();
      expect(component.addingDate).toBe('2025-04-21');
      expect(component.addingMeal).toBe('LUNCH');
    });

    it('resets search state', () => {
      component.recipeSearch = 'something';
      component.selectedRecipe = makeRecipe();
      component.recipeSearchResults = [makeRecipe()];

      component.openAdd('2025-04-21', 'DINNER');

      expect(component.recipeSearch).toBe('');
      expect(component.selectedRecipe).toBeNull();
      expect(component.recipeSearchResults).toEqual([]);
    });
  });

  // ---------------------------------------------------------------- closeModal

  describe('closeModal()', () => {
    it('sets addModal to false', () => {
      component.addModal = true;
      component.closeModal();
      expect(component.addModal).toBeFalse();
    });

    it('clears recipeSearchResults', () => {
      component.recipeSearchResults = [makeRecipe()];
      component.closeModal();
      expect(component.recipeSearchResults).toEqual([]);
    });
  });

  // ------------------------------------------------------------- onRecipeSearch

  describe('onRecipeSearch()', () => {
    it('does nothing (clears results) when search string is shorter than 2 chars', () => {
      component.recipeSearch = 'a';
      component.recipeSearchResults = [makeRecipe()];

      component.onRecipeSearch();

      expect(component.recipeSearchResults).toEqual([]);
      httpMock.expectNone(req => req.url.includes('recipes'));
    });

    it('does nothing when search string is empty', () => {
      component.recipeSearch = '';
      component.onRecipeSearch();

      expect(component.recipeSearchResults).toEqual([]);
      httpMock.expectNone(req => req.url.includes('recipes'));
    });

    it('calls GET /api/recipes with search param when >= 2 chars', fakeAsync(() => {
      component.recipeSearch = 'pa';

      component.onRecipeSearch();

      const req = httpMock.expectOne(r => r.url.includes('/recipes') && r.params.has('search'));
      expect(req.request.params.get('search')).toBe('pa');
      expect(req.request.params.get('size')).toBe('6');

      const recipe = makeRecipe(1, 'Pasta');
      req.flush({ content: [recipe], page: 0, size: 6, totalElements: 1, totalPages: 1, last: true });
      tick();

      expect(component.recipeSearchResults.length).toBe(1);
      expect(component.recipeSearchResults[0].title).toBe('Pasta');
    }));

    it('resets selectedRecipe when typing starts', () => {
      component.selectedRecipe = makeRecipe();
      component.recipeSearch = 'p';

      component.onRecipeSearch();

      expect(component.selectedRecipe).toBeNull();
    });
  });

  // ------------------------------------------------------------- selectRecipe

  describe('selectRecipe()', () => {
    it('sets selectedRecipe', () => {
      const recipe = makeRecipe(5, 'Tortilla');
      component.selectRecipe(recipe);
      expect(component.selectedRecipe).toBe(recipe);
    });

    it('copies recipe title into recipeSearch', () => {
      component.selectRecipe(makeRecipe(5, 'Tortilla'));
      expect(component.recipeSearch).toBe('Tortilla');
    });

    it('clears recipeSearchResults', () => {
      component.recipeSearchResults = [makeRecipe(1), makeRecipe(2, 'Soup')];
      component.selectRecipe(makeRecipe(5, 'Tortilla'));
      expect(component.recipeSearchResults).toEqual([]);
    });
  });

  // --------------------------------------------------------------- confirmAdd

  describe('confirmAdd()', () => {
    it('does nothing when selectedRecipe is null', () => {
      component.selectedRecipe = null;
      component.confirmAdd();
      expect(mealPlanSpy.upsert).not.toHaveBeenCalled();
    });

    it('calls mealPlanService.upsert with the correct arguments', () => {
      const recipe = makeRecipe(7, 'Paella');
      component.addingDate = '2025-04-22';
      component.addingMeal = 'DINNER';
      component.selectedRecipe = recipe;

      component.confirmAdd();

      expect(mealPlanSpy.upsert).toHaveBeenCalledWith('2025-04-22', 'DINNER', 7);
    });

    it('closes the modal after upsert succeeds', () => {
      component.addModal = true;
      component.selectedRecipe = makeRecipe();

      component.confirmAdd();

      expect(component.addModal).toBeFalse();
    });

    it('reloads the week after upsert succeeds', () => {
      component.selectedRecipe = makeRecipe();
      const callsBefore = mealPlanSpy.getWeek.calls.count();

      component.confirmAdd();

      expect(mealPlanSpy.getWeek.calls.count()).toBeGreaterThan(callsBefore);
    });
  });
});
