// Базовый URL Open Library API
const BASE_URL = 'https://openlibrary.org';

// Кастомный класс ошибки с сохранением HTTP-статуса
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Вспомогательная функция для выполнения HTTP-запросов
 * @param {string} endpoint - Путь (например, '/search.json')
 * @param {Object} params - Объект с query-параметрами
 * @param {AbortSignal} [signal] - Сигнал отмена запроса (AbortController)
 */
export async function fetchApi(endpoint, params = {}, signal = null) {
  // 1. Формируем URL с query-параметрами через URLSearchParams
  const url = new URL(endpoint, BASE_URL);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });

  const options = {};
  if (signal) {
    options.signal = signal;
  }

  try {
    // 2. Выполняем сетевой запрос
    const response = await fetch(url.toString(), options);

    // 3. Проверяем response.ok (коды 200–299)
    if (!response.ok) {
      // Различаем сообщения для 4xx и 5xx ошибок
      let errorMessage = `Ошибка сервера: ${response.status}`;
      if (response.status >= 400 && response.status < 500) {
        errorMessage = `Ошибка запроса (${response.status}): запрашиваемый ресурс не найден или недоступен.`;
      } else if (response.status >= 500) {
        errorMessage = `Сервер временно недоступен (${response.status}). Попробуйте позже.`;
      }

      throw new ApiError(errorMessage, response.status);
    }

    // 4. Возвращаем распарсенный JSON
    return await response.json();

  } catch (error) {
    // Если запрос был отменен через AbortController — пробрасываем AbortError дальше,
    // чтобы UI знал, что это не сбой сети, а плановая отмена
    if (error.name === 'AbortError') {
      throw error;
    }

    // Если это уже наша ApiError — просто пробрасываем
    if (error instanceof ApiError) {
      throw error;
    }

    // В остальных случаях (например, нет интернета / TypeError при сетевом сбое)
    throw new ApiError('Отсутствует подключение к сети. Проверьте интернет-соединение.', 0);
  }
}