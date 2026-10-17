import type { Book } from '../types';
import { Badge } from './Badge';
import { Button } from './Button';

export interface BookCardProps {
  book: Book;
  isWishlisted: boolean;
  onToggleWishlist: (book: Book) => void;
}

export function BookCard({ book, isWishlisted, onToggleWishlist }: BookCardProps) {
  const detailsUrl = book.workKey
    ? `/?work=${encodeURIComponent(book.workKey)}`
    : `/?id=${encodeURIComponent(book.id)}`;

  return (
    <article className="book-card">
      <figure>
        <img
          src={book.cover}
          alt={`Обложка книги «${book.title}»`}
          width="150"
          height="220"
          onError={(event) => {
            event.currentTarget.src = '/covers/placeholder.jpg';
          }}
        />
      </figure>
      <h3>{book.title}</h3>
      <p>Автор: {book.author}{book.year ? ` (${book.year})` : ''}</p>
      <p className="book-card__metadata">
        <span>Жанр: {book.genre || 'Не указан'}</span>
        <Badge tone="rating">{book.rating === null ? 'Рейтинг не указан' : `⭐ ${book.rating}`}</Badge>
      </p>
      <p>
        {book.available === null
          ? <Badge tone="muted">Наличие неизвестно</Badge>
          : <Badge tone={book.available ? 'available' : 'unavailable'}>
            {book.available ? 'В наличии' : 'Выдана'}
          </Badge>}
      </p>
      <a className="book-card__details" href={detailsUrl}>Подробнее о книге</a>
      <Button
        aria-pressed={isWishlisted}
        className="wishlist-btn"
        onClick={() => onToggleWishlist(book)}
        type="button"
        variant="secondary"
      >
        {isWishlisted ? 'Убрать из списка' : 'Хочу прочитать'}
      </Button>
    </article>
  );
}
