import { useEffect, useState } from 'react';
import { getBookDetails } from '../api/books';
import type { Book, OpenLibraryWork, RequestStatus } from '../types';
import { Badge } from './Badge';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { ErrorBox } from './ErrorBox';
import { Spinner } from './Spinner';

export interface BookDetailsPageProps {
  book: Book | null;
  workKey: string | null;
  isWishlisted: boolean;
  onToggleWishlist: (book: Book) => void;
}

function makeApiBook(key: string, work: OpenLibraryWork): Book {
  const workKey = key.startsWith('/') ? key : `/works/${key}`;
  const coverId = work.covers?.find((cover) => Number.isInteger(cover) && cover > 0);
  return {
    id: workKey,
    workKey,
    title: work.title ?? 'Без названия',
    author: 'Сведения об авторе доступны на Open Library',
    year: null,
    genre: work.subjects?.slice(0, 3).join(', ') ?? '',
    rating: null,
    available: null,
    cover: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : '/covers/placeholder.jpg',
    source: 'openLibrary',
    externalUrl: `https://openlibrary.org${workKey}`
  };
}

export function BookDetailsPage({
  book,
  workKey,
  isWishlisted,
  onToggleWishlist
}: BookDetailsPageProps) {
  const [details, setDetails] = useState<Book | null>(book);
  const [editionCount, setEditionCount] = useState<number | null>(null);
  const [status, setStatus] = useState<RequestStatus>(workKey ? 'loading' : book ? 'success' : 'empty');
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!workKey) return;
    const controller = new AbortController();

    const load = async (): Promise<void> => {
      setStatus('loading');
      setError(null);
      try {
        const { work, editionCount: editions } = await getBookDetails(workKey, controller.signal);
        if (controller.signal.aborted) return;
        setDetails(makeApiBook(workKey, work));
        setEditionCount(editions);
        setStatus('success');
      } catch (caughtError) {
        if (controller.signal.aborted) return;
        setError(caughtError instanceof Error ? caughtError.message : 'Не удалось загрузить книгу.');
        setStatus('error');
      }
    };

    void load();
    return () => controller.abort();
  }, [retryToken, workKey]);

  if (status === 'loading') return <Spinner />;
  if (status === 'error') {
    return <ErrorBox message={error ?? 'Не удалось загрузить книгу.'} onRetry={() => setRetryToken((value) => value + 1)} />;
  }
  if (!details) {
    return <EmptyState title="Книга не найдена" description="Вернитесь в каталог и выберите другую книгу." />;
  }

  return (
    <article className="book-details">
      <figure>
        <img alt={`Обложка книги «${details.title}»`} height="450" src={details.cover} width="300" />
      </figure>
      <div className="book-info">
        <h1>{details.title}</h1>
        <p><strong>Автор:</strong> {details.author}</p>
        <p><strong>Год издания:</strong> {details.year ?? 'Не указан'}</p>
        <p><strong>Жанр:</strong> {details.genre || 'Не указан'}</p>
        <p><strong>Рейтинг:</strong> {details.rating === null ? 'Не указан' : <Badge tone="rating">⭐ {details.rating}</Badge>}</p>
        <p><strong>Статус:</strong> {details.available === null
          ? <Badge tone="muted">Нет данных в BookNest</Badge>
          : <Badge tone={details.available ? 'available' : 'unavailable'}>{details.available ? 'В наличии' : 'Выдана'}</Badge>}
        </p>
        {workKey && <a href={details.externalUrl} rel="noopener noreferrer" target="_blank">Открыть на Open Library</a>}
        {editionCount !== null && <p>Изданий: {editionCount}</p>}
        <Button aria-pressed={isWishlisted} onClick={() => onToggleWishlist(details)} type="button">
          {isWishlisted ? 'Убрать из списка' : 'Хочу прочитать'}
        </Button>
      </div>
    </article>
  );
}
