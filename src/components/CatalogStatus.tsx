import type { RequestStatus } from '../types';
import { EmptyState } from './EmptyState';
import { ErrorBox } from './ErrorBox';
import { Spinner } from './Spinner';

export interface CatalogStatusProps {
  status: RequestStatus;
  error: string | null;
  onRetry: () => void;
}

export function CatalogStatus({ status, error, onRetry }: CatalogStatusProps) {
  if (status === 'loading') return <Spinner />;
  if (status === 'error') return <ErrorBox message={error ?? 'Не удалось загрузить каталог.'} onRetry={onRetry} />;
  if (status === 'empty') {
    return <EmptyState description="Попробуйте изменить поисковую фразу или фильтры." title="Книги не найдены" />;
  }
  return null;
}
