import type { Book, BookFilters, LocalBookRecord, SortOption } from '../types';

export function toLocalBook(record: LocalBookRecord): Book {
  return {
    ...record,
    id: String(record.id),
    cover: record.cover ?? '/covers/placeholder.jpg',
    source: 'local'
  };
}

export function filterBooks(books: Book[], filters: BookFilters): Book[] {
  const query = filters.search.trim().toLocaleLowerCase();
  return books.filter((book) => {
    const matchesSearch = !query ||
      book.title.toLocaleLowerCase().includes(query) ||
      book.author.toLocaleLowerCase().includes(query);
    const matchesGenre = !filters.genre || book.genre === filters.genre;
    const matchesAvailability = !filters.onlyAvailable || book.available === true;
    return matchesSearch && matchesGenre && matchesAvailability;
  });
}

export function sortBooks(books: Book[], sortBy: SortOption): Book[] {
  return [...books].sort((left, right) => {
    if (sortBy === 'title') return left.title.localeCompare(right.title, 'ru');
    if (sortBy === 'year') return (right.year ?? 0) - (left.year ?? 0);
    return (right.rating ?? 0) - (left.rating ?? 0);
  });
}
