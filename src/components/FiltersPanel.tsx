import type { ChangeEvent, FormEvent } from 'react';
import type { BookFilters, Genre, SortOption } from '../types';
import { Button } from './Button';

export interface FiltersPanelProps {
  filters: BookFilters;
  apiSearchActive: boolean;
  onSearchChange: (value: string) => void;
  onGenreChange: (value: Genre | '') => void;
  onSortChange: (value: SortOption) => void;
  onAvailabilityChange: (value: boolean) => void;
  onReset: () => void;
}

const genres: Genre[] = ['Программирование', 'Фантастика', 'Классика', 'Фэнтези', 'Сказка'];

export function FiltersPanel(props: FiltersPanelProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => event.preventDefault();
  const handleGenreChange = (event: ChangeEvent<HTMLSelectElement>) => {
    props.onGenreChange(event.currentTarget.value as Genre | '');
  };
  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    props.onSortChange(event.currentTarget.value as SortOption);
  };

  return (
    <section aria-labelledby="filters-heading">
      <h2 id="filters-heading">Фильтры и поиск</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="search-query">Поиск:</label>
          <input
            autoComplete="off"
            id="search-query"
            onChange={(event) => props.onSearchChange(event.currentTarget.value)}
            placeholder="Название или автор..."
            type="search"
            value={props.filters.search}
          />
        </div>
        <div>
          <label htmlFor="genre-select">Жанр:</label>
          <select id="genre-select" onChange={handleGenreChange} value={props.filters.genre}>
            <option value="">Все жанры</option>
            {genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sort-select">Сортировка:</label>
          <select id="sort-select" onChange={handleSortChange} value={props.filters.sortBy}>
            <option value="title">По названию (А-Я)</option>
            <option value="year">Сначала новые</option>
            <option value="rating">По рейтингу</option>
          </select>
        </div>
        <div>
          <input
            checked={props.filters.onlyAvailable}
            disabled={props.apiSearchActive}
            id="only-available"
            onChange={(event) => props.onAvailabilityChange(event.currentTarget.checked)}
            type="checkbox"
          />
          <label htmlFor="only-available">Только доступные (каталог BookNest)</label>
        </div>
        {props.apiSearchActive && <p role="note">Open Library не показывает наличие в BookNest.</p>}
        <Button onClick={props.onReset} type="button" variant="secondary">Сбросить</Button>
      </form>
    </section>
  );
}
