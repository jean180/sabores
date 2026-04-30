import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse, RecipeDetail, RecipeSummary } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private base = `${environment.apiUrl}/recipes`;
  constructor(private http: HttpClient) {}

  search(params: {
    categoryId?: number; difficulty?: string; maxPrepTime?: number;
    search?: string; ingredientIds?: number[]; page?: number; size?: number;
  }): Observable<PageResponse<RecipeSummary>> {
    let p = new HttpParams();
    if (params.categoryId)   p = p.set('categoryId', params.categoryId);
    if (params.difficulty)   p = p.set('difficulty', params.difficulty);
    if (params.maxPrepTime)  p = p.set('maxPrepTime', params.maxPrepTime);
    if (params.search)       p = p.set('search', params.search);
    if (params.ingredientIds?.length)
      params.ingredientIds.forEach(id => p = p.append('ingredientIds', id));
    p = p.set('page', params.page ?? 0).set('size', params.size ?? 12);
    return this.http.get<PageResponse<RecipeSummary>>(this.base, { params: p });
  }

  getById(id: number): Observable<RecipeDetail> {
    return this.http.get<RecipeDetail>(`${this.base}/${id}`);
  }

  getByUser(userId: number, page = 0, size = 12): Observable<PageResponse<RecipeSummary>> {
    return this.http.get<PageResponse<RecipeSummary>>(`${this.base}/user/${userId}`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  create(data: any): Observable<RecipeDetail> {
    return this.http.post<RecipeDetail>(this.base, data);
  }

  update(id: number, data: any): Observable<RecipeDetail> {
    return this.http.put<RecipeDetail>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
