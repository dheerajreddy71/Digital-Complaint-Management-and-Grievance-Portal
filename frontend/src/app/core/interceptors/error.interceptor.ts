import { Injectable } from "@angular/core";
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor,
	HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";
import { SnackbarService } from "../services/snackbar.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
	constructor(private router: Router, private snackbar: SnackbarService) {}

	intercept(
		request: HttpRequest<unknown>,
		next: HttpHandler
	): Observable<HttpEvent<unknown>> {
		return next.handle(request).pipe(
			catchError((error: HttpErrorResponse) => {
				let errorMessage = "An unexpected error occurred";

				if (error.error instanceof ErrorEvent) {
					// Client-side error
					errorMessage = error.error.message;
				} else {
					// Server-side error
					switch (error.status) {
						case 0:
							errorMessage =
								"Unable to connect to server. Please check your internet connection.";
							break;
						case 400:
							errorMessage = error.error?.message || "Invalid request";
							if (error.error?.errors) {
								const errors = Object.values(error.error.errors).flat();
								errorMessage = errors.join(", ");
							}
							break;
						case 401:
							// Handled by auth interceptor
							return throwError(() => error);
						case 403:
							errorMessage =
								"You do not have permission to perform this action";
							break;
						case 404:
							errorMessage = error.error?.message || "Resource not found";
							break;
						case 409:
							errorMessage =
								error.error?.message || "Conflict with existing data";
							break;
						case 422:
							errorMessage = error.error?.message || "Validation error";
							if (error.error?.errors) {
								const errors = Object.values(error.error.errors).flat();
								errorMessage = errors.join(", ");
							}
							break;
						case 429:
							errorMessage = "Too many requests. Please try again later.";
							break;
						case 500:
							errorMessage = "Internal server error. Please try again later.";
							break;
						case 503:
							errorMessage =
								"Service temporarily unavailable. Please try again later.";
							break;
						default:
							errorMessage = error.error?.message || `Error: ${error.status}`;
					}
				}

				// Show error notification unless it's a 401 (handled by auth interceptor)
				if (error.status !== 401) {
					this.snackbar.error(errorMessage);
				}

				return throwError(() => new Error(errorMessage));
			})
		);
	}
}
