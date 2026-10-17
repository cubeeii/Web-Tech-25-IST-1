// Функция рендеринга каталога книг
export function renderCatalog(
  books,
  wishlistIds = [],
  totalCount = books.length,
  emptyMessage = 'Книги по вашему запросу не найдены. Попробуйте изменить параметры фильтрации.'
) {
  const container = document.querySelector('.catalog-grid');
  const countContainer = document.querySelector('#books-count');

  if (!container) return;

  if (countContainer) {
    countContainer.textContent = totalCount === null
      ? 'Поиск…'
      : totalCount > books.length
        ? `Показано книг: ${books.length} из ${totalCount}`
        : `Найдено книг: ${books.length}`;
  }

  container.innerHTML = '';

  if (books.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = emptyMessage;
    container.appendChild(emptyState);
    return;
  }

  books.forEach(book => {
    const isWishlisted = wishlistIds.includes(String(book.id));

    const article = document.createElement('article');
    article.className = 'book-card';
    article.dataset.id = book.id;
    if (book.externalUrl) {
      article.dataset.href = book.externalUrl;
    }
    article.style.cursor = 'pointer';

    const title = document.createElement('h3');
    title.textContent = book.title;

    const author = document.createElement('p');
    author.textContent = book.year
      ? `Автор: ${book.author} (${book.year})`
      : `Автор: ${book.author}`;

    const info = document.createElement('p');
    const genre = book.genre || 'Не указан';
    const rating = Number.isFinite(book.rating) ? `⭐ ${book.rating}` : 'не указан';
    info.textContent = `Жанр: ${genre} | Рейтинг: ${rating}`;

    const status = document.createElement('p');
    if (typeof book.available === 'boolean') {
      status.textContent = book.available ? 'В наличии' : 'Выдана';
      status.style.color = book.available ? 'green' : 'gray';
    } else {
      status.textContent = 'Доступность в библиотеке не указана';
    }

    const link = document.createElement('a');
    link.href = book.externalUrl || `book.html?id=${book.id}`;
    if (book.externalUrl) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    link.textContent = book.externalUrl
      ? 'Подробнее на Open Library (новая вкладка)'
      : 'Подробнее о книге';
    link.style.display = 'inline-block';
    link.style.marginRight = '10px';

    // Кнопка «Хочу прочитать» с состоянием aria-pressed
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wishlist-btn';
    btn.textContent = isWishlisted ? 'В списке желаемого' : 'Хочу прочитать';
    btn.setAttribute('aria-pressed', isWishlisted);

    // Блок картинки / обложки с заглушкой
    const figure = document.createElement('figure');
    const img = document.createElement('img');

    // Если у книги есть путь к обложке — берем его, иначе ставим стандартную заглушку
    img.src = book.cover || 'covers/placeholder.jpg';
    img.alt = `Обложка книги «${book.title}»`;
    img.width = 150;
    img.height = 220;
    img.addEventListener('error', () => {
      img.src = 'covers/placeholder.jpg';
    }, { once: true });

    figure.appendChild(img);

    article.append(figure, title, author, info, status, link, btn);
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
