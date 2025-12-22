import { Injectable } from "@angular/core";
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor,
	HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError, BehaviorSubject } from "rxjs";
import { catchError, filter, take, switchMap, finalize } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	private isRefreshing = false;
	private refreshTokenSubject = new BehaviorSubject<string | null>(null);

	constructor(private authService: AuthService) {}

	intercept(
		request: HttpRequest<unknown>,
		next: HttpHandler
	): Observable<HttpEvent<unknown>> {
		// Skip auth header for auth endpoints
		if (this.isAuthRequest(request)) {
			return next.handle(request);
		}

		const token = this.authService.accessToken;
		if (token) {
			request = this.addToken(request, token);
		}

		return next.handle(request).pipe(
			catchError((error) => {
				if (error instanceof HttpErrorResponse && error.status === 401) {
					return this.handle401Error(request, next);
				}
				return throwError(() => error);
			})
		);
	}

	private isAuthRequest(request: HttpRequest<unknown>): boolean {
		return (
			request.url.includes("/auth/login") ||
			request.url.includes("/auth/register") ||
			request.url.includes("/auth/refresh")
		);
	}

	private addToken(
		request: HttpRequest<unknown>,
		token: string
	): HttpRequest<unknown> {
		return request.clone({
			setHeaders: {
				Authorization: `Bearer ${token}`,
			},
		});
	}

	private handle401Error(
		request: HttpRequest<unknown>,
		next: HttpHandler
	): Observable<HttpEvent<unknown>> {
		if (!this.isRefreshing) {
			this.isRefreshing = true;
			this.refreshTokenSubject.next(null);

			return this.authService.refreshAccessToken().pipe(
				switchMap((response) => {
					if (response) {
						this.refreshTokenSubject.next(response.accessToken);
						return next.handle(this.addToken(request, response.accessToken));
					}
					return throwError(() => new Error("Token refresh failed"));
				}),
				catchError((error) => {
					this.authService.logout().subscribe();
					return throwError(() => error);
				}),
				finalize(() => {
					this.isRefreshing = false;
				})
			);
		}

		return this.refreshTokenSubject.pipe(
			filter((token) => token !== null),
			take(1),
			switchMap((token) => next.handle(this.addToken(request, token!)))
		);
	}
}
