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

	getNotifications(
		page = 1,
		limit = 20
	): Observable<{ data: Notification[]; total: number }> {
		const params = new HttpParams()
			.set("page", String(page))
			.set("limit", String(limit));

		return this.http.get<{ data: Notification[]; total: number }>(
			this.API_URL,
			{ params }
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

	updateUnreadCount(count: number): void {
		this.unreadCountSubject.next(count);
	}
}
