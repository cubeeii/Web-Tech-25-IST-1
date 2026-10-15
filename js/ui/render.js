// Функция рендеринга каталога книг
export function renderCatalog(books, wishlistIds = []) {
  const container = document.querySelector('.catalog-grid');
  const countContainer = document.querySelector('#books-count');
  const emptyState = document.querySelector('#empty-state');

  if (!container) return;

  // Обновляем счётчик найденных записей
  if (countContainer) {
    countContainer.textContent = `Найдено книг: ${books.length}`;
  }

  // Пустое состояние (если фильтры ничего не нашли)
  if (books.length === 0) {
    container.innerHTML = '';
    if (emptyState) {
      emptyState.style.display = 'block';
    } else {
      // Если элемент заглушки не был создан в HTML, создадим его программно
      const emptyMsg = document.createElement('p');
      emptyMsg.id = 'empty-state';
      emptyMsg.textContent = 'Книги по вашему запросу не найдены. Попробуйте изменить параметры фильтрации.';
      container.appendChild(emptyMsg);
    }
    return;
  }

  if (emptyState) {
    emptyState.style.display = 'none';
  }

  // Очищаем контейнер перед новой отрисовкой
  container.innerHTML = '';

  // Рендерим каждую карточку через безопасные DOM-ноды
  books.forEach(book => {
    const isWishlisted = wishlistIds.includes(book.id);

    const article = document.createElement('article');
    article.className = 'book-card';
    article.dataset.id = book.id;

    const title = document.createElement('h3');
    title.textContent = book.title;

    const author = document.createElement('p');
    author.textContent = `Автор: ${book.author} (${book.year})`;

    const info = document.createElement('p');
    info.textContent = `Жанр: ${book.genre} | Рейтинг: ⭐ ${book.rating}`;

    const status = document.createElement('p');
    status.textContent = book.available ? 'В наличии' : 'Выдана';
    status.style.color = book.available ? 'var(--color-success, green)' : 'var(--color-text-muted, gray)';

    // Кнопка «Хочу прочитать» с состоянием aria-pressed
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wishlist-btn';
    btn.textContent = isWishlisted ? 'В списке желаемого' : 'Хочу прочитать';
    btn.setAttribute('aria-pressed', isWishlisted);

    article.append(title, author, info, status, btn);
    container.appendChild(article);
  });
}

// Отрисовка счётчика для «Моего списка» в шапке
export function renderWishlistCount(count) {
  const badge = document.querySelector('#wishlist-count');
  if (badge) {
    badge.textContent = count;
  }
}