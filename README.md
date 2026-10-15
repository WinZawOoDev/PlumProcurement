# PlumProcurement

A React Native app for plum procurement: manage market prices in a grouped, tappable price list, record multi-line purchases against those prices, and track seller payments with live balances. Data is stored locally on-device with SQLite.

## Features

- **Prices** — create and edit (bottom sheet) price entries per category (fruit/seed) and unit (cup/gallon/bushels); list grouped by category with sticky headers and per-group counts; tap a row for a detail sheet with edit/delete actions; search by category or unit; sort by newest or price; sparkline trend of the last 12 prices
- **Purchasing** — record purchases with multiple line items per transaction; each line is a price item with its own quantity stepper; live grand-total preview; full purchase history with count and grand total; per-line edit (CSV export is currently disabled in purchase history)
- **Sellers** — add, edit and delete sellers with name, phone number and address (all mandatory); per-seller purchase stats aggregated in SQL; compact icon-led stat line per row (receipt = count · total, wallet = outstanding balance)
- **Payments** — record payments against each seller's sold total; per-seller Owed/Paid/Balance summary; payment history with delete; overpayment guard (cannot pay more than the balance)
- **Settings** — theme preference (system/light/dark) and language (English/Myanmar), persisted on-device
- **Notifications** — native toast on Android, in-app toast (react-native-toast-message) on iOS
- **Loading states** — layout-accurate skeletons for price and seller screens
- Referential safety: prices and sellers referenced by recorded purchases cannot be deleted (guarded inside transactions); payments are linked to purchase headers (oldest-first), and a purchase with a linked payment is locked against edit/delete, while edits/deletes that would leave the seller overpaid are blocked

## Tech Stack

