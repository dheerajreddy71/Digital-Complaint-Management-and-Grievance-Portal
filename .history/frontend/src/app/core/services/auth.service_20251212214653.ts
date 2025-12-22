import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '@environments/environment';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenPayload,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  private tokenRefreshTimeout: ReturnType<typeof setTimeout> | null = null;

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    if (this.hasValidToken()) {
      this.scheduleTokenRefresh();
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get accessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
      tap((response) => this.handleAuthResponse(response))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap((response) => this.handleAuthResponse(response))
    );
  }

  refreshAccessToken(): Observable<{ accessToken: string; refreshToken: string } | null> {
    const refreshToken = this.refreshToken;
    if (!refreshToken) {
      this.clearAuth();
      return of(null);
    }

    return this.http
      .post<{ accessToken: string; refreshToken: string }>(`${this.API_URL}/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((response) => {
          if (response) {
            localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
            localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
            this.scheduleTokenRefresh();
          }
        }),
        catchError(() => {
          this.clearAuth();
          return of(null);
        })
      );
  }

  logout(): Observable<void> {
    const refreshToken = this.refreshToken;
    this.clearAuth();

    if (refreshToken) {
      return this.http.post<void>(`${this.API_URL}/logout`, { refreshToken }).pipe(
        catchError(() => of(undefined))
      );
    }

    return of(undefined);
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));

    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
    this.scheduleTokenRefresh();
  }

  private clearAuth(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }
  }

  private hasValidToken(): boolean {
    const token = this.accessToken;
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  private decodeToken(token: string): TokenPayload {
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  }

  private scheduleTokenRefresh(): void {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }

    const token = this.accessToken;
    if (!token) return;

    try {
      const payload = this.decodeToken(token);
      const expiresIn = payload.exp * 1000 - Date.now();
      // Refresh 1 minute before expiration
      const refreshIn = Math.max(expiresIn - 60000, 0);

      this.tokenRefreshTimeout = setTimeout(() => {
        this.refreshAccessToken().subscribe();
      }, refreshIn);
    } catch {
      this.clearAuth();
    }
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.currentUser?.role || '');
  }
}
