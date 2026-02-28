import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}
  
  canActivate(): boolean | UrlTree {
    if (this.tokenService.isAuthenticated()) {
      return true;
    }
    
    // Clear any stale tokens
    this.tokenService.clearTokens();
    return this.router.createUrlTree(['/auth/login']);
  }
}