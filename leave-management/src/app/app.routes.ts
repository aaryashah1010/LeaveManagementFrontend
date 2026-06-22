import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { EmployeeDashboardComponent } from './employee/employee-dashboard/employee-dashboard';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
import { ResetPasswordComponent } from './reset-password/reset-password';

// 1. Corrected the import name and file path
import { ManagerDashboard } from './manager/manager-dashboard/manager-dashboard';

import { authGuard } from './auth.guard';
import { PendingApprovalsComponent } from './manager/pending-approvals/pending-approvals';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    
    { path: 'dashboard', component: EmployeeDashboardComponent, canActivate: [authGuard] },
    { path: 'manager/pending-approvals', component: PendingApprovalsComponent },
    { path: 'manager-dashboard', component: ManagerDashboard, canActivate: [authGuard] },
];