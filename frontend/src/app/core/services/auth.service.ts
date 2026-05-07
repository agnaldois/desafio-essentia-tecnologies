import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'jwt_token';

  // localStorage is safe here — this app is browser-only (no SSR)
  private readonly _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  readonly isLoggedIn = computed(() => !!this._token());

  getToken(): string | null {
    return this._token();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(({ data }) => {
        localStorage.setItem(this.TOKEN_KEY, data.token);
        this._token.set(data.token);
      }),
    );
  }

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { email, password }).pipe(
      tap(({ data }) => {
        localStorage.setItem(this.TOKEN_KEY, data.token);
        this._token.set(data.token);
      }),
    );
  }

  // D-03: logout clears localStorage and navigates to /login
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
    this.router.navigate(['/login']);
  }
}
