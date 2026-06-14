import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutService {
  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000;
  private readonly WARNING_TIME = 2 * 60 * 1000;
  
  private timeoutHandle: any;
  private warningHandle: any;
  private readonly onActivity = () => this.resetInactivityTimer();
  sessionWarning$ = new BehaviorSubject<boolean>(false);

  constructor(private router: Router) {}

  startSession() {
    this.resetInactivityTimer();
    document.addEventListener('mousemove', this.onActivity);
    document.addEventListener('keydown', this.onActivity);
    document.addEventListener('click', this.onActivity);
  }

  resetInactivityTimer() {
    clearTimeout(this.timeoutHandle);
    clearTimeout(this.warningHandle);
    this.sessionWarning$.next(false);

    this.warningHandle = setTimeout(() => {
      this.sessionWarning$.next(true);
    }, this.INACTIVITY_TIMEOUT - this.WARNING_TIME);

    this.timeoutHandle = setTimeout(() => {
      this.logout();
    }, this.INACTIVITY_TIMEOUT);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.sessionWarning$.next(false);
    this.router.navigate(['/login']);
  }

  endSession() {
    clearTimeout(this.timeoutHandle);
    clearTimeout(this.warningHandle);
    document.removeEventListener('mousemove', () => {});
    document.removeEventListener('keydown', () => {});
    document.removeEventListener('click', () => {});
  }
}
