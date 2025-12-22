import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { Comment, CreateCommentRequest } from "../models";

@Injectable({
	providedIn: "root",
})
export class CommentService {
	private readonly API_URL = `${environment.apiUrl}/comments`;

	constructor(private http: HttpClient) {}

	getCommentsByComplaint(complaintId: string): Observable<Comment[]> {
		return this.http.get<Comment[]>(`${this.API_URL}/complaint/${complaintId}`);
	}
	getCommentsByComplaintId(complaintId: string): Observable<Comment[]> {
		return this.getCommentsByComplaint(complaintId);
	}
	createComment(request: CreateCommentRequest): Observable<Comment> {
		return this.http.post<Comment>(this.API_URL, request);
	}

	deleteComment(id: string): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`);
	}
}
