import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; 
import { MatIconModule } from '@angular/material/icon';

import { LeaveFormDialogComponent } from '../leave-form-dialog/leave-form-dialog';
import { SessionTimeoutService } from '../services/session-timeout.service';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatSnackBarModule,
    LeaveFormDialogComponent
  ],
  templateUrl: './employee-dashboard.html',
  styleUrls: ['./employee-dashboard.scss']
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  
  currentDate: Date = new Date();
  userName: string = 'Kavy'; 
  isSidebarCollapsed: boolean = false;
  
  currentView: string = 'dashboard'; 
  
  leaveBalances = [
    { name: 'Casual Leave', used: 8, total: 12, color: '#3B82F6' },
    { name: 'Sick Leave', used: 8, total: 10, color: '#10B981' },
    { name: 'Earned Leave', used: 8, total: 15, color: '#F59E0B' },
    { name: 'Work From Home', used: 14, total: 24, color: '#8B5CF6' }
  ];

  recentRequests = [
    { type: 'Casual Leave', dateRange: '2024-06-20 → 2024-06-21', days: '2 days', status: 'Approved', statusClass: 'approved' },
    { type: 'Sick Leave', dateRange: '2024-07-05 → 2024-07-05', days: '1 day', status: 'Approved', statusClass: 'approved' },
    { type: 'Earned Leave', dateRange: '2024-08-12 → 2024-08-16', days: '5 days', status: 'Pending', statusClass: 'pending' }
  ];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private sessionTimeoutService: SessionTimeoutService
  ) {}

  ngOnInit() {
    this.sessionTimeoutService.startSession();
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      this.userName = userObj.name || 'Employee';
    }

    this.fetchLeaveHistory();
  }

  ngOnDestroy() {
    this.sessionTimeoutService.endSession();
  }

  fetchLeaveHistory() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // 2. Updated URL
    this.http.get(`${environment.apiUrl}/leaves/history`, { headers })
      .subscribe({
        next: (data: any) => {
          this.recentRequests = data.map((dbRow: any) => ({
            type: dbRow.leave_type,
            dateRange: `${new Date(dbRow.start_date).toLocaleDateString()} → ${new Date(dbRow.end_date).toLocaleDateString()}`,
            days: `${dbRow.days} day(s)`,
            status: dbRow.status || 'Pending',
            statusClass: (dbRow.status || 'pending').toLowerCase()
          }));
        },
        error: (err) => {
          console.error('Failed to fetch history', err);
          this.snackBar.open('Could not load leave history.', 'Close', { duration: 3000 });
        }
      });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  openLeaveForm() {
    this.currentView = 'apply-leave';
  }

  cancelLeaveForm() {
    this.currentView = 'dashboard';
  }

  logout() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // 3. Updated URL
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { headers })
      .subscribe({
        next: () => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.sessionTimeoutService.endSession();
          this.router.navigate(['/login']);
          this.snackBar.open('Logged out successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Logout error:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
        }
      });
  }

  submitLeaveRequest(formData: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // 4. Updated URL
    this.http.post(`${environment.apiUrl}/leaves/apply`, formData, { headers })
      .subscribe({
        next: (response: any) => {
          this.snackBar.open('Leave application submitted successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          
          this.currentView = 'dashboard'; 
          this.fetchLeaveHistory(); 
        },
        error: (err) => {
          this.snackBar.open('Failed to submit leave request.', 'Close', { duration: 3000 });
        }
      });
  }
}