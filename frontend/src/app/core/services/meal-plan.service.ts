import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MealPlanEntry, WeeklyPlan } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MealPlanService {
  private readonly base = `${environment.apiUrl}/meal-plan`;

  constructor(private http: HttpClient) {}

  getWeek(from: string): Observable<WeeklyPlan> {
    return this.http.get<WeeklyPlan>(`${this.base}/week`, {
      params: new HttpParams().set('from', from)
    });
  }

  upsert(planDate: string, mealType: string, recipeId: number): Observable<MealPlanEntry> {
    return this.http.post<MealPlanEntry>(this.base, { planDate, mealType, recipeId });
  }

  remove(date: string, mealType: string): Observable<void> {
    return this.http.delete<void>(this.base, {
      params: new HttpParams().set('date', date).set('mealType', mealType)
    });
  }
}
