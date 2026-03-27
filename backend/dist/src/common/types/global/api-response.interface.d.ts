export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
}
export interface PaginatedMeta extends Record<string, unknown> {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare function ok<T>(data: T, message?: string): ApiResponse<T>;
export declare function paginated<T>(items: T[], total: number, page: number, limit: number, message?: string): ApiResponse<PaginatedResult<T>>;
