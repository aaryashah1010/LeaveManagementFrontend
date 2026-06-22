import { FormsModule } from '@angular/forms';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LeaveService } from '../../services/leave'; 

interface LeaveRequest {
  id: string;
  initials: string;
  name: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: string;
  appliedDate: string;
  reason: string;
  aiRecommendation?: {
    status: 'APPROVE' | 'REVIEW';
    message: string;
  };
  waitingDays: string;
  showCommentBox?: boolean;
  managerComment?: string;
}

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './pending-approvals.html',
  styleUrls: ['./pending-approvals.scss']
})
export class PendingApprovalsComponent implements OnInit {
  requests: LeaveRequest[] = [];

  constructor(
    private leaveService: LeaveService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadPendingApprovals();
  }

  loadPendingApprovals() {
    this.leaveService.getPendingApprovals().subscribe({
      next: (data: any[]) => {
        try {
          this.requests = data.map((dbRow: any) => {
            const initials = dbRow.name 
              ? dbRow.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
              : '??';

            return {
              id: dbRow.id ? dbRow.id.toString() : Math.random().toString(),
              initials: initials,
              name: dbRow.name || 'Unknown Employee',
              department: dbRow.department || 'General',
              leaveType: dbRow.leaveType || 'Leave',
              startDate: dbRow.startDate ? new Date(dbRow.startDate).toISOString().split('T')[0] : 'N/A',
              endDate: dbRow.endDate ? new Date(dbRow.endDate).toISOString().split('T')[0] : 'N/A',
              days: `${dbRow.days || 0}d`,
              appliedDate: dbRow.appliedDate ? new Date(dbRow.appliedDate).toISOString().split('T')[0] : 'N/A',
              reason: dbRow.reason || 'No reason provided',
              waitingDays: '1d', 
              showCommentBox: false,
              aiRecommendation: this.getAiRecommendationMock(dbRow.name)
            };
          });

          // Tell Angular to safely update the UI
          this.cdr.detectChanges(); 

        } catch (error) {
          console.error('Mapping error:', error); 
        }
      },
      error: (err: any) => {
        console.error('API Call Failed:', err);
      }
    });
  }

  toggleComment(req: LeaveRequest) {
    req.showCommentBox = !req.showCommentBox;
  }
  approveLeave(id: string) {
    this.leaveService.updateLeaveStatus(id, 'Approved').subscribe({
      next: () => {
        // 1. Instantly remove it from the UI array without reloading the page
        this.requests = this.requests.filter(req => req.id !== id);
        
        // 2. Force the screen to redraw
        this.cdr.detectChanges();
        
        console.log(`✅ Leave ${id} Approved!`);
      },
      error: (err: any) => {
        console.error('❌ Failed to approve leave:', err);
      }
    });
  }

  rejectLeave(req: LeaveRequest, managerComment: string) {
    if (!managerComment || managerComment.trim() === '') {
      alert("Please provide a reason for rejection.");
      return;
    }

    this.leaveService.updateLeaveStatus(req.id, 'Rejected', managerComment).subscribe({
      next: () => {
        // Instantly remove it from the UI array
        this.requests = this.requests.filter(r => r.id !== req.id);
        this.cdr.detectChanges();
        
        console.log(`🚫 Leave ${req.id} Rejected!`);
      },
      error: (err: any) => {
        console.error('❌ Failed to reject leave:', err);
      }
    });
  }

  private getAiRecommendationMock(name: string): any {
    if (name === 'Sneha Patel') {
      return { status: 'APPROVE', message: 'Sufficient balance, no team conflicts detected.' };
    }
    if (name === 'Vikram Singh') {
      return { status: 'REVIEW', message: 'Team has 2 other members on leave same period.' };
    }
    if (name === 'Ananya Roy') {
      return { status: 'APPROVE', message: 'WFH request, no impact on team capacity.' };
    }
    return null;
  }
}