import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { SnackbarService } from '@core/services/snackbar.service';

@Component({
  selector: 'app-register',
  template: `
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="outline" class="form-field-full">
        <mat-label>Full Name</mat-label>
        <input
          matInput
          type="text"
          formControlName="name"
          placeholder="Enter your full name"
          autocomplete="name"
        />
        <mat-icon matPrefix>person</mat-icon>
        <mat-error *ngIf="registerForm.get('name')?.hasError('required')">
          Name is required
        </mat-error>
        <mat-error *ngIf="registerForm.get('name')?.hasError('minlength')">
          Name must be at least 2 characters
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="form-field-full">
        <mat-label>Email</mat-label>
        <input
          matInput
          type="email"
          formControlName="email"
          placeholder="Enter your email"
          autocomplete="email"
        />
        <mat-icon matPrefix>email</mat-icon>
        <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
          Email is required
        </mat-error>
        <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
          Please enter a valid email
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="form-field-full">
        <mat-label>Phone Number</mat-label>
        <input
          matInput
          type="tel"
          formControlName="phone"
          placeholder="Enter your phone number"
          autocomplete="tel"
        />
        <mat-icon matPrefix>phone</mat-icon>
        <mat-error *ngIf="registerForm.get('phone')?.hasError('required')">
          Phone number is required
        </mat-error>
        <mat-error *ngIf="registerForm.get('phone')?.hasError('pattern')">
          Please enter a valid phone number
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="form-field-full">
        <mat-label>Password</mat-label>
        <input
          matInput
          [type]="hidePassword ? 'password' : 'text'"
          formControlName="password"
          placeholder="Create a password"
          autocomplete="new-password"
        />
        <mat-icon matPrefix>lock</mat-icon>
        <button
          mat-icon-button
          matSuffix
          type="button"
          (click)="hidePassword = !hidePassword"
          [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'"
        >
          <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
        <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
          Password is required
        </mat-error>
        <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
          Password must be at least 6 characters
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="form-field-full">
        <mat-label>Confirm Password</mat-label>
        <input
          matInput
          [type]="hideConfirmPassword ? 'password' : 'text'"
          formControlName="confirmPassword"
          placeholder="Confirm your password"
          autocomplete="new-password"
        />
        <mat-icon matPrefix>lock</mat-icon>
        <button
          mat-icon-button
          matSuffix
          type="button"
          (click)="hideConfirmPassword = !hideConfirmPassword"
          [attr.aria-label]="hideConfirmPassword ? 'Show password' : 'Hide password'"
        >
          <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
        <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
          Please confirm your password
        </mat-error>
        <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
          Passwords do not match
        </mat-error>
      </mat-form-field>

      <button
        mat-flat-button
        color="primary"
        type="submit"
        class="submit-button"
        [disabled]="registerForm.invalid || isLoading"
      >
        <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
        <span *ngIf="!isLoading">Create Account</span>
      </button>

      <div class="auth-footer">
        <span>Already have an account?</span>
        <a routerLink="/auth/login">Sign in</a>
      </div>
    </form>
  `,
  styles: [
    `
      form {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .form-field-full {
        width: 100%;
      }

      .submit-button {
        width: 100%;
        height: 48px;
        font-size: 1rem;
        margin-top: 8px;
      }

      .submit-button mat-spinner {
        display: inline-block;
      }

      .auth-footer {
        text-align: center;
        margin-top: 16px;
        color: var(--text-secondary);
      }

      .auth-footer a {
        color: #3f51b5;
        text-decoration: none;
        font-weight: 500;
        margin-left: 4px;
      }

      .auth-footer a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackbar: SnackbarService
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{10,}$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    const { name, email, phone, password } = this.registerForm.value;

    this.authService.register({ name, email, phone, password }).subscribe({
      next: () => {
        this.snackbar.success('Account created successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
