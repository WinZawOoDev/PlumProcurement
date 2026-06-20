# PlumProcurement React Native - Comprehensive Refactoring Analysis

## Executive Summary
This analysis identifies **35+ refactoring opportunities** across the PlumProcurement codebase. The app shows good foundational organization (styles extracted, TypeScript usage) but has significant opportunities for code consolidation, duplication elimination, and architectural improvements. Estimated refactoring effort: **2-3 weeks** for full implementation.

---

## Priority 1: Critical Refactoring (High Impact, Medium Effort)

### 1.1 Extract Hardcoded Constants File ⭐⭐⭐⭐⭐
**Impact:** Reduces code duplication, centralizes business logic, improves maintainability  
**Effort:** 2-3 hours

**Issues Found:**
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L82-L86) - Lines 82-86
  - Categories hardcoded in Picker: `['Grains', 'Fruits', 'Vegetables', 'Dairy', 'Meat']`
  
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L109) - Line 109
  - Units hardcoded: `['PER KG', 'PER UNIT', 'PER BUNCH']` (also appears in line 45 array conversion)
  
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L32) - Line 32
  - Default category: `'java'` (inconsistent with category options)
  
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L46) - Line 46
  - Toast message: `'Price saved successfully!'` (hardcoded string)

- **File:** [screens/pricing/ActionButtons.tsx](screens/pricing/ActionButtons.tsx#L23) - Line 23
  - Navigation route: `'CreatePrice'` (hardcoded string)

- **File:** [screens/pricing/PurchasePrice.tsx](screens/pricing/PurchasePrice.tsx#L49) - Line 49
  - Navigation route: `'PurchasePrice'` (hardcoded string)

**Recommended Solution:**
```typescript
// Create: constants/index.ts
export const PRICE_CATEGORIES = [
  { label: 'Grains', value: 'grains' },
  { label: 'Fruits', value: 'fruits' },
  { label: 'Vegetables', value: 'vegetables' },
  { label: 'Dairy', value: 'dairy' },
  { label: 'Meat', value: 'meat' },
];

export const PRICE_UNITS = ['PER KG', 'PER UNIT', 'PER BUNCH'];

export const DEFAULT_CATEGORY = 'grains';

export const MESSAGES = {
  PRICE_SAVED: 'Price saved successfully!',
};

export const ROUTES = {
  PRICE_STACK: 'Price',
  PURCHASE_STACK: 'Purchase',
  SELLER_STACK: 'Seller',
  CREATE_PRICE: 'CreatePrice',
  PURCHASE_PRICE: 'PurchasePrice',
} as const;
```

---

### 1.2 Consolidate Button Styling ⭐⭐⭐⭐
**Impact:** Reduces code duplication, improves consistency  
**Effort:** 3-4 hours

**Issues Found:**
Multiple instances of repeated button styling patterns:

- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L201-L218) - Lines 201-218
  - Save button with inline styles (shadowColor, elevation, buttonStyle, etc.)
  
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L220-L237) - Lines 220-237
  - Cancel button with nearly identical inline styles
  
- **File:** [screens/pricing/EditPrice.tsx](screens/pricing/EditPrice.tsx#L39-L49) - Lines 39-49
  - Update button with similar styling pattern
  
- **File:** [screens/pricing/EditPrice.tsx](screens/pricing/EditPrice.tsx#L50-L56) - Lines 50-56
  - Cancel button with similar styling pattern

**Pattern Identified:**
```typescript
// Repeated in 4+ locations
containerStyle={{
  shadowColor: 'transparent',
  elevation: 0,
  shadowOpacity: 0,
}}
buttonStyle={{
  paddingBlock: 15,
  borderRadius: 5,
  backgroundColor: theme.colors.primary
}}
```

**Recommended Solution:**
Create a reusable `PrimaryButton` component wrapper:
```typescript
// Create: components/buttons/PrimaryButton.tsx
interface PrimaryButtonProps extends ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  variant = 'primary',
  ...props
}) => {
  const { theme } = useTheme();
  const styles = useStyles();
  
  // Style logic here
};
```

---

### 1.3 Create Reusable Form Field Component ⭐⭐⭐⭐⭐
**Impact:** Eliminates massive code duplication in forms  
**Effort:** 4-5 hours

**Issues Found:**
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L56-L77) - Lines 56-77
  - Category controller with View, Text, and Picker
  
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L78-L110) - Lines 78-110
  - Unit controller with ButtonGroup (similar pattern)
  
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L111-L141) - Lines 111-141
  - Price input controller with Input component
  
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L142-L162) - Lines 142-162
  - Checkbox controller with repeated styling

