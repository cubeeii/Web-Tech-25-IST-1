import { fetchApi } from './client.js';

/**
 * Поиск книг через Open Library Search API
 * @param {string} query - Поисковый запрос (название или автор)
 * @param {number} [page=1] - Номер страницы для пагинации
 * @param {number} [limit=20] - Количество записей на странице
 * @param {AbortSignal} [signal] - Сигнал отмены запроса (AbortController)
 */
export async function searchBooks(query, page = 1, limit = 20, signal = null, subject = '') {
  if (!query || query.trim() === '') {
    return { docs: [], numFound: 0 };
  }

  const searchQuery = subject
    ? `${query.trim()} subject:"${subject}"`
    : query.trim();

  const data = await fetchApi('/search.json', {
    q: searchQuery,
    page,
    limit,
    fields: 'key,title,author_name,first_publish_year,subject,cover_i,ratings_average'
  }, signal);

  return {
    docs: data.docs || [],
    numFound: data.numFound ?? data.num_found ?? 0
  };
}

/**
 * Получение подробной информации о книге по её ключу (например, '/works/OL45804W')
 * @param {string} bookKey - Ключ или ID произведения
 * @param {AbortSignal} [signal] - Сигнал отмены запроса
 */
export async function getBookDetails(bookKey, signal = null) {
  const workPath = normalizeWorkPath(bookKey);
  return await fetchApi(`${workPath}.json`, {}, signal);
}

/**
 * Independently loads a work and its editions for the book details page.
 * @param {string} bookKey - Open Library work key or ID
 * @param {AbortSignal} [signal] - Request cancellation signal
 */
export async function getBookDetailsWithEditions(bookKey, signal = null) {
  const workPath = normalizeWorkPath(bookKey);
  const [work, editions] = await Promise.all([
    fetchApi(`${workPath}.json`, {}, signal),
    fetchApi(`${workPath}/editions.json`, { limit: 1 }, signal)
  ]);

  return { work, editionCount: editions.size ?? editions.numFound ?? 0 };
}

function normalizeWorkPath(bookKey) {
  if (!bookKey) {
    throw new Error('Не указан идентификатор книги');
  }

  let workPath = bookKey.startsWith('/') ? bookKey : `/works/${bookKey}`;
  workPath = workPath.replace(/\.json$/, '').replace(/\/+$/, '');

  if (!/^\/works\/OL\d+W$/.test(workPath)) {
    throw new Error('Некорректный идентификатор произведения Open Library');
  }

  return workPath;
}