// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User,
  PasswordResetRequest,
  PasswordResetConfirm 
} from '../models/user.model';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private refreshTokenInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    this.loadUserFromToken();
  }

  private loadUserFromToken(): void {
    if (this.tokenService.isAuthenticated()) {
      this.getCurrentUser().subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.tokenService.clearTokens()
      });
    }
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  logout(): Observable<void> {
    const token = this.tokenService.getAccessToken();
    if (token) {
      return this.http.post<void>(`${this.apiUrl}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).pipe(
        tap(() => this.clearAuthData()),
        catchError(this.handleError)
      );
    }
    this.clearAuthData();
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.pipe(
        switchMap(token => {
          if (token) {
            return this.getCurrentUser().pipe(
              map(user => ({
                accessToken: token,
                refreshToken: this.tokenService.getRefreshToken()!,
                userId: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                expiresIn: 3600,
                tokenType: 'Bearer'
              }))
            );
          }
          return throwError(() => new Error('Refresh failed'));
        })
      );
    }

    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.handleAuthResponse(response);
        this.refreshTokenInProgress = false;
        this.refreshTokenSubject.next(response.accessToken);
      }),
      catchError(error => {
        this.refreshTokenInProgress = false;
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  forgotPassword(request: PasswordResetRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, request).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(request: PasswordResetConfirm): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, request).pipe(
      catchError(this.handleError)
    );
  }

  verifyEmail(token: string): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/verify`, { params: { token } }).pipe(
      catchError(this.handleError)
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(this.handleError)
    );
  }

  getUserProfile(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateProfile(profile: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, profile).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(this.handleError)
    );
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.tokenService.setTokens(
      response.accessToken,
      response.refreshToken,
      response.userId,
      response.username,
      response.role
    );
    this.getCurrentUser().subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: (error) => console.error('Failed to load user after auth:', error)
    });
  }

  private clearAuthData(): void {
    this.tokenService.clearTokens();
    this.currentUserSubject.next(null);
  }

  private handleError(error: any): Observable<never> {
    console.error('Auth service error:', error);
    return throwError(() => error);
  }
}