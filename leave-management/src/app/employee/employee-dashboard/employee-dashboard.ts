import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; 
import { MatIconModule } from '@angular/material/icon';

import { LeaveFormDialogComponent } from '../leave-form-dialog/leave-form-dialog';
import { SessionTimeoutService } from '../../services/session-timeout.service';

import { environment } from '../../../environments/environment';

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
  userName: string = 'Employee'; 
  isSidebarCollapsed: boolean = false;
  currentView: string = 'dashboard'; 
  
  leaveBalances: any[] = [];
  recentRequests: any[] = [];

  // Dynamic stats object for the top cards
  dashboardStats = {
    totalBalance: 0,
    usedThisYear: 0,
    approvedRequests: 0,
    pendingRequestsCount: 0
  };

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private sessionTimeoutService: SessionTimeoutService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.sessionTimeoutService.startSession();
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      this.userName = userObj.name ? userObj.name.split(' ')[0] : 'Employee';

      // Initialize base totals from the database
      this.leaveBalances = [
        { name: 'Casual Leave', used: 0, total: userObj.casual_leave || 12, color: '#3B82F6' },
        { name: 'Sick Leave', used: 0, total: userObj.sick_leave || 10, color: '#10B981' },
        { name: 'Earned Leave', used: 0, total: userObj.earned_leave || 15, color: '#F59E0B' },
        { name: 'Work From Home', used: 0, total: userObj.wfh_balance || 24, color: '#8B5CF6' }
      ];
    }

    this.fetchLeaveHistory();
  }

  ngOnDestroy() {
    this.sessionTimeoutService.endSession();
  }

  fetchLeaveHistory() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`${environment.apiUrl}/leaves/my-leaves`, { headers })
      .subscribe({
        next: (data: any) => {
          try {
            // Reset counters
            let pendingCount = 0;
            let approvedCount = 0;
            let usedDaysCount = 0;
            this.leaveBalances.forEach(b => b.used = 0);
            
            const currentYear = new Date().getFullYear();

            this.recentRequests = data.map((dbRow: any) => {
              // EXACT ORIGINAL DATE LOGIC
              const startDate = dbRow.startDate;
              const endDate = dbRow.endDate;

              const status = dbRow.status || 'Pending';
              const days = parseInt(dbRow.days) || 0;
              const type = dbRow.leaveType;
              const startYear = dbRow.startDate ? new Date(dbRow.startDate).getFullYear() : currentYear;

              // Tally stats for the cards and progress bars
              if (status === 'Pending') pendingCount++;
              if (status === 'Approved') {
                approvedCount++;
                if (startYear === currentYear) usedDaysCount += days;
                
                const balanceItem = this.leaveBalances.find(b => b.name === type);
                if (balanceItem) balanceItem.used += days;
              }

              return {
                type: type,
                dateRange: `${startDate} → ${endDate}`,
                days: `${days} day(s)`,
                status: status,
                statusClass: status.toLowerCase(),
                managerComment: dbRow.managerComment || null
              };
            });

            // Calculate Final Math for the top cards
            const totalAllocated = this.leaveBalances.reduce((sum, b) => sum + b.total, 0);
            const totalUsed = this.leaveBalances.reduce((sum, b) => sum + b.used, 0);

            this.dashboardStats = {
              totalBalance: totalAllocated - totalUsed,
              usedThisYear: usedDaysCount,
              approvedRequests: approvedCount,
              pendingRequestsCount: pendingCount
            };

            this.cdr.detectChanges();
          } catch (error) {
            console.error('Error mapping leave history:', error);
          }
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

    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { headers })
      .subscribe({
        next: () => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.sessionTimeoutService.endSession();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
        }
      });
  }

  submitLeaveRequest(formData: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(`${environment.apiUrl}/leaves/apply`, formData, { headers })
      .subscribe({
        next: (response: any) => {
          this.snackBar.open('Leave application submitted successfully!', 'Close', {
            duration: 3000, horizontalPosition: 'right', verticalPosition: 'top',
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