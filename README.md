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
- [react-native-nitro-sqlite](https://github.com/NitroModules/nitro-sqlite) for local storage
- [react-hook-form](https://react-hook-form.com/) for form state and validation
- [RNEUI](https://rneui.dev/) themed components + Ionicons
- Jest + react-test-renderer for unit tests

## Project Structure

```
├── App.tsx                     # Root: theme, providers, tab navigator
├── database.ts                 # SQLite schema + queries (prices, purchases, sellers)
├── constants/index.ts          # Single source of truth for all constants/config
├── services/                   # Data-access layer wrapping database.ts
│   ├── priceService.ts
│   ├── purchaseService.ts
│   └── sellerService.ts
├── context/
│   └── PriceContext.tsx        # Shared price list state (refresh/add/edit/remove)
├── components/
│   ├── buttons/Button.tsx      # PrimaryButton, SecondaryButton, IconButton
│   ├── forms/FormFields.tsx    # FormSelectField, FormInputField, FormCheckboxField,
│   │                           #   FormButtonGroupField (react-hook-form integrated)
│   └── ErrorBoundary.tsx       # Top-level crash fallback
├── screens/
│   ├── pricing/                # Price list, create, edit sheet, cards, actions
│   ├── purchasing/             # Record purchase, purchase history
│   └── seller/                 # Seller list + form sheet
├── hooks/                      # (reserved)
├── utils/index.ts              # Formatting/validation helpers
├── styles.ts                   # Centralized makeStyles styles
└── theme.ts                    # RNEUI theme + navigation theme
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
| `npm run lint` | ESLint |
| `npm test` | Jest unit tests |

## Testing

Unit tests cover utilities, every service (delegation + error propagation), the price context flows, the error boundary fallback, and the referential guard on price deletion. SQLite is mocked via `__mocks__/`.

```sh
npm test
```
