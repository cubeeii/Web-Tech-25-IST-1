import { useEffect, useMemo, useState } from 'react';
import type { Book } from '../types';

function isBook(value: unknown): value is Book {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Book>;
  return typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.author === 'string' &&
    (candidate.source === 'local' || candidate.source === 'openLibrary');
}

function readWishlist(localBooks: Book[]): Book[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem('booknest_wishlist') ?? '[]');
    if (!Array.isArray(saved)) throw new TypeError('Список желаемого должен быть массивом.');
    if (saved.every((item): item is string | number => typeof item === 'string' || typeof item === 'number')) {
      return saved
        .map(String)
        .map((id) => localBooks.find((book) => book.id === id))
        .filter((book): book is Book => book !== undefined);
    }
    return saved.filter(isBook);
  } catch (error) {
    console.error('Не удалось прочитать список желаемого:', error);
    return [];
  }
}

export interface WishlistState {
  books: Book[];
  ids: string[];
  toggle: (book: Book) => void;
}

export function useWishlist(localBooks: Book[]): WishlistState {
  const [books, setBooks] = useState(() => readWishlist(localBooks));
  const ids = useMemo(() => books.map((book) => book.id), [books]);

  useEffect(() => {
    try {
      localStorage.setItem('booknest_wishlist', JSON.stringify(books));
    } catch (error) {
      console.error('Не удалось сохранить список желаемого:', error);
    }
  }, [books]);

  const toggle = (book: Book) => {
    setBooks((current) => current.some((item) => item.id === book.id)
      ? current.filter((item) => item.id !== book.id)
      : [...current, book]);
  };

  return { books, ids, toggle };
}
