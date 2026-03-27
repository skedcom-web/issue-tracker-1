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

export function ok<T>(data: T, message = 'Operation successful'): ApiResponse<T> {
  return { success: true, message, data };
}

export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Data retrieved successfully',
): ApiResponse<PaginatedResult<T>> {
  return {
    success: true,
    message,
    data: {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
