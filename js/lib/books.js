// Чистая функция фильтрации книг
export function filterBooks(books, { search = '', genre = '', onlyAvailable = false } = {}) {
  const query = search.toLowerCase().trim();

  return books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query);
    const matchesGenre = genre === '' || book.genre === genre;
    const matchesAvailable = !onlyAvailable || book.available;

    return matchesSearch && matchesGenre && matchesAvailable;
  });
}

// Чистая функция сортировки 
export function sortBooks(books, sortBy = 'title') {
  const copy = [...books];

  switch (sortBy) {
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'year':
      return copy.sort((a, b) => b.year - a.year); // Сначала новые
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating); // Сначала с высоким рейтингом
    default:
      return copy;
  }
}