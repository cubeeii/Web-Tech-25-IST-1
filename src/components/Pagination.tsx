import { Button } from './Button';

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Страницы результатов" className="pagination">
      <Button disabled={page <= 1} onClick={() => onPageChange(page - 1)} type="button">
        Назад
      </Button>
      <span aria-live="polite">Страница {page} из {pageCount}</span>
      <Button disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} type="button">
        Вперёд
      </Button>
    </nav>
  );
}
