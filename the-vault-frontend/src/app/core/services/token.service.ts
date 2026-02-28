import { Injectable } from "@angular/core";
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private readonly TOKEN_KEY = 'access_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private readonly USER_ID_KEY = 'user_id';
    private readonly USERNAME_KEY = 'username';
    private readonly USER_ROLE_KEY = 'user_role'
    private jwtHelper = new JwtHelperService();
    constructor() { }
    setTokens(accessToken: string, refreshToken: string, userId: string, username: string, role: string): void {
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(this.USER_ID_KEY, userId);
        localStorage.setItem(this.USERNAME_KEY, username);
        localStorage.setItem(this.USER_ROLE_KEY, role);
    }
    getAccessToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }
    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    getUserId(): string | null {
        return localStorage.getItem(this.USER_ID_KEY);
    }
    getUsername(): string | null {
        return localStorage.getItem(this.USERNAME_KEY);
    }
    getUserRole(): string | null {
        return localStorage.getItem(this.USER_ROLE_KEY)
    }
    isTokenExpired(): boolean {
        const token = this.getAccessToken();
        if (!token) return true;
        try {

            return this.jwtHelper.isTokenExpired(token);
        } catch {
            return true;
        }
    }
    isAuthenticated(): boolean{
        return !!this.getAccessToken() && !this.isTokenExpired();
    }
    clearTokens(): void{
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_ID_KEY);
        localStorage.removeItem(this.USERNAME_KEY)
        localStorage.removeItem(this.USER_ROLE_KEY);
    }
}