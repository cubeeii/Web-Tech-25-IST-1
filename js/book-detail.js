import { initialBooks } from './data/books.js';

// 1. Ловим параметр id из URL (например, /book.html?id=5 -> id = "5")
const params = new URLSearchParams(window.location.search);
const bookId = Number(params.get('id'));

// 2. Ищем книгу в нашем массиве данных
const book = initialBooks.find(b => b.id === bookId);

// 3. Находим элементы на странице book.html
const titleEl = document.querySelector('#book-title');
const breadcrumbEl = document.querySelector('#book-title-breadcrumb');
const authorEl = document.querySelector('#book-author');
const yearEl = document.querySelector('#book-year');
const genreEl = document.querySelector('#book-genre');
const ratingEl = document.querySelector('#book-rating');
const statusEl = document.querySelector('#book-status');
const coverEl = document.querySelector('#book-cover');
const wishlistBtn = document.querySelector('#book-wishlist-btn');

// 4. Если книга нашлась — заполняем страницу, если нет — выводим ошибку
if (book) {
  document.title = `${book.title} — BookNest`;
  if (titleEl) titleEl.textContent = book.title;
  if (breadcrumbEl) breadcrumbEl.textContent = book.title;
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

  // Бонус: синхронизация состояния «Хочу прочитать» с localStorage и на странице книги
  let wishlist = [];
  try {
    const saved = localStorage.getItem('booknest_wishlist');
    if (saved) wishlist = JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }

  let isWishlisted = wishlist.includes(book.id);
  if (wishlistBtn) {
    wishlistBtn.textContent = isWishlisted ? 'В списке желаемого' : 'Хочу прочитать';
    wishlistBtn.setAttribute('aria-pressed', isWishlisted);

    wishlistBtn.addEventListener('click', () => {
      isWishlisted = !isWishlisted;
      if (isWishlisted) {
        if (!wishlist.includes(book.id)) wishlist.push(book.id);
      } else {
        wishlist = wishlist.filter(id => id !== book.id);
      }

      localStorage.setItem('booknest_wishlist', JSON.stringify(wishlist));
      wishlistBtn.textContent = isWishlisted ? 'В списке желаемого' : 'Хочу прочитать';
      wishlistBtn.setAttribute('aria-pressed', isWishlisted);
    });
  }

} else {
  // Обработка ситуации, если книга с таким ID не найдена
  const mainContent = document.querySelector('main');
  if (mainContent) {
    mainContent.innerHTML = '<h1>Книга не найдена</h1><p><a href="index.html">Вернуться в каталог</a></p>';
  }
}