import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingApprovals } from './pending-approvals';

describe('PendingApprovals', () => {
  let component: PendingApprovals;
  let fixture: ComponentFixture<PendingApprovals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingApprovals],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingApprovals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
