import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import {
	User,
	AvailabilityStatus,
	StaffWorkload,
	PaginatedResponse,
} from "../models";

@Injectable({
	providedIn: "root",
})
export class UserService {
	private readonly API_URL = `${environment.apiUrl}/users`;

	constructor(private http: HttpClient) {}

	getCurrentUser(): Observable<User> {
		return this.http.get<User>(`${this.API_URL}/me`);
	}

	updateProfile(updates: {
		name?: string;
		email?: string;
		phone?: string;
	}): Observable<User> {
		return this.http.put<User>(`${this.API_URL}/me`, updates);
	}

	updateAvailability(
		status: AvailabilityStatus | boolean,
		userId?: string | number
	): Observable<User> {
		const availabilityStatus =
			typeof status === "boolean"
				? status
					? AvailabilityStatus.AVAILABLE
					: AvailabilityStatus.OFFLINE
				: status;
		const url = userId
			? `${this.API_URL}/${userId}/availability`
			: `${this.API_URL}/me/availability`;
		return this.http.put<User>(url, { status: availabilityStatus });
	}

	updateUser(id: string, updates: any): Observable<User> {
		return this.http.put<User>(`${this.API_URL}/${id}`, updates);
	}

	createUser(data: any): Observable<User> {
		return this.http.post<User>(this.API_URL, data);
	}

	getStaffList(): Observable<User[]> {
		return this.http.get<User[]>(`${this.API_URL}/staff`);
	}

	getStaffWorkload(): Observable<StaffWorkload[]> {
		return this.http.get<StaffWorkload[]>(`${this.API_URL}/staff/workload`);
	}

	getAllUsers(page = 1, limit = 10): Observable<PaginatedResponse<User>> {
		const params = new HttpParams()
			.set("page", String(page))
			.set("limit", String(limit));

		return this.http.get<PaginatedResponse<User>>(this.API_URL, { 
			params,
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'Pragma': 'no-cache',
				'Expires': '0'
			}
		});
	}

	deleteUser(id: string): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`);
	}

	updateUserRole(id: string, role: string): Observable<User> {
		return this.http.put<User>(`${this.API_URL}/${id}/role`, { role });
	}
}
