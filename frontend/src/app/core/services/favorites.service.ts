import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse, RecipeSummary } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private base = `${environment.apiUrl}/favorites`;
  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 12): Observable<PageResponse<RecipeSummary>> {
    return this.http.get<PageResponse<RecipeSummary>>(this.base, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  toggle(recipeId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${recipeId}/toggle`, {});
  }
}
