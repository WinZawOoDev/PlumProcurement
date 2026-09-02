# PlumProcurement

A React Native app for plum procurement: manage market prices, record purchases against those prices, and maintain your seller directory. Data is stored locally on-device with SQLite.

## Features

- **Prices** — create, edit (bottom sheet), delete and browse price entries per category (fruit/seed) and unit (cup/gallon/bushels); search by category or unit; sort by newest or price
- **Purchasing** — record purchases against a selected price item (available items only); seller and price must be chosen before the quantity stepper unlocks; quantity stepper with live total preview; full purchase history with count and grand total; quantity-only edit per entry; CSV export
- **Sellers** — add, edit and delete sellers with name, optional phone number and optional address; per-seller purchase stats aggregated in SQL
- **Settings** — theme preference (system/light/dark), persisted on-device
- **Notifications** — native toast on Android, in-app toast (react-native-toast-message) on iOS
- Referential safety: prices and sellers referenced by recorded purchases cannot be deleted (guarded inside transactions)

## Tech Stack

- React Native 0.84 + React 19 + TypeScript
- [@react-navigation](https://reactnavigation.org/) v7 (bottom tabs + native stacks)
- [react-native-nitro-sqlite](https://github.com/NitroModules/nitro-sqlite) for local storage (singleton cached handle)
- [react-hook-form](https://react-hook-form.com/) for form state and validation
- [RNEUI](https://rneui.dev/) themed components + Ionicons/FontAwesome icons
- [react-native-toast-message](https://github.com/calintamas/react-native-toast-message) for iOS notifications (Android uses native toasts)
- Jest + react-test-renderer + Detox/Maestro for unit & E2E tests

## Project Structure

```
├── App.tsx                     # Root: theme (incl. persisted preference), providers, tab navigator
├── database/                   # SQLite layer
│   ├── connection.ts           # Singleton cached handle, DatabaseError
│   ├── schema.ts               # One-time bootstrap: all CREATE TABLE IF NOT EXISTS
│   ├── migrations.ts           # Versioned migrations (PRAGMA user_version) + indexes
│   ├── prices.ts               # Transaction-guarded delete (referential check)
│   ├── purchases.ts            # Paginated fetch, edit/delete, SQL seller stats
│   ├── sellers.ts              # Transaction-guarded delete (referential check)
│   └── settings.ts
├── types/database.ts           # IPrice/IPurchase/ISeller/ISellerStat shared interfaces
├── constants/index.ts          # Single source of truth (incl. PAGINATION_CONFIG, QUANTITY_PATTERN, THEME_MODES)
├── services/                   # Data-access layer wrapping database/
│   ├── priceService.ts
│   ├── purchaseService.ts      # getPurchasesPaginated(page,size,query) + edit/remove + seller stats
│   ├── sellerService.ts
│   └── settingsService.ts      # onboarded flag + theme preference
├── context/
│   ├── PriceContext.tsx        # Shared price list state (refresh/add/edit/remove)
│   └── ThemeModeContext.tsx    # Theme preference (system/light/dark)
├── hooks/
│   ├── useAsync.ts             # useAsync/useLoading (centralized loading/error)
│   ├── useConfirmDelete.ts     # Shared confirm-dialog → delete → toast → refresh flow
│   └── useSearchFilter.ts      # Shared search visibility/query/filtered-list state
├── components/
│   ├── buttons/Button.tsx      # PrimaryButton, SecondaryButton, IconButton (a11y)
│   ├── forms/FormFields.tsx    # FormSelectField, FormInputField, FormCheckboxField,
│   │                           #   FormButtonGroupField (react-hook-form integrated)
│   ├── SearchBar.tsx           # Debounced search (300ms)
│   ├── SearchIconButton.tsx    # Shared search-toggle icon button
│   ├── DetailSheet.tsx         # Shared BottomSheet scaffolding
│   ├── SelectPicker.tsx        # Reusable Picker wrapper
│   ├── QuantityStepper.tsx     # + / − stepper with a11y (supports disabled)
│   ├── PriceTrend.tsx          # Sparkline for last 12 prices
│   ├── PriceDetailSheet.tsx    # Price detail (uses DetailSheet)
│   ├── SellerDetailSheet.tsx   # Seller detail + recent purchases (uses DetailSheet)
│   └── ErrorBoundary.tsx       # Top-level crash fallback
├── screens/
│   ├── pricing/                # Price list + PriceTrend, create, edit sheet, cards
│   ├── purchasing/             # Record purchase, paginated history (LIKE search), quantity edit sheet, CSV export
│   ├── seller/                 # Seller list + SQL-aggregated stats, form sheet (name/phone/address)
│   └── settings/               # Theme preference
├── utils/
│   ├── index.ts                # Formatting/validation + CSV builders (BOM, filename)
│   ├── notifications.ts        # Cross-platform showSuccess/showError
│   ├── haptics.ts              # Shared light haptic feedback
│   └── csvExport.ts            # shareOrSaveCsv (Share sheet)
├── styles.ts                   # Centralized makeStyles (incl. priceTrend*)
├── theme.ts                    # RNEUI theme + navigation theme
├── e2e/                        # Detox (ios.sim.debug, android.emu.debug)
└── .maestro/                   # Maestro flows (pricing, sellers, purchasing, full-flow)
```

## Architecture Conventions

- **Never import `database/*` from components** — go through a service in `services/`. Schema bootstrap and migrations live in `database/schema.ts` + `database/migrations.ts` (run once, memoized); services own validation and error wrapping (`DatabaseError`).
- **Schema changes**: never edit an applied migration — append a new entry to `MIGRATIONS` in `database/migrations.ts` and bump the version.
- **Shared cross-screen state** lives in Context (`PriceContext`) so mutations propagate automatically; screen-local state is fine for self-contained flows.
- **All literals belong in `constants/index.ts`** — routes, messages, UI text, dimensions, typography, validation messages.
- **Forms** use react-hook-form `Controller`s via the generic fields in `components/forms/`; pass validation through the `rules` prop.
- **Styles** live in `styles.ts` (`useStyles()`); no inline style objects.

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
| `npm test` | Jest unit tests (85 tests, 16 suites) |
| `npm run e2e:ios` | Detox iOS (ios.sim.debug) |
| `npm run e2e:android` | Detox Android (android.emu.debug) |
| `npm run maestro:test` | Maestro flows (`.maestro/`) |

## Testing

Unit tests cover utilities (incl. all CSV builders/BOM/filename, debounce), every service (incl. paginated fetch + `hasMore`, purchase edit/delete, seller stats), the schema/migration runner (bootstrap memoization, legacy `seller_id` migration, `sellers.address` migration, retry on failure), `useAsync`/`useLoading`, notification helpers, price context flows, the purchase record form (seller+price gating, stepper validation), the transaction-guarded price and seller delete guards, and error boundary. SQLite is mocked via `__mocks__/`. E2E via Detox + Maestro.

```sh
npm test              # 85 tests, 16 suites
npm run e2e:ios        # Detox
maestro test .maestro/ # Maestro
```

## Changelog

> Version tags/releases are intentionally paused — the app stays at dev version `0.1.0` until the core business feature set is stable. Entries below are chronological.

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
- `PurchaseDetails` infinite scroll (page/hasMore/loadingMore), pull-to-refresh, filtered export
- CSV: BOM (`\uFEFF`) for Excel, empty-list header-only, `getCsvFilename()` dated, `shareOrSaveCsv` tries `react-native-fs` cache file then `Share.share` fallback, success toast with row count

**Quality / Product / Ops**
- Accessibility: `accessibilityRole/label` on all buttons and `SearchBar`
- `PriceTrend` sparkline (last 12 prices, avg/min/max, opacity for availability) on `PurchasePrice`
- `SellerRow` shows `purchaseCount · total` aggregation via `Promise.all(sellers+purchases)`
- CI `.github/workflows/ci.yml` (Node 22, `lint` → `tsc --noEmit` → `npm test --ci`) — manual trigger only (`workflow_dispatch`)
- E2E: Maestro `.maestro/{pricing,sellers,purchasing,full-flow}.yaml` + Detox `.detoxrc.js` + `e2e/app.test.js`

### Initial
- Prices, purchasing, sellers with SQLite, referential guard, search/sort, CSV export
