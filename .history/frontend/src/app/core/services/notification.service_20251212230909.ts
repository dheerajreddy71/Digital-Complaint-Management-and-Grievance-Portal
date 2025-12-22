import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { environment } from "@environments/environment";
import { Notification } from "../models";

@Injectable({
	providedIn: "root",
})
export class NotificationService {
	private readonly API_URL = `${environment.apiUrl}/notifications`;

	private unreadCountSubject = new BehaviorSubject<number>(0);
	unreadCount$ = this.unreadCountSubject.asObservable();

	constructor(private http: HttpClient) {}

	getNotifications(params?: {
		page?: number;
		limit?: number;
	}): Observable<{ data: Notification[]; total: number }> {
		const httpParams = new HttpParams()
			.set("page", String(params?.page || 1))
			.set("limit", String(params?.limit || 20));

		return this.http.get<{ data: Notification[]; total: number }>(
			this.API_URL,
			{ params: httpParams }
		);
	}

	getUnreadCount(): Observable<{ count: number }> {
		return this.http
			.get<{ count: number }>(`${this.API_URL}/unread-count`)
			.pipe(tap((response) => this.unreadCountSubject.next(response.count)));
	}

	loadUnreadCount(): void {
		this.getUnreadCount().subscribe();
	}

	markAsRead(id: string): Observable<void> {
		return this.http.put<void>(`${this.API_URL}/${id}/read`, {}).pipe(
			tap(() => {
				const currentCount = this.unreadCountSubject.value;
				if (currentCount > 0) {
					this.unreadCountSubject.next(currentCount - 1);
				}
			})
		);
	}

	markAllAsRead(): Observable<void> {
		return this.http
			.put<void>(`${this.API_URL}/read-all`, {})
			.pipe(tap(() => this.unreadCountSubject.next(0)));
	}

	deleteNotification(id: string): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
			tap(() => {
				const currentCount = this.unreadCountSubject.value;
				if (currentCount > 0) {
					this.unreadCountSubject.next(currentCount - 1);
				}
			})
		);
	}

	updateUnreadCount(count: number): void {
		this.unreadCountSubject.next(count);
	}
}
