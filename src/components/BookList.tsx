import type { Book } from '../types';
import { BookCard } from './BookCard';

export interface BookListProps {
  books: Book[];
  wishlistIds: string[];
  onToggleWishlist: (book: Book) => void;
}

export function BookList({ books, wishlistIds, onToggleWishlist }: BookListProps) {
  return (
    <div className="catalog-grid">
      {books.map((book) => (
        <BookCard
          book={book}
          isWishlisted={wishlistIds.includes(book.id)}
          key={`${book.source}:${book.id}`}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  );
}
