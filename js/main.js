import { initialBooks } from './data/books.js';
import { filterBooks, sortBooks } from './lib/books.js';
import { renderCatalog, renderWishlistCount } from './ui/render.js';
import { searchBooks } from './api/books.js';

const apiSubjects = {
  'Программирование': 'programming',
  'Фантастика': 'science fiction',
  'Классика': 'classics',
  'Фэнтези': 'fantasy',
  'Сказка': 'fairy tales'
};
const booksPerPage = 20;

// 1. Инициализация глобального состояния приложения
let state = {
  books: initialBooks,
  filters: {
    search: '',
    genre: '',
    onlyAvailable: false,
    sortBy: 'title'
  },
  wishlist: []
};

let searchController = null;
let searchTimer = null;
let latestSearchId = 0;
let apiPage = 1;
let apiTotalPages = 0;
let apiLoading = false;

// Безопасное чтение списка желаемого из localStorage через try/catch
try {
  const savedWishlist = localStorage.getItem('booknest_wishlist');
  if (savedWishlist) {
    const parsedWishlist = JSON.parse(savedWishlist);
    if (Array.isArray(parsedWishlist)) {
      state.wishlist = [...new Set(parsedWishlist.map(String))];
    }
  }
} catch (e) {
  console.error('Ошибка чтения localStorage:', e);
  state.wishlist = [];
}

// 2. Единая функция перерисовки интерфейса (интерфейс — чистая функция состояния)
function updateUI() {
  // Применяем чистые функции фильтрации и сортировки
  let result = filterBooks(state.books, state.filters);
  result = sortBooks(result, state.filters.sortBy);

  // Рендерим каталог и счётчик избранного
  renderCatalog(result, state.wishlist);
  renderWishlistCount(state.wishlist.length);

  // Безопасное сохранение состояния в localStorage
  try {
    localStorage.setItem('booknest_wishlist', JSON.stringify(state.wishlist));
  } catch (e) {
    console.error('Ошибка записи в localStorage:', e);
  }
}

function setCatalogMessage(message) {
  const messageContainer = document.querySelector('#catalog-message');
  if (messageContainer) {
    messageContainer.textContent = message;
  }
}

function updatePagination() {
  const pagination = document.querySelector('#catalog-pagination');
  const previousButton = document.querySelector('#previous-page-btn');
  const nextButton = document.querySelector('#next-page-btn');
  const pageIndicator = document.querySelector('#page-indicator');
  const isApiSearch = Boolean(state.filters.search.trim());

  if (!pagination || !previousButton || !nextButton || !pageIndicator) return;

  pagination.hidden = !isApiSearch;
  previousButton.disabled = !isApiSearch || apiPage <= 1 || apiLoading;
  nextButton.disabled = !isApiSearch || apiPage >= apiTotalPages || apiLoading;
  pageIndicator.textContent = apiTotalPages > 0 ? `Страница ${apiPage} из ${apiTotalPages}` : '';
}

function saveWishlist() {
  try {
    localStorage.setItem('booknest_wishlist', JSON.stringify(state.wishlist));
  } catch (e) {
    console.error('Ошибка записи в localStorage:', e);
  }
}

function mapApiBook(doc, index, selectedGenre) {
  const title = doc.title || 'Без названия';
  const author = Array.isArray(doc.author_name) && doc.author_name.length
    ? doc.author_name.join(', ')
    : 'Автор не указан';
  const key = typeof doc.key === 'string' ? doc.key : '';
  const id = key || `${title}-${author}-${doc.first_publish_year || index}`;
  const externalUrl = key.startsWith('/works/')
    ? new URL(key, 'https://openlibrary.org').href
    : 'https://openlibrary.org';

  return {
    id,
    title,
    author,
    year: doc.first_publish_year || null,
    genre: selectedGenre || doc.subject?.[0] || '',
    rating: Number.isFinite(doc.ratings_average) ? doc.ratings_average : null,
    available: null,
    cover: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : 'covers/placeholder.jpg',
    externalUrl
  };
}

async function runApiSearch(query) {
  const searchId = ++latestSearchId;
  searchController?.abort();
  searchController = new AbortController();
  const signal = searchController.signal;
  const selectedGenre = state.filters.genre;

  apiLoading = true;
  updatePagination();
  setCatalogMessage('Ищем книги в Open Library…');
  renderCatalog([], state.wishlist, null, 'Выполняется поиск…');

  try {
    const { docs, numFound } = await searchBooks(
      query,
      apiPage,
      booksPerPage,
      signal,
      apiSubjects[selectedGenre] || ''
    );

    if (signal.aborted || searchId !== latestSearchId) return;

    const books = docs.map((doc, index) => mapApiBook(doc, index, selectedGenre));
    const sortedBooks = sortBooks(books, state.filters.sortBy);
    apiTotalPages = Math.ceil(numFound / booksPerPage);
    apiLoading = false;
    renderCatalog(sortedBooks, state.wishlist, numFound);
    renderWishlistCount(state.wishlist.length);
    updatePagination();
    setCatalogMessage('Результаты из Open Library. Наличие в BookNest не проверяется; фильтр доступности отключён.');
  } catch (error) {
    if (error.name === 'AbortError' || searchId !== latestSearchId) return;

    renderCatalog([], state.wishlist, 0, 'Не удалось получить результаты поиска.');
    apiTotalPages = 0;
    apiLoading = false;
    updatePagination();
    setCatalogMessage(`Не удалось выполнить поиск: ${error.message}`);
  }
}