- React Native 0.84 + React 19 + TypeScript
- [@react-navigation](https://reactnavigation.org/) v7 (bottom tabs + native stacks)
- [react-native-nitro-sqlite](https://github.com/NitroModules/nitro-sqlite) for local storage (singleton cached handle)
- Money stored as integer minor units (see `database/money.ts`) so sums and balances are exact
- [react-hook-form](https://react-hook-form.com/) for form state and validation
- [RNEUI](https://rneui.dev/) themed components + Ionicons/FontAwesome icons
- [react-native-toast-message](https://github.com/calintamas/react-native-toast-message) for iOS notifications (Android uses native toasts)
- [i18next](https://www.i18next.com/) + react-i18next for English/Myanmar localization
- Jest + react-test-renderer + @testing-library/react-native for unit tests (incl. real-SQLite integration via `node:sqlite`); Maestro flows for E2E

## Project Structure

```
├── App.tsx                     # Root: theme/language providers, tab navigator, onboarding gate, startup error state
├── database/                   # SQLite layer (amounts are integer minor units)
│   ├── connection.ts           # Singleton cached handle, DatabaseError
│   ├── schema.ts               # One-time bootstrap: all CREATE TABLE IF NOT EXISTS
│   ├── migrations.ts           # Versioned migrations (PRAGMA user_version) + LATEST_VERSION
│   ├── money.ts                # toMinor/fromMinor helpers (service boundary stays in major units)
│   ├── sql.ts                  # Shared SQL: LIKE escaping, owed/paid math, balance projection
│   ├── prices.ts               # Transaction-guarded delete (referential check)
│   ├── purchases.ts            # Paginated fetch (header + line items), edit/delete, SQL seller stats
│   ├── payments.ts             # Payment CRUD, per-seller owed/paid/balance, overpayment guard, FIFO reallocation
│   ├── sellers.ts              # Transaction-guarded delete (referential check), single-seller stats
│   └── settings.ts
├── types/database.ts           # IPrice/IPurchase/IPurchaseItem/IPayment/ISeller/ISellerStat/ISellerPaymentStat shared interfaces
├── constants/                  # Single source of truth (per-domain files + index.ts)
├── services/                   # Data-access layer wrapping database/ (UI imports services, never database/)
│   ├── errors.ts               # Re-exports DatabaseError for UI code
│   ├── priceService.ts
│   ├── purchaseService.ts      # recent/page/count fetches + edit/remove + seller stats
│   ├── paymentService.ts       # record/edit/remove payments + summaries
│   ├── sellerService.ts        # incl. getSellerStatById/getSellerBalanceById (single-seller aggregates)
│   └── settingsService.ts      # onboarded flag + theme/language preference
├── context/
│   ├── PriceContext.tsx        # Shared price list state (refresh/add/edit/remove + error/retry)
│   ├── ThemeModeContext.tsx    # Theme preference (system/light/dark)
│   └── LanguageContext.tsx     # Language preference (en/my)
├── hooks/
│   ├── useAsync.ts             # useAsync/useLoading (centralized loading/error)
│   ├── useConfirmDelete.ts     # Shared confirm-dialog → delete → toast → refresh flow
│   ├── useLocalizedConstants.ts # Memoized translated constants (shape of the English source)
│   └── useSearchFilter.ts      # Shared search visibility/query/filtered-list state
├── components/
│   ├── buttons/Button.tsx      # PrimaryButton, SecondaryButton, IconButton (a11y + stable testIDs)
│   ├── forms/FormFields.tsx    # FormSelectField, FormInputField, FormCheckboxField,
│   │                           #   FormButtonGroupField (react-hook-form integrated)
│   ├── SearchBar.tsx           # Debounced search (300ms)
│   ├── SearchIconButton.tsx    # Shared search-toggle icon button
│   ├── DetailSheet.tsx         # Shared BottomSheet scaffolding
│   ├── LoadError.tsx           # Shared list error state with retry
│   ├── QuantityCounter.tsx     # + / − stepper with a11y (supports disabled)
│   ├── PriceTrend.tsx          # Sparkline for last 12 prices
│   ├── PriceDetailSheet.tsx    # Price detail (uses DetailSheet)
│   ├── StartupLoader.tsx       # Splash/overlay while bootstrapping
│   ├── ErrorBoundary.tsx       # Top-level crash fallback
│   └── ErrorFallback.tsx       # Full-screen error with retry (also used at startup)
├── screens/
│   ├── pricing/                # Price list + PriceTrend, create, shared PriceForm, edit sheet, cards
│   ├── purchasing/             # Record purchase (multi-line), paginated history (LIKE search), edit sheet
│   ├── seller/                 # Seller list + SQL-aggregated stats + balances, form sheet, detail + payments
│   └── settings/               # Theme + language preference
├── utils/
│   ├── index.ts                # Formatting (Myanmar digits) + CSV builders (BOM, filename)
│   ├── errors.ts               # getErrorMessage: safe user-facing message from any error
│   ├── notifications.ts        # Cross-platform showSuccess/showError (+ Undo toast)
│   ├── haptics.ts              # Shared light haptic feedback
│   └── csvExport.ts            # shareOrSaveCsv (Share sheet; currently unused — export UI is disabled)
├── testHelpers/
│   ├── inMemorySqlite.ts       # Hand-rolled fake (fast unit tests; no FKs, no rollback)
│   └── sqliteAdapter.ts        # Real SQLite via node:sqlite (migration/FIFO/rollback tests)
├── styles/                     # Per-domain theme-aware style factories composed into useStyles()
├── theme.ts                    # RNEUI theme factory
├── e2e/                        # Detox shell (app.test.js; Detox is not installed — use Maestro)
└── .maestro/                   # Maestro flows (pricing, sellers, purchasing, guards, full-flow)
```

## Architecture Conventions

- **Never import `database/*` from components** — go through a service in `services/`. Schema bootstrap and migrations live in `database/schema.ts` + `database/migrations.ts` (run once, memoized); services own validation and error wrapping (`DatabaseError`).
- **Schema changes**: never edit an applied migration — append a new entry to `MIGRATIONS` in `database/migrations.ts` and bump the version.
- **Shared cross-screen state** lives in Context (`PriceContext`) so mutations propagate automatically; screen-local state is fine for self-contained flows.
- **All literals belong in `constants/index.ts`** — routes, messages, UI text, dimensions, typography, validation messages.
- **Forms** use react-hook-form `Controller`s via the generic fields in `components/forms/`; pass validation through the `rules` prop.
- **Styles** live in `styles/` (`useStyles()`); no inline style objects.

## Getting Started

```sh
npm install
```

Start Metro:

```sh
npm start
```

Build and run on a device/emulator:

```sh
# Android
npm run android

# iOS (first build needs CocoaPods)
bundle install
bundle exec pod install
npm run ios
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Metro dev server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run lint` | ESLint (e2e ignored) |
| `npm test` | Jest unit tests (260 tests, 47 suites) |
| `npm run e2e:ios` | Detox iOS (ios.sim.debug; Detox is not installed — Maestro is the working E2E path) |
| `npm run e2e:android` | Detox Android (android.emu.debug; Detox is not installed — Maestro is the working E2E path) |
| `npm run maestro:test` | Maestro flows (`.maestro/`) |

## Testing

Unit tests cover utilities (incl. all CSV builders/BOM/filename, debounce), every service (incl. paginated fetch + `hasMore`, purchase edit/delete, seller stats), the schema/migration runner (bootstrap memoization, legacy `seller_id` migration, `sellers.address` migration, retry on failure, link-source + minor-units + index-cleanup migrations), `useAsync`/`useLoading`, notification helpers, price context flows (incl. error/retry), the purchase record form (seller+price gating, stepper validation), the seller form/detail/payments screens, the shared detail sheet and confirm-delete flow, the transaction-guarded price and seller delete guards, and error boundary. SQLite is faked via `testHelpers/inMemorySqlite.ts` for speed; migration bodies, FIFO reallocation, integer money math and rollback run against real SQLite (`testHelpers/sqliteAdapter.ts` + `__tests__/dbSqlite.test.ts`). E2E via Maestro (`.maestro/`); the Detox shell in `e2e/` is not wired to an installed Detox.

```sh
npm test              # 260 tests, 47 suites
maestro test .maestro/ # Maestro
```

## Changelog

> Version tags/releases are intentionally paused — the app stays at dev version `0.1.0` until the core business feature set is stable. Entries below are chronological.

### Unreleased (correctness, i18n-safe errors, test health)

**Database**
- Money is stored as integer minor units (`database/money.ts`, migration v11 with a marker row so a re-run can never double-convert): sums, totals and balance comparisons are exact integer math, no epsilon. Service/type boundaries stay in major units.
- `deletePayment` FIFO reallocation rewritten without `LIMIT`/`OFFSET` (SQLite rejects correlated outer references there — the old statement always failed on-device) and now only re-ranks `auto` links: explicit user-chosen links are never moved (migration v10 `link_source`, pre-existing links default to `explicit`).
- Migration v9 unlinks `purchase_items.price_id` (nullable) before deleting blank prices — previously it failed with `FOREIGN KEY constraint failed` on affected installs and retried every launch.
- Versioned migrations export `LATEST_VERSION` (test fakes use it instead of a hardcoded copy); new migration v12 drops the unused `idx_purchases_created_at`/`idx_payments_paid_at` indexes and the write-only `purchases.purchased_at` column.
- New `database/sql.ts` holds the shared SQL helpers (LIKE escaping, FK/unique detection, seller existence, owed/paid math, seller balance projection) instead of three copy-pasted copies.
- Validation: `Number.isFinite` amounts/prices/quantities (NaN/Infinity rejected), `price_id` must reference an existing price (`ERROR_PRICE_NOT_FOUND`), page limits clamped to 1–100.
- Errors: literal English `DatabaseError('Failed to …')` replaced with the localized `ERROR_DATABASE`; initializers rethrow the original error; updates/deletes of missing rows throw `ERROR_NOT_FOUND` consistently.

**App / UX**
- Failed list loads render an error state with retry (`components/LoadError`) instead of an empty list, fake zeros, or an endless skeleton (prices, sellers, seller detail/payments/purchases, purchase history).
- Raw error text never reaches the UI: single `getErrorMessage` helper (`utils/errors.ts`, `DatabaseError` message or the generic message); `services/errors.ts` re-export keeps UI code off `database/*` imports.
- Overpayments are validated up front in Record Payment / Payment Review (cents comparison) instead of only at commit.
- Seller list refetches on tab focus; seller detail uses single-seller aggregates (`getSellerStatById`/`getSellerBalanceById`).
- Startup DB failure shows an error with retry instead of sending returning users to onboarding.
- A11y: labels/roles on search, sort, stepper, row and retry controls; skeletons hidden from assistive tech; larger hit targets.
- Perf: memoized price sort/rows, stable seller-row callbacks, memoized localized constants.

**Tests / tooling**
- 260 tests / 47 suites. New `testHelpers/sqliteAdapter.ts` (real SQLite via `node:sqlite`) backs `__tests__/dbSqlite.test.ts`: FIFO reallocation, explicit-link preservation, v9 blank-row repair, minor-units conversion, rollback.
- Maestro flows rewritten against real texts/testIDs (new stable testIDs on tabs, key buttons and inputs); Detox selectors use testIDs. `e2e/` remains a Detox shell (Detox not installed).
- Removed unused dependencies and dead code (`SelectPicker`, dead utils, duplicate settings tiles, shared price/seller form and row components).

### 2026-09-16

**Database**
- Prices unique compound key narrowed from `(category, unit, price)` to `(category, unit)` — a category+unit now has a single price (the amount is a mutable value). Migration v8 collapses duplicates (keeping the most recent row, re-pointing purchase line items) and swaps `idx_prices_category_unit_price` for `idx_prices_category_unit`.
- `createPrice`/`updatePrice` duplicate guards and `ERROR_PRICE_EXISTS` message updated to the new key.

### 2026-09-10 (VI)

**Features**
- Explicit payment -> purchase linking: `createPayment` links a payment to the seller's oldest purchase that has no payment yet (FIFO) when no `purchase_id` is supplied; migration v4 backfills existing unlinked payments. A purchase is locked against edit/delete once a payment references it.

**Fixes**
- `updatePurchase`/`deletePurchase` now block mutations that would leave the seller overpaid (`paid > owed`), independent of the payment-link lock.

### 2026-09-10 (V)

**Fixes**
- Purchase lock now settles a seller's payments against their purchases oldest-first (FIFO): a purchase is locked once cumulative payments cover it and every earlier purchase, so a seller with three purchases and payments covering two leaves exactly one editable. The list projects a computed `has_payment` flag per header and `isPurchaseLocked` uses the same FIFO rule.

### 2026-09-10 (IV)

**Features**
- Purchases are locked against update/delete only once their seller is fully settled (recorded payments cover all owed, `paid >= owed`); sellers who still owe keep editable purchases: enforced by a transaction-guarded check (`isPurchaseLocked`) in `updatePurchase`/`deletePurchase`, and reflected in the purchase history where the edit action is replaced by a lock indicator

**Tests**
- Added DB guard tests for locked/unlocked purchases (including purchases with no seller) and a service test for `getPaidSellerIds`

### 2026-09-10 (III)

**Fixes**
- Seller purchases and payments screens now keyset-paginate instead of silently truncating at 100 rows; seller detail loads a bounded recent slice (`RECENT_SELLER_ITEMS_LIMIT`)
- Seller purchase history header count/total come from the SQL aggregate, so they stay correct as the list paginates

**Tests**
- Added fresh-install schema assertions for the normalized `purchases`/`purchase_items`/`payments` shape (and that the legacy v3 table swap is skipped)
- Added DB-level coverage for the purchases `sellerId` page filter and `fetchPaymentsPage` keyset behavior

### 2026-09-10 (II)

**Fixes**
- Recent-purchases screen loads a bounded page (`getRecentPurchases`) plus a `getPurchaseCount()` total instead of fetching every purchase row
- `useAsync` holds its callbacks in a ref so `execute` stays referentially stable for inline options
- `useSearchFilter` predicate is optional, so server-side search screens reuse the hook without a dummy filter

**Database**
- New installs now bootstrap the normalized `purchases` + `purchase_items` + `payments` schema directly; migration v3 remains for legacy flat-table upgrades

**Refactor**
- `styles.ts` split into per-domain factories under `styles/` (shared, onboarding, pricing, purchasing, seller, settings) composed by `styles/index.ts`
- Tab labels moved from `App.tsx` literals into `TAB_LABELS` in `constants/`

### 2026-09-10

**Features**
- Price list grouped by category (`SectionList`) with sticky section headers and per-group counts; flat rows show unit · price with right-aligned tabular numbers
- Rows are tappable: tap opens a redesigned price detail sheet (category chip, large price hero, created date, edit/delete actions) — per-row edit/delete icons removed
- Availability (`is_available`) removed entirely from prices: type, schema, forms, CSV export, and the purchase picker (all prices selectable)
- Seller rows: icon-led stat line (receipt = purchases · total, wallet = balance) with screen-reader label replacing text badges
- Seller details: fixed profile header with scrollable purchase/payment sections and a layout-mirroring loading skeleton
- Seller phone number and address are now mandatory (form-validated); unit selection button groups render labels in a single primary color; form fields share one width/height rhythm

**Refactor**
- `SectionHeader` gained a `compact` variant; `PrimaryButton`/`SecondaryButton` support `compact` size and style overrides; `PriceCardActions` removed
- README description/features refreshed

### 2026-09-07

**Database**
- Normalized `purchases` into a header (`purchases`) + line items (`purchase_items`) so a single purchase can hold multiple plum types/units; migration v3 backfills legacy rows (one header + one item each, ids/totals preserved) and skips the swap when already normalized
- New `payments` table (seller-level, optional `purchase_id` tie) with indexes

**Features**
- Purchasing: record a purchase with multiple line items (price + quantity per line), add/remove lines, live grand total; history rows list each line; edit sheet updates per-line quantities; CSV exports one row per line item
- Payments: per-seller Owed/Paid/Balance summary, "Record Payment" sheet (amount, optional method/note), payment history with delete, outstanding balance badge on seller rows
- Overpayment guard: a payment cannot exceed a seller's outstanding balance (transaction-guarded); sellers with payments cannot be deleted

**Refactor**
- `IPurchase` split into `IPurchase` + `IPurchaseItem` + `IPurchaseDetail`; search matches seller name or line-item category/unit
- Seller detail switched to a ScrollView with payment + purchase sections (no nested VirtualizedList)

### 2026-09-02 (II)

**Features**
- Categories reduced to fruit/seed; units reduced to cup/gallon/bushels
- Record-purchase form: seller and price item must be selected before the quantity stepper unlocks; seller required to record
- Sellers: optional address field (DB migration v2 + form + detail sheet)
- Purchase history: quantity-only edit (seller no longer editable); delete removed; FontAwesome edit icon shared with other screens
- iOS notifications via react-native-toast-message (Android keeps native toasts)
- Export CSV button: reduced vertical padding, vertically aligned with the search button

**Fixes**
- `PriceContext.refresh`: monotonic request token prevents stale overwrites; errors surfaced as toasts instead of unhandled rejections
- `EditPurchaseSheet`: quantity validated with the shared `QUANTITY_PATTERN` (no more `1.5` → 1)
- `deleteSeller` referential guard wrapped in a `BEGIN IMMEDIATE` transaction (matches `deletePrice`)
- Removed misleading `getItemLayout` (hardcoded 72px) from price/seller lists
- Settings tab: renamed nested screen to avoid duplicate-route-name navigation warning
- Seller detail sheet: replaced nested `FlatList` with mapped list (VirtualizedList-in-ScrollView warning)

**Refactor**
- Extracted `useConfirmDelete`, `useSearchFilter`, `SearchIconButton`, `DetailSheet`, shared `lightHaptic` (`utils/haptics.ts`)
- Removed unused root `index.ts` barrel, commented-out export/download code, and ~14 dead styles (incl. invalid `fontWeight` values)
- SecondaryButton accepts an optional `buttonStyle` override

### 2026-09-02

**Fixes**
- Remove unused `react-native-fs` optional require from `csvExport` (Metro fails production bundling on unresolved literal requires); CSV now shares via the native Share sheet
- Record-purchase form: show error (not success) toast when no price is selected; only `is_available` prices appear in the picker
- iOS bundle identifier no longer the RN template placeholder (`com.plumprocurement`)

**Database**
- Versioned migration strategy (`PRAGMA user_version`, `database/migrations.ts`); schema bootstrap runs once (memoized) instead of on every service call
- Indexes on `purchases(price_id, seller_id, created_at)` and `sellers(name)`; legacy `seller_id` column migration preserved
- `deletePrice` referential guard wrapped in a `BEGIN IMMEDIATE` transaction
- Removed dead/unsafe `truncatePrices`/`dropTblPrices` exports

**Features**
- Purchase history: edit (quantity/seller, total recomputed) and delete per entry with confirm; recents refresh on tab focus
- Settings tab with persisted theme preference (system/light/dark) via `ThemeModeContext`
- Seller stats (purchase count/total) aggregated in SQL (`GROUP BY`) instead of loading all purchases client-side; seller detail sheet loads that seller's purchases on demand
- CSV export for prices and sellers (BOM, dated filename)

### 2026-08-27

**Refactor**
- Remove `zustand` dual state (`store/prices.ts`); `PriceContext` is single source
- Extract `SearchBar` (debounced 300 ms), `SelectPicker`, `QuantityStepper`, `SellerRow`, `PriceCardActions`
- Centralize `ToastAndroid` → `utils/notifications` (`showSuccess`/`showError`)
- Centralize `QUANTITY_PATTERN`, `PAGINATION_CONFIG` in `constants`
- Extract `types/database.ts` shared interfaces; `services/*` own DB init + `DatabaseError`
- `styles.ts` — remove ~200 lines dead styles, move `PriceTrend` styles to theme

**Perf**
- DB singleton cached handle (`database/connection.ts` `__resetDbForTests` for tests)
- `SearchBar` debounced to reduce filter churn
- `PriceCard`/`SellerRow` wrapped `React.memo`
- `FlatList` `getItemLayout` + `removeClippedSubviews`/`windowSize`/`maxToRenderPerBatch`

**Pagination & CSV**
- `fetchPurchasesPaginated({limit,offset,query})` + `countPurchases(query)` with `LIKE` server search (`category`/`seller_name`)
- `PurchaseDetails` keyset infinite scroll (`nextCursor`/`hasMore`/`loadingMore`), pull-to-refresh, filtered export
- CSV: BOM (`\uFEFF`) for Excel, empty-list header-only, `getCsvFilename()` dated, `shareOrSaveCsv` tries `react-native-fs` cache file then `Share.share` fallback, success toast with row count

**Quality / Product / Ops**
- Accessibility: `accessibilityRole/label` on all buttons and `SearchBar`
- `PriceTrend` sparkline (last 12 prices, avg/min/max, opacity for availability) on `PurchasePrice`
- `SellerRow` shows `purchaseCount · total` aggregation via `Promise.all(sellers+purchases)`
- CI `.github/workflows/ci.yml` (Node 22, `lint` → `tsc --noEmit` → `npm test --ci`) — manual trigger only (`workflow_dispatch`)
- E2E: Maestro `.maestro/{pricing,sellers,purchasing,full-flow}.yaml` + Detox `.detoxrc.js` + `e2e/app.test.js`

### Initial
- Prices, purchasing, sellers with SQLite, referential guard, search/sort, CSV export
