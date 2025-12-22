import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import {
	Complaint,
	CreateComplaintRequest,
	UpdateComplaintRequest,
	ComplaintFilters,
	PaginatedResponse,
	ComplaintSuggestion,
	DuplicateCheckResult,
	StatusHistory,
} from "../models";

@Injectable({
	providedIn: "root",
})
export class ComplaintService {
	private readonly API_URL = `${environment.apiUrl}/complaints`;

	constructor(private http: HttpClient) {}

	getComplaints(
		filters?: ComplaintFilters
	): Observable<PaginatedResponse<Complaint>> {
		let params = new HttpParams();

		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== "") {
					params = params.set(key, String(value));
				}
			});
		}

		return this.http.get<PaginatedResponse<Complaint>>(this.API_URL, {
			params,
		});
	}

	getComplaintById(id: string): Observable<Complaint> {
		return this.http.get<Complaint>(`${this.API_URL}/${id}`);
	}

	createComplaint(complaint: CreateComplaintRequest): Observable<Complaint> {
		const formData = new FormData();
		formData.append("category", complaint.category);
		formData.append("priority", complaint.priority);
		formData.append("title", complaint.title);
		formData.append("description", complaint.description);
		formData.append("location", complaint.location);

		if (complaint.attachment) {
			formData.append("attachments", complaint.attachment);
		}

		return this.http.post<Complaint>(this.API_URL, formData);
	}

	updateComplaint(
		id: string,
		update: UpdateComplaintRequest
	): Observable<Complaint> {
		return this.http.put<Complaint>(`${this.API_URL}/${id}`, update);
	}

	deleteComplaint(id: string): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`);
	}

	assignComplaint(id: string | number, staffId: string | number): Observable<Complaint> {
		return this.http.post<Complaint>(`${this.API_URL}/${id}/assign`, {
			staff_id: staffId,
		});
	}

	autoAssignComplaint(id: string): Observable<Complaint> {
		return this.http.post<Complaint>(`${this.API_URL}/${id}/auto-assign`, {});
	}

	getSuggestions(
		data: { title: string; description: string } | string,
		description?: string
	): Observable<ComplaintSuggestion> {
		const payload =
			typeof data === "string"
				? { title: data, description: description || "" }
				: data;
		return this.http.post<ComplaintSuggestion>(
			`${this.API_URL}/suggest`,
			payload
		);
	}

	checkDuplicates(
		data: { title: string; description: string } | string,
		description?: string
	): Observable<DuplicateCheckResult> {
		const payload =
			typeof data === "string"
				? { title: data, description: description || "" }
				: data;
		return this.http.post<DuplicateCheckResult>(
			`${this.API_URL}/check-duplicates`,
			payload
		);
	}

	getTimeline(id: string): Observable<StatusHistory[]> {
		return this.http.get<StatusHistory[]>(`${this.API_URL}/${id}/timeline`);
	}

	getStatusHistory(id: string): Observable<StatusHistory[]> {
		return this.getTimeline(id);
	}

	bulkAssign(
		complaintIds: string[],
		staffId: string
	): Observable<{ success: number; failed: number }> {
		return this.http.post<{ success: number; failed: number }>(
			`${this.API_URL}/bulk/assign`,
			{
				complaint_ids: complaintIds,
				staff_id: staffId,
			}
		);
	}

	bulkUpdateStatus(
		complaintIds: string[],
		status: string,
		notes?: string
	): Observable<{ success: number; failed: number }> {
		return this.http.post<{ success: number; failed: number }>(
			`${this.API_URL}/bulk/status`,
			{
				complaint_ids: complaintIds,
				status,
				notes,
			}
		);
	}

	getMyComplaints(
		filters?: ComplaintFilters
	): Observable<PaginatedResponse<Complaint>> {
		return this.getComplaints({ ...filters, user_id: "me" });
	}

	getAssignedComplaints(
		filters?: ComplaintFilters
	): Observable<PaginatedResponse<Complaint>> {
		return this.getComplaints({ ...filters, assigned_to: "me" });
	}

	getOverdueComplaints(
		filters?: ComplaintFilters
	): Observable<PaginatedResponse<Complaint>> {
		return this.getComplaints({ ...filters, is_overdue: true });
	}
}