function updateCatalogForCurrentFilters() {
  latestSearchId++;
  clearTimeout(searchTimer);
  searchController?.abort();

  const query = state.filters.search.trim();
  const availableFilter = document.querySelector('#only-available');

  if (query) {
    if (availableFilter) {
      availableFilter.disabled = true;
      availableFilter.title = 'Open Library не предоставляет сведения о наличии книг в BookNest.';
    }
    state.filters.onlyAvailable = false;
    apiLoading = true;
    updatePagination();
    renderCatalog([], state.wishlist, null, 'Выполняется поиск…');
    setCatalogMessage('');
    searchTimer = setTimeout(() => runApiSearch(query), 300);
    return;
  }

  if (availableFilter) {
    availableFilter.disabled = false;
    availableFilter.removeAttribute('title');
  }

  apiPage = 1;
  apiTotalPages = 0;
  apiLoading = false;
  updatePagination();
  setCatalogMessage('');
  updateUI();
}

// 3. Обработчики событий фильтрации
const filterForm = document.querySelector('#filter-form');
if (filterForm) {
  const updateFiltersFromForm = () => {
    const previousQuery = state.filters.search.trim();
    const previousGenre = state.filters.genre;
    state.filters.search = filterForm.querySelector('#search-query')?.value || '';
    state.filters.genre = filterForm.querySelector('#genre-select')?.value || '';
    state.filters.onlyAvailable = filterForm.querySelector('#only-available')?.checked || false;
    state.filters.sortBy = filterForm.querySelector('#sort-select')?.value || 'title';

    if (previousQuery !== state.filters.search.trim() || previousGenre !== state.filters.genre) {
      apiPage = 1;
      apiTotalPages = 0;
    }
    updateCatalogForCurrentFilters();
  };

  filterForm.addEventListener('input', updateFiltersFromForm);

  filterForm.addEventListener('submit', (e) => e.preventDefault());
}

// Кнопка сброса фильтров
const resetBtn = document.querySelector('#reset-filters-btn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    if (filterForm) filterForm.reset();
    searchController?.abort();
    clearTimeout(searchTimer);
    latestSearchId++;
    state.filters = {
      search: '',
      genre: '',
      onlyAvailable: false,
      sortBy: 'title'
    };
    apiPage = 1;
    apiTotalPages = 0;
    updateCatalogForCurrentFilters();
  });
}

const previousPageButton = document.querySelector('#previous-page-btn');
if (previousPageButton) {
  previousPageButton.addEventListener('click', () => {
    if (apiPage <= 1 || !state.filters.search.trim()) return;
    apiPage--;
    clearTimeout(searchTimer);
    runApiSearch(state.filters.search.trim());
  });
}

const nextPageButton = document.querySelector('#next-page-btn');
if (nextPageButton) {
  nextPageButton.addEventListener('click', () => {
    if (apiPage >= apiTotalPages || !state.filters.search.trim()) return;
    apiPage++;
    clearTimeout(searchTimer);
    runApiSearch(state.filters.search.trim());
  });
}

// 4. Делегирование событий для кликов по карточкам (кнопка «Хочу прочитать»)
const catalogContainer = document.querySelector('.catalog-grid');
if (catalogContainer) {
  catalogContainer.addEventListener('click', (e) => {
    // 1. Проверяем, был ли клик по кнопке «Хочу прочитать»
    const btn = e.target.closest('.wishlist-btn');
    if (btn) {
      e.stopPropagation(); // Останавливаем переход на страницу книги

      const card = btn.closest('.book-card');
      if (!card) return;
      const bookId = card.dataset.id;

      if (state.wishlist.includes(bookId)) {
        state.wishlist = state.wishlist.filter(id => id !== bookId);
      } else {
        state.wishlist.push(bookId);
      }

      saveWishlist();
      renderWishlistCount(state.wishlist.length);
      btn.textContent = state.wishlist.includes(bookId) ? 'В списке желаемого' : 'Хочу прочитать';
      btn.setAttribute('aria-pressed', state.wishlist.includes(bookId));
      if (!state.filters.search.trim()) updateUI();
      return;
    }

    if (e.target.closest('a')) return;

    // 2. Если кликнули не на кнопку, а в любую другую часть карточки — открываем страницу книги
    const card = e.target.closest('.book-card');
    if (card) {
      window.location.href = card.dataset.href || `book.html?id=${card.dataset.id}`;
    }
  });
}

// Первичный запуск приложения при загрузке страницы
updateUI();