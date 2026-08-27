# PlumProcurement

A React Native app for plum procurement: manage market prices, record purchases against those prices, and maintain your seller directory. Data is stored locally on-device with SQLite.

## Features

- **Prices** — create, edit (bottom sheet), delete and browse price entries per category/unit; search by category or unit; sort by newest or price
- **Purchasing** — record purchases against a selected price item with quantity stepper and live total preview; full purchase history with count and grand total
- **Sellers** — add, edit and delete sellers with name and optional phone number
- Referential safety: prices referenced by recorded purchases cannot be deleted

## Tech Stack

- React Native 0.84 + React 19 + TypeScript
- [@react-navigation](https://reactnavigation.org/) v7 (bottom tabs + native stacks)
- [react-native-nitro-sqlite](https://github.com/NitroModules/nitro-sqlite) for local storage (singleton cached handle)
- [react-hook-form](https://react-hook-form.com/) for form state and validation
- [RNEUI](https://rneui.dev/) themed components + Ionicons
- Jest + react-test-renderer + Detox/Maestro for unit & E2E tests

## Project Structure

```
├── App.tsx                     # Root: theme, providers, tab navigator
├── database.ts                 # SQLite schema + queries (singleton cached handle, paginated fetch)
├── types/database.ts           # IPrice/IPurchase/ISeller shared interfaces
├── constants/index.ts          # Single source of truth (incl. PAGINATION_CONFIG, QUANTITY_PATTERN)
├── services/                   # Data-access layer wrapping database.ts
│   ├── priceService.ts
│   ├── purchaseService.ts      # getPurchasesPaginated(page,size,query) + count
│   └── sellerService.ts
├── context/
│   └── PriceContext.tsx        # Shared price list state (refresh/add/edit/remove)
├── hooks/
│   └── useAsync.ts             # useAsync/useLoading (centralized loading/error)
├── components/
│   ├── buttons/Button.tsx      # PrimaryButton, SecondaryButton, IconButton (a11y)
│   ├── forms/FormFields.tsx    # FormSelectField, FormInputField, FormCheckboxField,
│   │                           #   FormButtonGroupField (react-hook-form integrated)
│   ├── SearchBar.tsx           # Debounced search (300ms)
│   ├── SelectPicker.tsx        # Reusable Picker wrapper
│   ├── QuantityStepper.tsx     # + / − stepper with a11y
│   ├── PriceTrend.tsx          # Sparkline for last 12 prices
│   └── ErrorBoundary.tsx       # Top-level crash fallback
├── screens/
│   ├── pricing/                # Price list + PriceTrend, create, edit sheet, cards
│   ├── purchasing/             # Record purchase, paginated history (server LIKE search)
│   └── seller/                 # Seller list + stats (purchase count/total), form sheet
├── utils/
│   ├── index.ts                # Formatting/validation + CSV (BOM, filename)
│   ├── notifications.ts        # showSuccess/showError centralized
│   └── csvExport.ts            # shareOrSaveCsv (RNFS file-system with Share fallback)
├── styles.ts                   # Centralized makeStyles (incl. priceTrend*)
├── theme.ts                    # RNEUI theme + navigation theme
├── e2e/                        # Detox (ios.sim.debug, android.emu.debug)
└── .maestro/                   # Maestro flows (pricing, sellers, purchasing, full-flow)
```

## Architecture Conventions

- **Never import `database.ts` from components** — go through a service in `services/`. Services own table initialization, validation and error wrapping (`DatabaseError`).
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
| `npm test` | Jest unit tests (52 tests, 10 suites) |
| `npm run e2e:ios` | Detox iOS (ios.sim.debug) |
| `npm run e2e:android` | Detox Android (android.emu.debug) |
| `npm run maestro:test` | Maestro flows (`.maestro/`) |

## Testing

Unit tests cover utilities (incl. CSV BOM/filename, debounce), every service (incl. paginated fetch + `hasMore`), `useAsync`/`useLoading`, notification helpers, price context flows, error boundary, and referential guard. SQLite is mocked via `__mocks__/`. E2E via Detox + Maestro.

```sh
npm test              # 52 tests, 10 suites
npm run e2e:ios        # Detox
maestro test .maestro/ # Maestro
```

## Changelog

### v0.2.0 — 2026-08-27

**Refactor**
- Remove `zustand` dual state (`store/prices.ts`); `PriceContext` is single source
- Extract `SearchBar` (debounced 300 ms), `SelectPicker`, `QuantityStepper`, `SellerRow`, `PriceCardActions`
- Centralize `ToastAndroid` → `utils/notifications` (`showSuccess`/`showError`)
- Centralize `QUANTITY_PATTERN`, `PAGINATION_CONFIG` in `constants`
- Extract `types/database.ts` shared interfaces; `services/*` own DB init + `DatabaseError`
- `styles.ts` — remove ~200 lines dead styles, move `PriceTrend` styles to theme

**Perf**
- DB singleton cached handle (`database.ts:7` `__resetDbForTests` for tests)
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
- CI `.github/workflows/ci.yml` (Node 22, `lint` → `tsc --noEmit` → `npm test --ci`) — green
- E2E: Maestro `.maestro/{pricing,sellers,purchasing,full-flow}.yaml` + Detox `.detoxrc.js` + `e2e/app.test.js`
- Version bump `0.1.0 → 0.2.0` (`package.json`, `app.json`), tag `v0.2.0`

### v0.1.0 — Initial
- Prices, purchasing, sellers with SQLite, referential guard, search/sort, CSV export
