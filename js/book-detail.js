import { getBookDetailsWithEditions } from './api/books.js';
import { initialBooks } from './data/books.js';

const params = new URLSearchParams(window.location.search);
const workKey = params.get('work');
const bookId = Number(params.get('id'));
const localBook = initialBooks.find(book => book.id === bookId);

const titleEl = document.querySelector('#book-title');
const breadcrumbEl = document.querySelector('#book-title-breadcrumb');
const authorEl = document.querySelector('#book-author');
const yearEl = document.querySelector('#book-year');
const genreEl = document.querySelector('#book-genre');
const ratingEl = document.querySelector('#book-rating');
const statusEl = document.querySelector('#book-status');
const coverEl = document.querySelector('#book-cover');
const wishlistBtn = document.querySelector('#book-wishlist-btn');
const loadStatusEl = document.querySelector('#book-load-status');
const editionCountRow = document.querySelector('#edition-count-row');
const editionCountEl = document.querySelector('#book-edition-count');
const sourceRow = document.querySelector('#book-source-row');
const sourceLink = document.querySelector('#book-source-link');

function setBookTitle(title) {
  document.title = `${title} — BookNest`;
  if (titleEl) titleEl.textContent = title;
  if (breadcrumbEl) breadcrumbEl.textContent = title;
}

function setupWishlist(bookKey) {
  if (!wishlistBtn) return;

  let wishlist = [];
  try {
    const saved = localStorage.getItem('booknest_wishlist');
    if (saved) {
      const parsedWishlist = JSON.parse(saved);
      if (!Array.isArray(parsedWishlist)) {
        throw new TypeError('Сохраненный список желаемого должен быть массивом.');
      }
      wishlist = [...new Set(parsedWishlist.map(String))];
    }
  } catch (error) {
    console.error('Ошибка чтения списка желаемого:', error);
  }

  const renderButton = () => {
    const isWishlisted = wishlist.includes(String(bookKey));
    wishlistBtn.textContent = isWishlisted ? 'В списке желаемого' : 'Хочу прочитать';
    wishlistBtn.setAttribute('aria-pressed', isWishlisted);
  };

  renderButton();
  wishlistBtn.addEventListener('click', () => {
    if (wishlist.includes(String(bookKey))) {
      wishlist = wishlist.filter(id => id !== String(bookKey));
    } else {
      wishlist.push(String(bookKey));
    }

    try {
      localStorage.setItem('booknest_wishlist', JSON.stringify(wishlist));
    } catch (error) {
      console.error('Ошибка записи в localStorage:', error);
    }
    renderButton();
  });
}

function renderLocalBook(book) {
  setBookTitle(book.title);
  if (authorEl) authorEl.textContent = book.author;
  if (yearEl) yearEl.textContent = book.year;
  if (genreEl) genreEl.textContent = book.genre;
  if (ratingEl) ratingEl.textContent = book.rating;

  if (statusEl) {
    statusEl.textContent = book.available ? 'В наличии' : 'Выдана';
    statusEl.style.color = book.available ? 'green' : 'gray';
  }

  if (coverEl) {
    coverEl.src = book.cover || 'covers/placeholder.jpg';
    coverEl.alt = `Обложка книги «${book.title}»`;
  }

  setupWishlist(book.id);
}

async function renderOpenLibraryBook(key) {
  const controller = new AbortController();
  window.addEventListener('pagehide', () => controller.abort(), { once: true });

  if (loadStatusEl) loadStatusEl.textContent = 'Загружаем сведения о книге…';

  try {
    const { work, editionCount } = await getBookDetailsWithEditions(key, controller.signal);
    const title = work.title || 'Без названия';
    setBookTitle(title);
    if (authorEl) authorEl.textContent = 'Сведения об авторе доступны на Open Library';
    if (yearEl) yearEl.textContent = work.first_publish_date || 'Не указан';
    if (genreEl) {
      genreEl.textContent = Array.isArray(work.subjects) && work.subjects.length
        ? work.subjects.slice(0, 3).join(', ')
        : 'Не указан';
    }
    if (ratingEl) ratingEl.textContent = 'Не указан';
    if (statusEl) statusEl.textContent = 'Нет данных в каталоге BookNest';
    if (coverEl) {
      const coverId = Array.isArray(work.covers)
        ? work.covers.find(id => Number.isInteger(id) && id > 0)
        : null;
      coverEl.src = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : 'covers/placeholder.jpg';
      coverEl.alt = `Обложка книги «${title}»`;
    }
    if (editionCountRow) editionCountRow.hidden = false;
    if (editionCountEl) editionCountEl.textContent = editionCount;
    if (sourceRow) sourceRow.hidden = false;
    if (sourceLink) sourceLink.href = new URL(key, 'https://openlibrary.org').href;
    setupWishlist(key);
  } catch (error) {
    if (error.name === 'AbortError') return;
    if (loadStatusEl) loadStatusEl.textContent = `Не удалось загрузить книгу: ${error.message}`;
  } finally {
    if (!controller.signal.aborted && loadStatusEl?.textContent === 'Загружаем сведения о книге…') {
      loadStatusEl.textContent = '';
    }
  }
}

if (workKey) {
  void renderOpenLibraryBook(workKey);
} else if (localBook) {
  renderLocalBook(localBook);
} else {
  const mainContent = document.querySelector('main');
  if (mainContent) {
    mainContent.innerHTML = '<h1>Книга не найдена</h1><p><a href="index.html">Вернуться в каталог</a></p>';
  }
}