**Pattern:** Each Controller has identical wrapper code with labels, containers, and styling.

**Recommended Solution:**
```typescript
// Create: components/forms/FormSelect.tsx
export const FormSelect: React.FC<{
  name: string;
  control: Control;
  label: string;
  items: Array<{ label: string; value: string }>;
}> = ({ name, control, label, items }) => {
  const { theme } = useTheme();
  const styles = useStyles();
  
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>{label}</Text>
          {/* Picker JSX here */}
        </View>
      )}
    />
  );
};
```

---

## Priority 2: High Impact Refactoring (High Impact, Low-Medium Effort)

### 2.1 Add Database Error Handling & Connection Management ⭐⭐⭐⭐
**Impact:** Improves reliability, prevents crashes  
**Effort:** 2-3 hours

**Issues Found:**
- **File:** [database.ts](database.ts#L5) - Line 5
  - `initDb()` called in every function, no connection caching
  
- **File:** [database.ts](database.ts#L7-L17) - Lines 7-17
  - `initializePrices()` has no try-catch error handling
  
- **File:** [database.ts](database.ts#L19-27) - Lines 19-27
  - `fetchPrices()` has no error handling; could fail silently
  
- **File:** [database.ts](database.ts#L29-42) - Lines 29-42
  - `createPrice()` has no error handling; failed inserts not caught

**Current Problems:**
- App could crash on database errors
- No feedback to user on DB operation failures
- Connection opened/closed for each operation

**Recommended Solution:**
```typescript
// Update: database.ts
const createDbConnection = (() => {
  let db: any = null;
  return async () => {
    if (!db) {
      db = open({ name: 'plum_procurement.sqlite' });
    }
    return db;
  };
})();

export async function fetchPrices(): Promise<IPrice[] | null> {
  try {
    const db = await createDbConnection();
    const { results } = await db.executeAsync(
      `SELECT * FROM prices ORDER BY id DESC`
    );
    return results as IPrice[];
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    return null;
  }
}
```

---

### 2.2 Extract Navigation Route Constants ⭐⭐⭐⭐
**Impact:** Reduces bugs, improves maintainability  
**Effort:** 1-2 hours

**Issues Found:**
- **File:** [screens/pricing/ActionButtons.tsx](screens/pricing/ActionButtons.tsx#L23) - Line 23
  - Hard-coded string: `navigation.navigate('CreatePrice')`
  
- **File:** [screens/pricing/PurchasePrice.tsx](screens/pricing/PurchasePrice.tsx#L49) - Line 49
  - Hard-coded string: `navigation.popTo('PurchasePrice', { refresh: true })`
  
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L47) - Line 47
  - Hard-coded string: `navigation.popTo('PurchasePrice', { refresh: true })`

**Risk:** Typos in navigation routes cause crashes; changes must be made in multiple places.

**Recommended Solution:** Already identified in section 1.1 - add to constants file.

---

### 2.3 Remove Dead Code & Unused Imports ⭐⭐⭐
**Impact:** Reduces code complexity, improves clarity  
**Effort:** 1-2 hours

**Issues Found:**
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L9) - Line 9
  - Unused import: `SafeAreaListener` (never used)
  
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L11) - Line 11
  - Unused import: `useHeaderHeight` (imported but never used)
  
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L10) - Line 10
  - Unused import: `useSafeAreaInsets` (imported but never used)

- **File:** [screens/pricing/PurchasePrice.tsx](screens/pricing/PurchasePrice.tsx#L108-L148) - Lines 108-148
  - Large commented-out `SearchPrice()` function (dead code)

- **File:** [screens/purchaseing/Purchase.tsx](screens/purchaseing/Purchase.tsx#L5) - Line 5
  - Unused import: `Link` from navigation (never used)

**Recommended Solution:**
Remove all unused imports and dead code during refactoring.

---

## Priority 3: Structural Improvements (Medium Impact, Medium Effort)

### 3.1 Create Custom Hooks for Form Logic ⭐⭐⭐
**Impact:** Improves code reusability, testability  
**Effort:** 3-4 hours

**Issues Found:**
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L26-L33) - Lines 26-33
  - Form initialization with defaultValues happens inline
  
- **File:** [screens/pricing/EditPrice.tsx](screens/pricing/EditPrice.tsx#L20-L28) - Lines 20-28
  - Similar form initialization pattern

**Recommendation:**
Create custom hooks for common form patterns:

```typescript
// Create: hooks/usePriceForm.ts
export const usePriceForm = (initialData?: IPrice) => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: initialData || {
      price: '',
      unit: 0,
      category: DEFAULT_CATEGORY,
      isAvailable: false
    }
  });
  
  return { control, handleSubmit, errors };
};
```

---

### 3.2 Split CreatePrice into Smaller Components ⭐⭐⭐⭐
**Impact:** Improves readability, maintainability, testability  
**Effort:** 4-5 hours

**Issues Found:**
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L21-L245) - 225 lines
  - Component does: Form setup, 4 controllers, buttons, title component
  - Too large for a single component

**Component Size Analysis:**
```
CreatePrice.tsx: 245 lines (too large)
  - useForm hook + state: 12 lines
  - Form submission logic: 10 lines
  - 4 separate Controller components: 170+ lines
  - Footer buttons: 40 lines
  - Header title component: 20 lines
```

**Recommended Solution:**
```typescript
// Create: components/forms/PriceFormFields.tsx
// Create: components/forms/PriceFormActions.tsx
// Keep CreatePrice.tsx as orchestrator (< 100 lines)
```

---

### 3.3 Centralize Toast/Alert Notifications ⭐⭐⭐
**Impact:** Improves consistency, simplifies error handling  
**Effort:** 2 hours

**Issues Found:**
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L46) - Line 46
  - Direct `ToastAndroid.show()` call in component
  
**Issue:** No centralized notification system; difficult to change notification style globally.

**Recommended Solution:**
```typescript
// Create: utils/notifications.ts
export const showSuccess = (message: string) => {
  ToastAndroid.show(message, ToastAndroid.SHORT);
};

export const showError = (message: string) => {
  ToastAndroid.show(message, ToastAndroid.LONG);
};
```

---

## Priority 4: Code Quality Improvements (Low-Medium Impact, Low Effort)

### 4.1 Extract Pixel/Spacing Magic Numbers from Styles ⭐⭐⭐
**Impact:** Improves maintainability, consistency  
**Effort:** 2-3 hours

**Issues Found (in styles.ts):**
- Line 22: `paddingHorizontal: 12` (repeated)
- Line 26: `gap: 10` (magic number)
- Line 47: `marginBottom: 20` (magic number, used 5+ times)
- Line 115: `height: 55` (ButtonGroup height magic number)
- Line 321: `borderTopLeftRadius: 20` (magic number)
- Line 330: `fontSize: 16` (repeated in 10+ places)
- Line 372: `paddingVertical: 12` (magic number, repeated)
- Line 442: `width: 300` (magic number for circle)
- Line 447: `height: 300` (magic number for circle)
- Line 457: `fontSize: 50` (magic number)

**Recommended Solution:**
```typescript
// Add to theme.ts
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 15,
  xl: 20,
  xxl: 30,
} as const;

export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 20,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 25,
} as const;
```

---

### 4.2 Improve Component Naming Conventions ⭐⭐
**Impact:** Improves code clarity  
**Effort:** 1 hour

**Issues Found:**
- **File:** [screens/pricing/PurchasePrice.tsx](screens/pricing/PurchasePrice.tsx#L71-L82) - Lines 71-82
  - Function `EmptyPriceList()` - unclear purpose (used as ListEmptyComponent)

- **File:** [screens/pricing/PurchasePrice.tsx](screens/pricing/PurchasePrice.tsx#L85-L95) - Lines 85-95
  - Function `TitleAndDescription()` - generic name, unclear scope

- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L237-L250)
  - Function `CreatePriceHeaderTitle()` - verbose, should be `PriceFormHeader` or similar

**Recommended Solution:**
Rename to more descriptive names:
- `EmptyPriceList` → `EmptyPriceListPlaceholder` or `NoPricesMessage`
- `TitleAndDescription` → `PriceSectionHeader` or `PriceSectionTitle`
- `CreatePriceHeaderTitle` → `CreatePriceHeader`

---

### 4.3 Standardize Form Validation Patterns ⭐⭐
**Impact:** Improves reliability, consistency  
**Effort:** 2-3 hours

**Issues Found:**
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L57-L72) - Lines 57-72
  - Commented-out validation rules: `// rules={{ required: true }}`
  
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L78-L108) - Lines 78-108
  - All validation rules are commented out (4 instances)

- **File:** [screens/pricing/EditPrice.tsx](screens/pricing/EditPrice.tsx#L40-L44) - Lines 40-44
  - No validation on price input, but error message declared

**Current Problem:** No field validation; forms can submit empty values.

**Recommended Solution:**
```typescript
export const priceFormValidation = {
  category: {
    required: 'Category is required',
  },
  unit: {
    required: 'Unit is required',
  },
  price: {
    required: 'Price is required',
    pattern: {
      value: /^\d+(\.\d{1,2})?$/,
      message: 'Enter a valid price'
    }
  },
  isAvailable: {}
} as const;
```

---

## Priority 5: Architecture Improvements (Medium Impact, Medium-High Effort)

### 5.1 Create Database Abstraction Layer ⭐⭐⭐
**Impact:** Improves testability, separation of concerns  
**Effort:** 4-5 hours

**Current State:** Direct database calls from components

**Recommended Solution:**
```typescript
// Create: services/priceService.ts
class PriceService {
  async getPrices(): Promise<IPrice[] | null>
  async createPrice(price: Omit<IPrice, 'id'>): Promise<number | null>
  async deletePrice(id: number): Promise<boolean>
  async updatePrice(id: number, price: Partial<IPrice>): Promise<boolean>
}

// Usage in components:
const priceService = new PriceService();
const prices = await priceService.getPrices();
```

---

### 5.2 Implement Context API for App State ⭐⭐⭐
**Impact:** Improves state management, reduces prop drilling  
**Effort:** 3-4 hours

**Current Issue:** No global state management; each screen manages its own data.

**Recommended Solution:**
```typescript
// Create: context/PriceContext.tsx
export const PriceProvider: React.FC = ({ children }) => {
  const [prices, setPrices] = useState<IPrice[]>([]);
  
  const loadPrices = async () => {
    const data = await fetchPrices();
    setPrices(data || []);
  };
  
  return (
    <PriceContext.Provider value={{ prices, loadPrices }}>
      {children}
    </PriceContext.Provider>
  );
};
```

---

### 5.3 Create Reusable List Screen Component ⭐⭐
**Impact:** Reduces duplication for similar list screens  
**Effort:** 3-4 hours

**Current Pattern:** PurchasePrice and potentially future screens follow similar patterns:
1. Load data from database
2. Show loading state
3. Display FlatList or empty state
4. Support refresh control

**Recommended Solution:**
```typescript
// Create: components/screens/BaseListScreen.tsx
interface BaseListScreenProps<T> {
  title: string;
  description: string;
  data: T[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  renderItem: (item: T) => React.ReactNode;
  ActionButtons?: React.ComponentType;
  emptyMessage?: string;
}
```

---

## Priority 6: Performance & UX Improvements (Low-Medium Impact, Low Effort)

### 6.1 Optimize FlatList Rendering ⭐⭐
**Impact:** Improves scroll performance  
**Effort:** 1-2 hours

**Issue Found:**
- **File:** [screens/pricing/PurchasePrice.tsx](screens/pricing/PurchasePrice.tsx#L44-L58) - Lines 44-58
  - FlatList missing optimization props

**Recommended Solution:**
Add to FlatList:
```typescript
<FlatList
  data={price.list}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => <PriceCard {...item} />}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
/>
```

---

### 6.2 Add Loading States for Database Operations ⭐⭐
**Impact:** Improves UX, prevents multiple submissions  
**Effort:** 1-2 hours

**Issue Found:**
- **File:** [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx#L36) - Line 36
  - `saving` state only used to disable button, no visual feedback

**Recommendation:** Add loading spinner/indicator component.

---

## Code Duplication Summary

| Pattern | Locations | Lines | Impact |
|---------|-----------|-------|--------|
| Button styling | 4 files | ~200 | Very High |
| Controller/Form field wrapper | CreatePrice, EditPrice | ~80 | Very High |
| Navigation string literals | 3+ files | Multiple | High |
| Category/Unit constants | CreatePrice (2x) | 2 locations | High |
| Input styling | CreatePrice, EditPrice | ~30 | Medium |
| useTheme + useStyles | Most components | ~50+ | Low |

**Total Duplicated Lines: ~400+ lines can be consolidated**

---

## File Organization Issues

### Current Structure:
```
screens/
├── pricing/
│   ├── CreatePrice.tsx (245 lines)
│   ├── EditPrice.tsx (60 lines)
│   ├── PriceCard.tsx (50 lines)
│   ├── ActionButtons.tsx (30 lines)
│   ├── PurchasePrice.tsx (150+ lines)
│   └── Stack.tsx (30 lines)
├── purchaseing/
│   ├── Purchase.tsx (30 lines)
│   ├── PurchaseDetails.tsx (10 lines)
│   └── Stack.tsx (20 lines)
└── seller/
    ├── Sellers.tsx (10 lines)
    └── Stack.tsx (15 lines)
```

### Recommended Structure:
```
screens/
├── pricing/
│   ├── index.tsx (main component)
│   ├── components/
│   │   ├── PriceCard.tsx
│   │   ├── PriceForm/
│   │   │   ├── PriceFormFields.tsx
│   │   │   ├── PriceFormActions.tsx
│   │   │   └── index.tsx
│   │   ├── ActionButtons.tsx
│   │   └── EmptyState.tsx
│   ├── hooks/
│   │   └── usePriceForm.ts
│   └── Stack.tsx
components/
├── buttons/
│   └── PrimaryButton.tsx
├── forms/
│   ├── FormSelect.tsx
│   ├── FormInput.tsx
│   └── FormCheckbox.tsx
└── screens/
    └── BaseListScreen.tsx
constants/
└── index.ts
hooks/
├── usePriceForm.ts
└── useAsyncOperation.ts
services/
├── priceService.ts
└── database.ts
utils/
├── notifications.ts
└── validation.ts
```

---

## Implementation Roadmap

### Week 1: Foundation
1. Extract constants file (Section 1.1) - 2-3 hours
2. Add database error handling (Section 2.1) - 2-3 hours
3. Create notifications utility (Section 3.3) - 2 hours
4. Remove dead code (Section 2.3) - 1-2 hours

### Week 2: Component Refactoring
1. Create button component (Section 1.2) - 3-4 hours
2. Create form field components (Section 1.3) - 4-5 hours
3. Split CreatePrice (Section 3.2) - 4-5 hours
4. Create custom form hook (Section 3.1) - 3-4 hours

### Week 3: Advanced Refactoring
1. Database service abstraction (Section 5.1) - 4-5 hours
2. Context API implementation (Section 5.2) - 3-4 hours
3. Extract magic numbers (Section 4.1) - 2-3 hours
4. Add validation rules (Section 4.3) - 2-3 hours
5. Testing & QA - 4-5 hours

---

## Quick Wins (< 1 hour each)

1. ✅ Remove unused imports (CreatePrice, Purchase)
2. ✅ Remove commented-out SearchPrice function
3. ✅ Add keys to all FlatList components
4. ✅ Fix default category from 'java' to 'grains'
5. ✅ Add loading indicator to CreatePrice form
6. ✅ Add error boundaries to screens

---

## Testing Recommendations

After refactoring, add tests for:
1. Form validation (Section 4.3)
2. Database operations (Section 2.1)
3. Navigation routes (Section 2.2)
4. Component rendering
5. Form submission flow

**Recommended Testing:** Jest + React Native Testing Library

---

## Conclusion

The PlumProcurement codebase has a solid foundation but would benefit significantly from these refactoring improvements. Priority 1 items will provide the most immediate value (~400 lines reduction, improved maintainability). The estimated total effort is **2-3 weeks** for complete implementation, but **Quick Wins can be implemented in a single workday**.

