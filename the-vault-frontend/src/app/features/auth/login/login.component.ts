import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
    // --- PROPERTIES (Aligned) ---
    public loginForm: FormGroup;
    public isLoading: boolean = false;
    public showPassword: boolean = false;
    public showErrors: boolean = false;
    public showDemo: boolean = true;

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private tokenService: TokenService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            usernameOrEmail: ['', [Validators.required]],
            password: ['', [Validators.required]],
            rememberMe: [false]
        });
    }

    // // --- ACCESSORS ---
    // get f() { return this.loginForm.controls; }

    // --- LIFECYCLE ---
    ngOnInit(): void {
        if (this.tokenService.isAuthenticated()) {
            this.router.navigate(['/lobby']);
        }
    }

    // --- METHODS ---
    public togglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    public onSubmit(): void {
        this.showErrors = true;

        if (this.loginForm.invalid) return;

        this.isLoading = true;

        this.authService.login(this.loginForm.value)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => { this.router.navigate(['/lobby']); },
                error: (e) => {
                    console.error(e);
                    this.isLoading = false;
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}