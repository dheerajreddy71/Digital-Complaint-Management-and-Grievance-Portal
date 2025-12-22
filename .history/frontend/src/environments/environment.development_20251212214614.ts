export const environment = {
	production: false,
	apiUrl: "/api",
	tokenRefreshInterval: 25 * 60 * 1000, // 25 minutes
	maxFileSize: 5 * 1024 * 1024, // 5MB
	allowedFileTypes: ["image/jpeg", "image/png", "application/pdf"],
	defaultPageSize: 10,
	pageSizeOptions: [5, 10, 25, 50],
};
