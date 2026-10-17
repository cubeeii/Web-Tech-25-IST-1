import { Badge } from './Badge';

export interface SiteHeaderProps {
  wishlistCount: number;
}

export function SiteHeader({ wishlistCount }: SiteHeaderProps) {
  return (
    <header>
      <nav aria-label="Основная навигация">
        <ul>
          <li><a href="/">Каталог</a></li>
          <li><a href="/?view=wishlist">Мой список <Badge tone="count">{wishlistCount}</Badge></a></li>
          <li><a href="#filters-heading">Фильтры</a></li>
        </ul>
      </nav>
    </header>
  );
}
