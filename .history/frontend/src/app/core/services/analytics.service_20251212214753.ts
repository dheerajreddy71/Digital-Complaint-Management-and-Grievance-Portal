import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AnalyticsData } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly API_URL = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getAnalytics(startDate?: string, endDate?: string): Observable<AnalyticsData> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }

    return this.http.get<AnalyticsData>(this.API_URL, { params });
  }
}
