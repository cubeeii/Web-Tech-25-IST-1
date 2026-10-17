const BASE_URL = 'https://openlibrary.org';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
  signal?: AbortSignal
): Promise<T> {
  const url = new URL(endpoint, BASE_URL);
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => query.set(key, String(value)));
  url.search = query.toString();

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      const message = response.status >= 500
        ? `Open Library временно недоступна (${response.status}).`
        : `Open Library отклонила запрос (${response.status}).`;
      throw new ApiError(message, response.status);
    }
    return await response.json() as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    if (error instanceof ApiError) throw error;
    throw new ApiError('Не удалось подключиться к Open Library.', 0);
  }
}
