import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/recipes`;

  getByRecipe(recipeId: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.base}/${recipeId}/ratings`);
  }

  getMyRating(recipeId: number): Observable<Rating | null> {
    return this.http.get<Rating>(`${this.base}/${recipeId}/ratings/me`);
  }

  upsert(recipeId: number, score: number, comment: string): Observable<Rating> {
    return this.http.post<Rating>(`${this.base}/${recipeId}/ratings`, { score, comment });
  }

  delete(recipeId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${recipeId}/ratings/me`);
  }
}
