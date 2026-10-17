import { fetchApi } from './client';
import type {
  OpenLibraryEditionsResponse,
  OpenLibrarySearchResponse,
  OpenLibraryWork,
  SearchResult
} from '../types';

const SEARCH_FIELDS = 'key,title,author_name,first_publish_year,subject,cover_i,ratings_average';

export async function searchBooks(
  query: string,
  page: number,
  limit: number,
  signal: AbortSignal,
  subject: string
): Promise<SearchResult> {
  const searchQuery = subject ? `${query.trim()} subject:"${subject}"` : query.trim();
  const data = await fetchApi<OpenLibrarySearchResponse>('/search.json', {
    q: searchQuery,
    page,
    limit,
    fields: SEARCH_FIELDS
  }, signal);

  return {
    docs: data.docs ?? [],
    numFound: data.numFound ?? data.num_found ?? 0
  };
}

export async function getBookDetails(workKey: string, signal: AbortSignal): Promise<{
  work: OpenLibraryWork;
  editionCount: number;
}> {
  const workPath = normalizeWorkPath(workKey);
  const [work, editions] = await Promise.all([
    fetchApi<OpenLibraryWork>(`${workPath}.json`, {}, signal),
    fetchApi<OpenLibraryEditionsResponse>(`${workPath}/editions.json`, { limit: 1 }, signal)
  ]);

  return { work, editionCount: editions.size ?? editions.numFound ?? 0 };
}

function normalizeWorkPath(workKey: string): string {
  const path = (workKey.startsWith('/') ? workKey : `/works/${workKey}`)
    .replace(/\.json$/, '')
    .replace(/\/+$/, '');
  if (!/^\/works\/OL\d+W$/.test(path)) {
    throw new Error('Некорректный идентификатор произведения Open Library.');
  }
  return path;
}
