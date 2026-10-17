# Lab 5 component tree and state ownership

## Component tree

```text
App
├── SiteHeader
├── FiltersPanel
│   ├── SearchField
│   ├── GenreSelect
│   ├── SortSelect
│   ├── AvailabilityFilter
│   └── Button (reset)
├── CatalogStatus
│   ├── Spinner
│   ├── ErrorBox
│   └── EmptyState
├── BookList
│   └── BookCard
│       ├── Badge (availability / rating)
│       └── Button (wishlist)
├── Pagination
│   └── Button (previous / next)
├── WishlistSummary
│   └── Badge (wishlist count)
└── SiteFooter
```

`BookDetailsPage` reuses `Badge`, `Button`, `Spinner`, `EmptyState`, and
`ErrorBox` when the URL identifies a local or Open Library work.

## State ownership

| State | Owner | Reason |
| --- | --- | --- |
| Search text, selected genre, sort order, availability filter | `App` | Shared by `FiltersPanel`, derived catalog results, and API request logic. |
| Catalog source (`local` or `openLibrary`), API results, request status, error, API total | `App` | Drives the catalog, status feedback, and pagination together. |
| Current API page | `App` | Shared by `Pagination` and the API request. Resets when query or genre changes. |
| Wishlist IDs | `App`, initialized from and persisted to `localStorage` | Shared by every `BookCard`, `WishlistSummary`, and details view; updates are immutable. |
| Debounce timer and active `AbortController` | `App` effects/refs | Request lifecycle implementation details, not render state. |
| Selected details record and its loading/error status | `BookDetailsPage` | Used only by the standalone book details route. |
| Temporary hover/focus state | CSS/browser | No application state is required. |

## Derived during render

Filtered and sorted local books, result counts, API page count, whether a
boundary pagination button is disabled, and per-book wishlist/availability
labels are derived from source data and state rather than stored independently.

## Reusable presentation components

- `Button`: filter reset, wishlist toggle, and both pagination controls.
- `Badge`: availability/rating metadata and wishlist count.
- `Spinner`, `EmptyState`, and `ErrorBox`: catalog and details-page states.
- `BookCard` and `BookList`: reusable catalog presentation.
