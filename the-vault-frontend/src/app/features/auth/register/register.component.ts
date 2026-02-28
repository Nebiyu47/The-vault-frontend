import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PasswordValidators } from '../../../shared/validators/password.validator';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  showErrors = false;
  passwordStrength = {
    score: 0,
    hasLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false
  };
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [Validators.required, Validators.email]],
      fullName: [''],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        PasswordValidators.patternValidator(/[A-Z]/, { noUpperCase: true }),
        PasswordValidators.patternValidator(/[a-z]/, { noLowerCase: true }),
        PasswordValidators.patternValidator(/[0-9]/, { noNumber: true }),
        PasswordValidators.patternValidator(/[!@#$%^&*(),.?":{}|<>]/, { noSpecial: true })
      ]],
      confirmPassword: ['', Validators.required],
      role: ['BREACHER'],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validators: PasswordValidators.matchPassword('password', 'confirmPassword')
    });
  }

  ngOnInit(): void {
    if (this.tokenService.isAuthenticated()) {
      this.router.navigate(['/lobby']);
    }
  }

  get f() {
    return this.registerForm.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  selectRole(role: string): void {
    this.registerForm.patchValue({ role });
  }

  updatePasswordStrength(): void {
    const password = this.f['password'].value || '';
    this.passwordStrength = PasswordValidators.getPasswordStrength(password);
  }

  getStrengthColor(score: number): string {
    const colors = ['#ff4444', '#ff8800', '#ffd700', '#00ff88', '#00ff00'];
    return colors[score - 1] || colors[0];
  }

  getStrengthText(): string {
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return texts[this.passwordStrength.score - 1] || 'Very Weak';
  }

  onSubmit(): void {
    this.showErrors = true;
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    const request = {
      email: this.f['email'].value,
      username: this.f['username'].value,
      password: this.f['password'].value,
      fullName: this.f['fullName'].value,
      role: this.f['role'].value
    };

    this.authService.register(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login'], { queryParams: { registered: true } });
        },
        error: (error) => {
          console.error('Registration failed:', error);
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}