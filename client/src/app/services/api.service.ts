/** @format */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Workspace } from '../models/workspace.model';
import { ApiCall } from '../models/apicall.model';
import { Architecture } from '../models/architecture.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl = 'http://localhost:3003/api';

  constructor(private readonly http: HttpClient) {}

  getArchitectures(): Observable<Architecture[]> {
    return this.http.get<Architecture[]>(`${this.apiUrl}/architectures`);
  }

  getArchitectureById(archId: number): Observable<Architecture> {
    return this.http.get<Architecture>(`${this.apiUrl}/architectures/${archId}`);
  }
  createArchitecture(data: Architecture): Observable<Architecture> {
    return this.http.post<Architecture>(`${this.apiUrl}/architectures`, data);
  }
  updateArchitecture(architectureId: number, data: Architecture): Observable<Architecture> {
    return this.http.put<Architecture>(`${this.apiUrl}/architectures/${architectureId}`, data);
  }
  deleteArchtiecture(archId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/architectures/${archId}`);
  }

  getWorkspace(workspaceId: number): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.apiUrl}/workspaces/${workspaceId}`);
  }

  getApiCallById(apiCallId: number): Observable<ApiCall> {
    return this.http.get<ApiCall>(`${this.apiUrl}/api-calls/${apiCallId}/select`);
  }

  getWorkspacesLikeByName(name: string, dashCount: number): Observable<Workspace[]> {
    return this.http
      .get<Workspace[]>(`${this.apiUrl}/workspaces/like-name/${name}/${dashCount}`)
      .pipe(catchError(this.handleError));
  }

  getWorkspacesByName(edgeName: string): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${this.apiUrl}/workspaces/name/${edgeName}`);
  }

  getWorkspaces(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${this.apiUrl}/workspaces`);
  }

  createWorkspace(data: Workspace): Observable<Workspace> {
    return this.http.post<Workspace>(`${this.apiUrl}/workspaces`, data);
  }

  getApiCalls(): Observable<ApiCall[]> {
    return this.http.get<ApiCall[]>(`${this.apiUrl}/api-calls`);
  }

  getApiCallsByWorkspace(workspaceId: number): Observable<ApiCall[]> {
    return this.http.get<ApiCall[]>(`${this.apiUrl}/api-calls/${workspaceId}`);
  }

  createApiCall(data: ApiCall): Observable<ApiCall> {
    return this.http.post<ApiCall>(`${this.apiUrl}/api-calls`, data);
  }

  deleteApiCall(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api-calls/${id}`);
  }

  deleteWorkspace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/workspaces/${id}`);
  }

  updateApiCall(id: number, apiCall: ApiCall): Observable<ApiCall> {
    return this.http.put<ApiCall>(`${this.apiUrl}/api-calls/${id}`, apiCall);
  }

  testApiCall(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api-calls/${id}/test`).pipe(
      catchError((err) => {
        const message =
          err.status === 500
            ? 'Server error while testing API call.'
            : `Error ${err.status}: ${err.message ?? 'Unexpected error'}`;
        return throwError(() => new Error(message));
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      // console.error('Client/network error:', error.error.message);
    } else {
      // Backend error
      // console.error(`Server returned ${error.status}, body:`, error.error);
    }

    return throwError(() => new Error('Something went wrong with the request.'));
  }
}
