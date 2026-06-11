import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveFormDialog } from './leave-form-dialog';

describe('LeaveFormDialog', () => {
  let component: LeaveFormDialog;
  let fixture: ComponentFixture<LeaveFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaveFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
