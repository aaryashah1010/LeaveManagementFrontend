import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
import { ResetPasswordComponent } from './reset-password/reset-password';

// 1. Import the guard
import { authGuard } from './auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },

    // 2. Add canActivate: [authGuard] to protect this route!
    {
        path: 'dashboard',
        component: EmployeeDashboardComponent,
        canActivate: [authGuard]
    }
];