import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs';

// Import the environment configuration
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, MatIconModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
}) // <--- ADDED THE MISSING CLOSING BRACKET HERE
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string | null = null;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.snackBar.open('Invalid or missing reset token', 'Close', { duration: 4000 });
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  toggleVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit() {
    if (this.resetForm.valid && this.token) {
      const payload = {
        token: this.token,
        newPassword: this.resetForm.get('newPassword')?.value
      };

      // Updated to use the environment URL instead of localhost
      this.http.post(`${environment.apiUrl}/auth/reset-password`, payload)
        .subscribe({
          next: () => {
            this.snackBar.open('Password reset successfully! You can now log in.', 'Close', { duration: 5000 });
            this.router.navigate(['/login']);
          },
          error: (err) => {
            const msg = err.error?.message || 'Failed to reset password.';
            this.snackBar.open(msg, 'Close', { duration: 3000 });
          }
        });
    }
  }
}