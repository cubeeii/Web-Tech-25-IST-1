import { initialBooks } from './data/books.js';
import { filterBooks, sortBooks } from './lib/books.js';
import { renderCatalog, renderWishlistCount } from './ui/render.js';

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

// Безопасное чтение списка желаемого из localStorage через try/catch
try {
  const savedWishlist = localStorage.getItem('booknest_wishlist');
  if (savedWishlist) {
    state.wishlist = JSON.parse(savedWishlist);
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

// 3. Обработчики событий фильтрации
const filterForm = document.querySelector('#filter-form');
if (filterForm) {
  // Мгновенная реакция на ввод/изменение в полях формы
  filterForm.addEventListener('input', () => {
    state.filters.search = filterForm.querySelector('#search-query')?.value || '';
    state.filters.genre = filterForm.querySelector('#genre-select')?.value || '';
    state.filters.onlyAvailable = filterForm.querySelector('#only-available')?.checked || false;
    state.filters.sortBy = filterForm.querySelector('#sort-select')?.value || 'title';

    updateUI();
  });

  // Предотвращаем перезагрузку страницы при отправке формы
  filterForm.addEventListener('submit', (e) => e.preventDefault());
}

// Кнопка сброса фильтров
const resetBtn = document.querySelector('#reset-filters-btn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    if (filterForm) filterForm.reset();
    state.filters = {
      search: '',
      genre: '',
      onlyAvailable: false,
      sortBy: 'title'
    };
    updateUI();
  });
}

// 4. Делегирование событий для кликов по карточкам (кнопка «Хочу прочитать»)
const catalogContainer = document.querySelector('.catalog-grid');
if (catalogContainer) {
  catalogContainer.addEventListener('click', (e) => {
    // Ищем ближайшую кнопку желания от места клика
    const btn = e.target.closest('.wishlist-btn');
    if (!btn) return;

    // Находим карточку и получаем её ID
    const card = btn.closest('.book-card');
    if (!card) return;

    const bookId = Number(card.dataset.id);

    // Добавляем или удаляем книгу из списка желаемого
    if (state.wishlist.includes(bookId)) {
      state.wishlist = state.wishlist.filter(id => id !== bookId);
    } else {
      state.wishlist.push(bookId);
    }

    updateUI();
  });
}

// Первичный запуск приложения при загрузке страницы
updateUI();