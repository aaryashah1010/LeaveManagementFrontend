import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

// 1. Import the environment configuration
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, MatIconModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isSubmitting = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;

    // 2. Use the environment URL instead of localhost
    this.http.post(`${environment.apiUrl}/auth/forgot-password`, this.forgotForm.value)
      .subscribe({
        next: () => {
          // Push UI updates to the next event tick to avoid lightning-fast local response collisions
          setTimeout(() => {
            this.isSubmitting = false;
            this.emailSent = true;
            this.snackBar.open('Reset link sent! Check your email.', 'Close', { duration: 5000 });
          }, 0);
        },
        error: (err) => {
          setTimeout(() => {
            this.isSubmitting = false;
            const msg = err.status === 404 ? 'User not found.' : 'Failed to send reset link.';
            this.snackBar.open(msg, 'Close', { duration: 3000 });
          }, 0);
        }
      });
  }
}