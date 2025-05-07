/** @format */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiStatus } from '../models/apistatus.model';

@Injectable({
  providedIn: 'root',
})
export class ApiStatusService {
  private readonly apiUrl = 'http://localhost:3003/api';

  constructor(private readonly http: HttpClient) {}

  getApiCallById(apiId: number): Observable<ApiStatus[]> {
    console.error(apiId);
    return this.http.get<ApiStatus[]>(`${this.apiUrl}/api-statuses/${apiId}`);
  }
}
