# Lab 5 component tree and state ownership

## Component tree

```text
App
├── SiteHeader
├── CatalogPage (catalog route)
│   ├── FiltersPanel
│   │   └── Button (reset)
│   ├── CatalogStatus
│   │   ├── Spinner
│   │   └── ErrorBox
│   ├── EmptyState
│   ├── BookList
│   │   └── BookCard
│   │       ├── Badge (availability / rating)
│   │       └── Button (wishlist)
│   ├── Pagination
│   │   └── Button (previous / next)
│   └── WishlistSummary
│       ├── Badge (wishlist count)
│       ├── EmptyState
│       └── BookList
├── WishlistSummary (wishlist route)
├── BookDetailsPage (details route)
│   ├── Spinner
│   ├── ErrorBox
│   ├── EmptyState
│   ├── Badge
│   └── Button
└── SiteFooter
```

`BookDetailsPage` and `WishlistSummary` are rendered in mutually exclusive
routes. `WishlistSummary` is also shown below the catalog.

## State ownership

| State | Owner | Reason |
| --- | --- | --- |
| Search text, selected genre, sort order, availability filter | `App` | Shared by `FiltersPanel`, derived catalog results, and API request logic. |
| Catalog source (`local` or `openLibrary`) | `CatalogPage`, derived from the search text | Selects the local filtered results or API results without duplicating state. |
| API results, request status, error, API total | `useCatalogSearch` | Owns API request state and exposes it to `CatalogPage`. |
| Current API page | `App` | Shared by `Pagination` and `useCatalogSearch`; resets when query or genre changes. |
| Wishlist books and derived IDs | `useWishlist` | Shared by every `BookCard`, `WishlistSummary`, and details view; updates are immutable. |
| Wishlist persistence | `useWishlist` | Initializes from and persists to `localStorage`. |
| Debounce timer and active `AbortController` | `useCatalogSearch` effect | Request lifecycle implementation details, not render state. |
| Selected details record and its loading/error status | `BookDetailsPage` | Used only by the standalone book details route. |
| Temporary hover/focus state | CSS/browser | No application state is required. |

## Derived during render

Filtered and sorted local books, result counts, API page count, whether a
boundary pagination button is disabled, and per-book wishlist/availability
labels are derived from source data and state rather than stored independently.

## Reusable presentation components

- `Button`: filter reset, wishlist toggle, both pagination controls, and details actions.
- `Badge`: availability/rating metadata and wishlist count.
- `Spinner`, `EmptyState`, and `ErrorBox`: catalog and details-page states.
- `BookCard` and `BookList`: reusable catalog presentation.
