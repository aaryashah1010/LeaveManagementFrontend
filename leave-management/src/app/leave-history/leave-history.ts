import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-leave-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-history.html',
  styleUrl: './leave-history.scss'
})
export class LeaveHistoryComponent implements OnInit {

  leaves: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchLeaveHistory();
  }

  fetchLeaveHistory() {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any[]>(
      `${environment.apiUrl}/leaves/history`,
      { headers }
    ).subscribe({

      next: (data) => {
        console.log(data);
        this.leaves = data;
      },

      error: (err) => {
        console.error(err);
      }

    });

  }

}