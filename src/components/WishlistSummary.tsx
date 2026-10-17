import type { Book } from '../types';
import { Badge } from './Badge';
import { BookList } from './BookList';
import { EmptyState } from './EmptyState';

export interface WishlistSummaryProps {
  books: Book[];
  wishlistIds: string[];
  onToggleWishlist: (book: Book) => void;
}

export function WishlistSummary({ books, wishlistIds, onToggleWishlist }: WishlistSummaryProps) {
  const savedBooks = books.filter((book) => wishlistIds.includes(book.id));
  return (
    <section aria-labelledby="wishlist-heading" className="wishlist-summary" id="wishlist">
      <h2 id="wishlist-heading">Мой список <Badge tone="count">{wishlistIds.length}</Badge></h2>
      {savedBooks.length
        ? <BookList books={savedBooks} onToggleWishlist={onToggleWishlist} wishlistIds={wishlistIds} />
        : <EmptyState title="Список пока пуст" description="Добавляйте книги кнопкой «Хочу прочитать»." />}
    </section>
  );
}
