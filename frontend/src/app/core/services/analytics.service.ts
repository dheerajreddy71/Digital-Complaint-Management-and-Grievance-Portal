import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import {
	StaffPerformance,
	AuditLog,
	PaginatedResponse,
	Feedback,
} from "../models";

export interface AnalyticsData {
	overview: any;
	by_status: any[];
	by_category: any[];
	by_priority: any[];
	trends: any[];
	staff_performance: any[];
	top_locations: any[];
}

@Injectable({
	providedIn: "root",
})
export class AnalyticsService {
	private readonly API_URL = `${environment.apiUrl}/analytics`;

	constructor(private http: HttpClient) {}

	getAnalytics(
		filters?:
			| { period?: string; start_date?: string; end_date?: string }
			| string
	): Observable<AnalyticsData> {
		let params = new HttpParams();

		if (typeof filters === "string") {
			params = params.set("start_date", filters);
		} else if (filters) {
			if (filters.period) {
				params = params.set("period", filters.period);
			}
			if (filters.start_date) {
				params = params.set("start_date", filters.start_date);
			}
			if (filters.end_date) {
				params = params.set("end_date", filters.end_date);
			}
		}

		return this.http.get<AnalyticsData>(this.API_URL, { params });
	}

	getStaffPerformance(staffId: string | number): Observable<StaffPerformance> {
		return this.http.get<StaffPerformance>(
			`${this.API_URL}/staff/${staffId}/performance`
		);
	}

	getStaffFeedback(staffId: string | number): Observable<Feedback[]> {
		return this.http.get<Feedback[]>(
			`${this.API_URL}/staff/${staffId}/feedback`
		);
	}

	getAuditLogs(params: any): Observable<PaginatedResponse<AuditLog>> {
		let httpParams = new HttpParams();
		Object.keys(params).forEach((key) => {
			if (params[key] !== undefined && params[key] !== null) {
				httpParams = httpParams.set(key, params[key].toString());
			}
		});
		return this.http.get<PaginatedResponse<AuditLog>>(
			`${environment.apiUrl}/audit-logs`,
			{ params: httpParams }
		);
	}
}
