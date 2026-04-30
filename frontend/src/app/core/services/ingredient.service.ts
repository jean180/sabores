import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ingredient } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private readonly base = `${environment.apiUrl}/ingredients`;

  constructor(private http: HttpClient) {}

  search(q: string): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(this.base, {
      params: new HttpParams().set('q', q)
    });
  }
}
