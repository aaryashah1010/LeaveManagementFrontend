import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // Removed formatDate, we don't need it anymore!
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-leave-form-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatIconModule
  ],
  templateUrl: './leave-form-dialog.html',
  styleUrls: ['./leave-form-dialog.scss']
})
export class LeaveFormDialogComponent {
  
  @Output() cancel = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<any>();

  leaveForm: FormGroup;
  leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Work From Home'];

  constructor(private fb: FormBuilder) {
    this.leaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      halfDay: [false],
      reason: ['', Validators.required],
      emergencyContact: ['']
    });
  }

  // 1. ADD THIS TIMEZONE-IMMUNE HELPER FUNCTION
  private toSafeISODate(dateValue: any): string {
    if (!dateValue) return '';
    
    // Force the value into a JS Date object
    const d = new Date(dateValue);
    
    // Manually extract exactly what the user sees on their screen
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    // Stitch it together manually: "YYYY-MM-DD"
    return `${year}-${month}-${day}`;
  }

  onSubmit() {
    if (this.leaveForm.valid) {
      const formValues = this.leaveForm.value;
      
      // 2. USE THE HELPER FUNCTION HERE
      const safeStartDate = this.toSafeISODate(formValues.startDate);
      const safeEndDate = this.toSafeISODate(formValues.endDate);

      const safePayload = {
        ...formValues,
        startDate: safeStartDate,
        endDate: safeEndDate
      };

      this.submitForm.emit(safePayload);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}