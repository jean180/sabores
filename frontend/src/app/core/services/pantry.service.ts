import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PantryItem, PantryWithSuggestions } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PantryService {
  private base = `${environment.apiUrl}/pantry`;
  constructor(private http: HttpClient) {}

  get(): Observable<PantryWithSuggestions> {
    return this.http.get<PantryWithSuggestions>(this.base);
  }

  upsert(ingredientId: number, quantity?: number, unit?: string): Observable<PantryItem> {
    return this.http.post<PantryItem>(this.base, { ingredientId, quantity, unit });
  }

  remove(ingredientId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${ingredientId}`);
  }
}
