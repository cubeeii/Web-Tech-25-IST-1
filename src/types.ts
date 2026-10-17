export type Genre =
  | 'Программирование'
  | 'Фантастика'
  | 'Классика'
  | 'Фэнтези'
  | 'Сказка';

export type SortOption = 'title' | 'year' | 'rating';
export type RequestStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';
export type BookSource = 'local' | 'openLibrary';

export interface Book {
  id: string;
  title: string;
  author: string;
  year: number | null;
  genre: string;
  rating: number | null;
  available: boolean | null;
  cover: string;
  source: BookSource;
  workKey?: string;
  externalUrl?: string;
}

export interface LocalBookRecord {
  id: number;
  title: string;
  author: string;
  year: number;
  genre: Genre;
  rating: number;
  available: boolean;
  cover?: string;
}

export interface BookFilters {
  search: string;
  genre: Genre | '';
  sortBy: SortOption;
  onlyAvailable: boolean;
}

export interface OpenLibrarySearchResponse {
  docs?: OpenLibrarySearchDoc[];
  numFound?: number;
  num_found?: number;
}

export interface OpenLibrarySearchDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  subject?: string[];
  cover_i?: number;
  ratings_average?: number;
}

export interface OpenLibraryWork {
  title?: string;
  first_publish_date?: string;
  subjects?: string[];
  covers?: number[];
  description?: string | { value?: string };
  authors?: Array<{ author?: { key?: string } }>;
}

export interface OpenLibraryEditionsResponse {
  size?: number;
  numFound?: number;
}

export interface SearchResult {
  docs: OpenLibrarySearchDoc[];
  numFound: number;
}

export interface ApiErrorDetails {
  message: string;
  status: number;
}
