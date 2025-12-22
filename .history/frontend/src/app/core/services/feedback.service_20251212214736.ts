import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Feedback, CreateFeedbackRequest, StaffPerformanceMetrics } from '../models';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private readonly API_URL = `${environment.apiUrl}/feedback`;

  constructor(private http: HttpClient) {}

  submitFeedback(request: CreateFeedbackRequest): Observable<Feedback> {
    return this.http.post<Feedback>(this.API_URL, request);
  }

  getFeedbackByComplaint(complaintId: string): Observable<Feedback | null> {
    return this.http.get<Feedback | null>(`${this.API_URL}/complaint/${complaintId}`);
  }

  getStaffPerformance(
    startDate?: string,
    endDate?: string
  ): Observable<StaffPerformanceMetrics[]> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }

    return this.http.get<StaffPerformanceMetrics[]>(`${this.API_URL}/staff-performance`, {
      params,
    });
  }

  getAllFeedback(page = 1, limit = 10): Observable<{ data: Feedback[]; total: number }> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    return this.http.get<{ data: Feedback[]; total: number }>(this.API_URL, { params });
  }
}
