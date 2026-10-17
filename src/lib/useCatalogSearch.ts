import { useEffect, useState } from 'react';
import { searchBooks } from '../api/books';
import type { Book, Genre, RequestStatus } from '../types';

const SUBJECTS: Record<Genre, string> = {
  'Программирование': 'programming',
  'Фантастика': 'science fiction',
  'Классика': 'classics',
  'Фэнтези': 'fantasy',
  'Сказка': 'fairy tales'
};

export interface CatalogSearchResult {
  books: Book[];
  total: number;
  status: RequestStatus;
  error: string | null;
  retry: () => void;
}

export function useCatalogSearch(query: string, genre: Genre | '', page: number): CatalogSearchResult {
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setBooks([]);
      setTotal(0);
      setStatus('idle');
      setError(null);
      return;
    }

    setStatus('loading');
    setError(null);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const load = async (): Promise<void> => {
        try {
          const result = await searchBooks(
            normalizedQuery,
            page,
            20,
            controller.signal,
            genre ? SUBJECTS[genre] : ''
          );
          if (controller.signal.aborted) return;
          const mappedBooks = result.docs.map((doc, index): Book => {
            const workKey = doc.key ?? '';
            const title = doc.title ?? 'Без названия';
            const author = doc.author_name?.join(', ') || 'Автор не указан';
            const id = workKey || `${title}-${author}-${doc.first_publish_year ?? index}`;
            return {
              id,
              title,
              author,
              year: doc.first_publish_year ?? null,
              genre: genre || doc.subject?.[0] || '',
              rating: doc.ratings_average ?? null,
              available: null,
              cover: doc.cover_i
                ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                : '/covers/placeholder.jpg',
              source: 'openLibrary',
              ...(workKey.startsWith('/works/') ? { workKey } : {})
            };
          });
          setBooks(mappedBooks);
          setTotal(result.numFound);
          setStatus(mappedBooks.length ? 'success' : 'empty');
        } catch (caughtError) {
          if (controller.signal.aborted) return;
          setError(caughtError instanceof Error ? caughtError.message : 'Не удалось загрузить книги.');
          setStatus('error');
        }
      };

      void load();
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [genre, page, query, retryToken]);

  return {
    books,
    total,
    status,
    error,
    retry: () => setRetryToken((current) => current + 1)
  };
}
