import { useMemo } from 'react';
import { sortBooks } from '../lib/books';
import type { Book, BookFilters, RequestStatus } from '../types';
import type { CatalogSearchResult } from '../lib/useCatalogSearch';
import { BookList } from './BookList';
import { CatalogStatus } from './CatalogStatus';
import { EmptyState } from './EmptyState';
import { FiltersPanel } from './FiltersPanel';
import { Pagination } from './Pagination';
import { WishlistSummary } from './WishlistSummary';

export interface CatalogPageProps {
  filters: BookFilters;
  localBooks: Book[];
  search: CatalogSearchResult;
  wishlistBooks: Book[];
  wishlistIds: string[];
  page: number;
  onFiltersChange: (filters: Partial<BookFilters>) => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
  onToggleWishlist: (book: Book) => void;
}

export function CatalogPage(props: CatalogPageProps) {
  const apiSearchActive = Boolean(props.filters.search.trim());
  const displayedBooks = useMemo(
    () => sortBooks(apiSearchActive ? props.search.books : props.localBooks, props.filters.sortBy),
    [apiSearchActive, props.filters.sortBy, props.localBooks, props.search.books]
  );
  const pageCount = Math.ceil(props.search.total / 20);
  const status: RequestStatus = apiSearchActive ? props.search.status : 'idle';

  return (
    <>
      <h1>Каталог книг библиотеки BookNest</h1>
      <FiltersPanel
        apiSearchActive={apiSearchActive}
        filters={props.filters}
        onAvailabilityChange={(onlyAvailable) => props.onFiltersChange({ onlyAvailable })}
        onGenreChange={(genre) => props.onFiltersChange({ genre })}
        onReset={props.onResetFilters}
        onSearchChange={(search) => props.onFiltersChange({ search })}
        onSortChange={(sortBy) => props.onFiltersChange({ sortBy })}
      />
      <p id="books-count" aria-live="polite">
        {apiSearchActive
          ? status === 'loading'
            ? 'Поиск…'
            : `Показано книг: ${displayedBooks.length} из ${props.search.total}`
          : `Найдено книг: ${displayedBooks.length}`}
      </p>
      <p className="catalog-message" role="status">
        {status === 'success' ? 'Результаты из Open Library. Наличие в BookNest не проверяется.' : ''}
      </p>
      {apiSearchActive && (
        <CatalogStatus error={props.search.error} onRetry={props.search.retry} status={status} />
      )}
      {!apiSearchActive && displayedBooks.length === 0 && (
        <EmptyState title="Книги не найдены" description="Попробуйте изменить параметры фильтрации." />
      )}
      {(!apiSearchActive || status === 'success') && displayedBooks.length > 0 && (
        <BookList books={displayedBooks} onToggleWishlist={props.onToggleWishlist} wishlistIds={props.wishlistIds} />
      )}
      {apiSearchActive && status === 'success' && (
        <Pagination
          onPageChange={props.onPageChange}
          page={props.page}
          pageCount={pageCount}
        />
      )}
      <WishlistSummary
        books={props.wishlistBooks}
        onToggleWishlist={props.onToggleWishlist}
        wishlistIds={props.wishlistIds}
      />
    </>
  );
}
