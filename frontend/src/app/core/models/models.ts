export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface Ingredient {
  id: number;
  name: string;
  category: string;
}

export interface RecipeIngredient {
  id: number;
  ingredient: Ingredient;
  quantity: number;
  unit: string;
}

export interface RecipeStep {
  id: number;
  stepNumber: number;
  description: string;
}

export interface RecipeSummary {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  isPublic: boolean;
  category: Category | null;
  authorName: string;
  createdAt: string;
  isFavorite: boolean;
  avgRating: number;
  ratingCount: number;
}

export interface Rating {
  id: number;
  userName: string;
  score: number;
  comment: string | null;
  createdAt: string;
}

export interface RecipeDetail extends RecipeSummary {
  author: User;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface PantryItem {
  id: number;
  ingredient: Ingredient;
  quantity: number | null;
  unit: string | null;
  updatedAt: string;
}

export interface RecipeSuggestion {
  recipe: RecipeSummary;
  totalIngredients: number;
  matchedIngredients: number;
  matchPercentage: number;
  missingIngredients: string[];
}

export interface PantryWithSuggestions {
  items: PantryItem[];
  suggestions: RecipeSuggestion[];
}

export interface MealPlanEntry {
  id: number;
  planDate: string;
  mealType: 'DESAYUNO' | 'ALMUERZO' | 'COMIDA' | 'MERIENDA' | 'CENA';
  recipe: RecipeSummary;
}

export interface WeeklyPlan {
  meals: MealPlanEntry[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
