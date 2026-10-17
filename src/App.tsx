import { useMemo, useState } from 'react';
import { BookDetailsPage } from './components/BookDetailsPage';
import { CatalogPage } from './components/CatalogPage';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { WishlistSummary } from './components/WishlistSummary';
import { initialBooks } from './data/books';
import { filterBooks, toLocalBook } from './lib/books';
import { useCatalogSearch } from './lib/useCatalogSearch';
import { useWishlist } from './lib/useWishlist';
import type { BookFilters } from './types';

interface InitialRoute {
  mode: 'catalog' | 'wishlist' | 'details';
  bookId: string | null;
  workKey: string | null;
}

function readInitialRoute(): InitialRoute {
  const params = new URLSearchParams(window.location.search);
  const workKey = params.get('work');
  const bookId = params.get('id');
  return {
    mode: workKey || bookId ? 'details' : params.get('view') === 'wishlist' ? 'wishlist' : 'catalog',
    bookId,
    workKey
  };
}

const localBooks = initialBooks.map(toLocalBook);

export default function App() {
  const [route] = useState(readInitialRoute);
  const [filters, setFilters] = useState<BookFilters>({
    search: '',
    genre: '',
    sortBy: 'title',
    onlyAvailable: false
  });
  const [page, setPage] = useState(1);
  const wishlist = useWishlist(localBooks);
  const search = useCatalogSearch(filters.search, filters.genre, page);
  const localResults = useMemo(() => filterBooks(localBooks, filters), [filters]);
  const knownBooks = useMemo(
    () => [...new Map([...localBooks, ...search.books, ...wishlist.books]
      .map((book) => [`${book.source}:${book.id}`, book])).values()],
    [search.books, wishlist.books]
  );
  const detailBook = route.bookId
    ? knownBooks.find((book) => book.id === route.bookId) ?? null
    : null;

  const updateFilters = (updates: Partial<BookFilters>) => {
    setFilters((current) => ({ ...current, ...updates }));
    if ('search' in updates || 'genre' in updates) setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: '', genre: '', sortBy: 'title', onlyAvailable: false });
    setPage(1);
  };

  return (
    <>
      <SiteHeader wishlistCount={wishlist.books.length} />
      <main>
        {route.mode === 'details' ? (
          <BookDetailsPage
            book={detailBook}
            isWishlisted={detailBook ? wishlist.ids.includes(detailBook.id) : false}
            onToggleWishlist={wishlist.toggle}
            workKey={route.workKey}
          />
        ) : route.mode === 'wishlist' ? (
          <WishlistSummary
            books={wishlist.books}
            onToggleWishlist={wishlist.toggle}
            wishlistIds={wishlist.ids}
          />
        ) : (
          <CatalogPage
            filters={filters}
            localBooks={localResults}
            onFiltersChange={updateFilters}
            onPageChange={setPage}
            onResetFilters={resetFilters}
            onToggleWishlist={wishlist.toggle}
            page={page}
            search={search}
            wishlistBooks={knownBooks}
            wishlistIds={wishlist.ids}
          />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
