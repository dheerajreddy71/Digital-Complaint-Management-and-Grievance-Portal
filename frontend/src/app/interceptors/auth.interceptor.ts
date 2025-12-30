import { Injectable } from "@angular/core";
import {
	HttpInterceptor,
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthService } from "../services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(
		private authService: AuthService,
		private snackBar: MatSnackBar,
		private router: Router
	) {}

	intercept(
		request: HttpRequest<unknown>,
		next: HttpHandler
	): Observable<HttpEvent<unknown>> {
		const token = this.authService.getToken();

		if (token) {
			request = request.clone({
				setHeaders: {
					Authorization: `Bearer ${token}`,
				},
			});
		}

		return next.handle(request).pipe(
			catchError((error: HttpErrorResponse) => {
				let errorMessage = "An unexpected error occurred";
				let showSnackbar = true;

				if (error.error instanceof ErrorEvent) {
					errorMessage = error.error.message;
				} else {
					switch (error.status) {
						case 401:
							// Only logout and show "session expired" for authenticated requests (not login)
							if (
								request.url.includes("/auth/login") ||
								request.url.includes("/auth/register")
							) {
								// For login/register, use the backend error message
								errorMessage = error.error?.message || "Invalid credentials";
								showSnackbar = false; // Let the component handle the error message
							} else {
								// For other authenticated requests, session has expired
								errorMessage = "Session expired. Please login again.";
								this.authService.logout();
							}
							break;
						case 403:
							errorMessage = error.error?.message || "Access denied";
							break;
						case 404:
							errorMessage = error.error?.message || "Resource not found";
							break;
						case 409:
							errorMessage = error.error?.message || "Resource already exists";
							break;
						case 400:
							if (error.error?.errors) {
								errorMessage = error.error.errors
									.map((e: any) => e.message)
									.join(", ");
							} else {
								errorMessage = error.error?.message || "Invalid request";
							}
							break;
						case 500:
							errorMessage = "Server error. Please try again later.";
							break;
						default:
							errorMessage = error.error?.message || errorMessage;
					}
				}

				if (showSnackbar) {
					this.snackBar.open(errorMessage, "Close", {
						duration: 5000,
						horizontalPosition: "end",
						verticalPosition: "top",
						panelClass: ["error-snackbar"],
					});
				}

				return throwError(() => error);
			})
		);
	}
}
