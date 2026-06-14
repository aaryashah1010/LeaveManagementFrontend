import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-leave-form-dialog', // Keeping the original name to prevent compiler errors
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
  
  // We use Outputs to talk to the dashboard instead of closing a dialog
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

  onSubmit() {
    if (this.leaveForm.valid) {
      this.submitForm.emit(this.leaveForm.value);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}