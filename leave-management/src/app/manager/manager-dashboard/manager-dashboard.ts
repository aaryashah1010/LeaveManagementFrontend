import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PendingApprovalsComponent } from '../pending-approvals/pending-approvals';

import { environment } from '../../../environments/environment';
import { LeaveService } from '../../services/leave'; // Imported your LeaveService

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatSnackBarModule,
    PendingApprovalsComponent
  ],
  templateUrl: './manager-dashboard.html',
  styleUrls: ['./manager-dashboard.scss']
})

export class ManagerDashboard implements OnInit {
  currentDate: Date = new Date();
  
  userName: string = 'Manager'; 
  fullName: string = 'Aarav Sharma';
  empId: string = 'EMP-001';
  initials: string = 'AS';

  isSidebarCollapsed: boolean = false;
  currentView: string = 'dashboard'; 

  // 1. Cleared the fake data and started with an empty array
  pendingRequests: any[] = [];

  // You can leave teamStatus hardcoded for now, or clear it if you prefer!
  teamStatus = [
    { name: 'Kavy Sanghani', status: 'Available', statusClass: 'green' },
    { name: 'Priya Patel', status: 'Available', statusClass: 'green' }
  ];

  // Default values before the DB loads
  dashboardStats = {
    pendingApprovals: 0,
    teamMembers: 0,
    onLeaveToday: 0,
    approvedThisMonth: 0
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private leaveService: LeaveService,   // 2. Injected LeaveService
    private cdr: ChangeDetectorRef        // 3. Injected ChangeDetectorRef
  ) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      this.fullName = userObj.name || 'Aarav Sharma';
      this.userName = this.fullName.split(' ')[0];
      this.empId = userObj.employee_code || 'EMP-001';
      
      const nameParts = this.fullName.split(' ');
      this.initials = nameParts.length > 1 
        ? nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0) 
        : nameParts[0].charAt(0);
    }

    // 4. Fetch the real data for the dashboard widget
    this.fetchDashboardApprovals();
    this.fetchDashboardStats();
  }

  fetchDashboardApprovals() {
    this.leaveService.getPendingApprovals().subscribe({
      next: (data: any[]) => {
        try {
          // Slice to 4 so we don't overflow the dashboard preview widget
          this.pendingRequests = data.slice(0, 4).map((row: any) => {
            const calculatedInitials = row.name
              ? row.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
              : '??';

            return {
              initials: calculatedInitials,
              name: row.name,
              details: `${row.leaveType} · ${row.days}d · ${new Date(row.startDate).toISOString().split('T')[0]}`,
              status: row.status
            };
          });

          // 5. Force the UI to update with the new array
          this.cdr.detectChanges();
        } catch (error) {
          console.error('Error mapping dashboard requests:', error);
        }
      },
      error: (err: any) => console.error('Error fetching dashboard leaves', err)
    });
  }
  fetchDashboardStats() {
    this.leaveService.getManagerStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.cdr.detectChanges(); // Instantly update the UI
      },
      error: (err) => console.error('Failed to load dashboard stats', err)
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { headers })
      .subscribe({
        next: () => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
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
}