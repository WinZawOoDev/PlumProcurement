# PlumProcurement - Refactoring Quick Reference

## 🎯 Top 10 Refactoring Opportunities (Prioritized by Impact)

### 1. **Extract Constants File** | Priority: 🔴 CRITICAL
- **File:** Create `constants/index.ts`
- **What:** Categories, units, routes, messages
- **Current Locations:**
  - [CreatePrice.tsx:82-86](screens/pricing/CreatePrice.tsx#L82-L86) - Categories
  - [CreatePrice.tsx:109](screens/pricing/CreatePrice.tsx#L109) - Units
  - [CreatePrice.tsx:46](screens/pricing/CreatePrice.tsx#L46) - Toast message
  - [ActionButtons.tsx:23](screens/pricing/ActionButtons.tsx#L23) - Route 'CreatePrice'
  - [PurchasePrice.tsx:49](screens/pricing/PurchasePrice.tsx#L49) - Route 'PurchasePrice'
- **Impact:** Eliminates ~20 hardcoded values
- **Time:** 2-3 hours

### 2. **Create Reusable Form Components** | Priority: 🔴 CRITICAL
- **Files:** Create `components/forms/`
  - `FormSelect.tsx` - For category picker
  - `FormButtonGroup.tsx` - For unit selection
  - `FormInput.tsx` - For price input
  - `FormCheckbox.tsx` - For availability toggle
- **Current Duplication:** [CreatePrice.tsx:56-162](screens/pricing/CreatePrice.tsx#L56-L162) (4 separate Controller wrappers)
- **Impact:** Reduces CreatePrice.tsx from 245 to ~80 lines
- **Time:** 4-5 hours

### 3. **Consolidate Button Styling** | Priority: 🔴 CRITICAL
- **Files:** Create `components/buttons/PrimaryButton.tsx`
- **Current Locations:**
  - [CreatePrice.tsx:201-237](screens/pricing/CreatePrice.tsx#L201-L237) - Save/Cancel buttons
  - [EditPrice.tsx:39-56](screens/pricing/EditPrice.tsx#L39-L56) - Update/Cancel buttons
  - [ActionButtons.tsx](screens/pricing/ActionButtons.tsx) - Add price button
- **Impact:** Reduces code by ~60 lines, improves consistency
- **Time:** 3-4 hours

### 4. **Add Database Error Handling** | Priority: 🟠 HIGH
- **File:** [database.ts](database.ts)
- **Issues:**
  - No try-catch in [fetchPrices](database.ts#L19-L27)
  - No error handling in [createPrice](database.ts#L29-L42)
  - No connection pooling (recreate DB each call)
- **Impact:** Prevents crashes, improves reliability
- **Time:** 2-3 hours

### 5. **Remove Unused Imports** | Priority: 🟡 MEDIUM
- **File:** [CreatePrice.tsx](screens/pricing/CreatePrice.tsx)
  - Line 9: `SafeAreaListener`
  - Line 10: `useSafeAreaInsets`
  - Line 11: `useHeaderHeight`
- **File:** [Purchase.tsx](screens/purchaseing/Purchase.tsx)
  - Line 5: `Link` (never used)
- **Impact:** Cleaner code, faster compilation
- **Time:** 30 minutes

### 6. **Remove Dead Code** | Priority: 🟡 MEDIUM
- **File:** [PurchasePrice.tsx:108-148](screens/pricing/PurchasePrice.tsx#L108-L148)
  - Large commented-out `SearchPrice()` function
- **Impact:** Reduces code clutter
- **Time:** 15 minutes

### 7. **Extract Magic Numbers to Spacing Constants** | Priority: 🟡 MEDIUM
- **File:** Update [styles.ts](styles.ts) and [theme.ts](theme.ts)
- **Current Magic Numbers:**
  - `paddingHorizontal: 12` (repeated 5+ times)
  - `marginBottom: 20` (repeated 5+ times)
  - `fontSize: 16` (repeated 10+ times)
  - `borderRadius: 4` (repeated 8+ times)
  - Circle size: `width: 300, height: 300` (hardcoded)
- **Impact:** Improves maintainability, consistency
- **Time:** 2-3 hours

### 8. **Create Navigation Route Constants** | Priority: 🟡 MEDIUM
- **File:** Add to `constants/index.ts` (or create `constants/routes.ts`)
- **Current String Literals:**
  - 'CreatePrice', 'PurchasePrice', 'Purchase', 'Details', etc.
- **Impact:** Prevents typos, centralizes route management
- **Time:** 1 hour

### 9. **Create Custom useFormHook** | Priority: 🟢 LOW-MEDIUM
- **File:** Create `hooks/usePriceForm.ts`
- **Consolidates:** Form initialization from [CreatePrice.tsx:26-33](screens/pricing/CreatePrice.tsx#L26-L33) and [EditPrice.tsx:20-28](screens/pricing/EditPrice.tsx#L20-L28)
- **Impact:** Improves code reuse, testability
- **Time:** 2-3 hours

### 10. **Split Large Components** | Priority: 🟢 LOW-MEDIUM
- **File:** [CreatePrice.tsx](screens/pricing/CreatePrice.tsx) (245 lines → should be ~100)
- **Breakdown:**
  - `PriceFormFields.tsx` - Form controllers
  - `PriceFormActions.tsx` - Submit/Cancel buttons
  - `CreatePrice.tsx` - Orchestrator
- **Impact:** Improves readability, testability
- **Time:** 4-5 hours

---

## 📊 Quick Statistics

| Metric | Value |
|--------|-------|
| Total Hardcoded Values | 20+ |
| Duplicated Lines | ~400 |
| Unused Imports | 4 |
| Dead Code Functions | 2 |
| Magic Numbers | 30+ |
| Average Component Size | 100+ lines |
| Test Coverage | 0% |

---

## 🔍 Code Duplication Matrix

| Pattern | Count | Total Lines | File(s) |
|---------|-------|-------------|---------|
| Button styling | 4 | ~80 | CreatePrice.tsx, EditPrice.tsx, ActionButtons.tsx |
| Controller wrapper | 4 | ~110 | CreatePrice.tsx |
| Category/Unit arrays | 2 | 2 | CreatePrice.tsx (lines 45, 109) |
| Input container styling | 3 | ~45 | CreatePrice.tsx, EditPrice.tsx |
| Unused imports | 4 | 4 | CreatePrice.tsx, Purchase.tsx |
| **TOTAL** | **~17** | **~241** |  |

---

## 📝 Specific Line-by-Line Issues

### High Priority Issues

```typescript
// ISSUE 1: Hardcoded categories [CreatePrice.tsx:82-86]
<Picker.Item label='Grains' value='grains' />
<Picker.Item label='Fruits' value='fruits' />
<Picker.Item label='Vegetables' value='vegetables' />
<Picker.Item label='Dairy' value='dairy' />
<Picker.Item label='Meat' value='meat' />
// ✅ FIX: Move to PRICE_CATEGORIES constant

// ISSUE 2: Hardcoded units (duplicate) [CreatePrice.tsx:45 & 109]
unit: ['PER KG', 'PER UNIT', 'PER BUNCH'][data.unit]
buttons={['PER KG', 'PER UNIT', 'PER BUNCH']}
// ✅ FIX: Move to PRICE_UNITS constant

// ISSUE 3: Default category mismatch [CreatePrice.tsx:32]
category: 'java',  // Not in categories list!
// ✅ FIX: Change to 'grains' and use DEFAULT_CATEGORY constant

// ISSUE 4: Repeated button styling [CreatePrice.tsx:201-237]
containerStyle={{ shadowColor: 'transparent', elevation: 0, shadowOpacity: 0 }}
// ✅ FIX: Create PrimaryButton component

// ISSUE 5: No database error handling [database.ts:19-27]
const { results } = await db.executeAsync(...)
// No try-catch! Will crash if DB fails
// ✅ FIX: Wrap in try-catch, return null on error

// ISSUE 6: Hardcoded navigation [ActionButtons.tsx:23]
navigation.navigate('CreatePrice')
// ✅ FIX: Use ROUTES.CREATE_PRICE constant

// ISSUE 7: Commented validation rules [CreatePrice.tsx:57]
// rules={{ required: true }}  ← All disabled!
// ✅ FIX: Enable and move to validation constants

// ISSUE 8: Large component [CreatePrice.tsx:245 lines]
// Does: Form setup, 4 controllers, buttons, header
// ✅ FIX: Split into FormFields + FormActions + orchestrator

// ISSUE 9: Unused imports [CreatePrice.tsx:9-11]
import { SafeAreaListener, useSafeAreaInsets } from '...'  // Never used
import { useHeaderHeight } from '...'  // Never used
// ✅ FIX: Remove them

// ISSUE 10: Dead code [PurchasePrice.tsx:108-148]
// Large commented-out SearchPrice() function
// ✅ FIX: Delete or move to separate branch
```

---

## 🚀 Implementation Checklist

### Week 1: Foundation (8-10 hours)
- [ ] Create `constants/index.ts` with all hardcoded values
  - [ ] PRICE_CATEGORIES
  - [ ] PRICE_UNITS
  - [ ] MESSAGES
  - [ ] ROUTES
- [ ] Update [database.ts](database.ts) with error handling
- [ ] Create `utils/notifications.ts`
- [ ] Remove unused imports from [CreatePrice.tsx](screens/pricing/CreatePrice.tsx)
- [ ] Delete commented SearchPrice function from [PurchasePrice.tsx](screens/pricing/PurchasePrice.tsx)
- [ ] Remove dead code and unused imports from [Purchase.tsx](screens/purchaseing/Purchase.tsx)
- [ ] Create `components/buttons/PrimaryButton.tsx`

### Week 2: Form Refactoring (12-15 hours)
- [ ] Create `components/forms/FormSelect.tsx`
- [ ] Create `components/forms/FormButtonGroup.tsx`
- [ ] Create `components/forms/FormInput.tsx`
- [ ] Create `components/forms/FormCheckbox.tsx`
- [ ] Create `hooks/usePriceForm.ts`
- [ ] Refactor [CreatePrice.tsx](screens/pricing/CreatePrice.tsx)
- [ ] Refactor [EditPrice.tsx](screens/pricing/EditPrice.tsx)
- [ ] Update [styles.ts](styles.ts) - remove unused styles

### Week 3: Advanced Refactoring (10-12 hours)
- [ ] Extract spacing/sizing constants to [theme.ts](theme.ts)
- [x] Create `services/priceService.ts` (database abstraction)
- [ ] Implement Context API for price state
- [x] Add input validation rules
- [x] Optimize FlatList in [PurchasePrice.tsx](screens/pricing/PurchasePrice.tsx)
- [ ] Add loading indicators
- [x] Add error boundaries (`components/ErrorBoundary.tsx`)
- [ ] Testing & QA

---

## 🎨 Before/After Code Examples

### Example 1: Button Styling

**BEFORE:** (CreatePrice.tsx:201-218)
```typescript
<Button
  title='Save Price'
  size='md'
  disabled={saving}
  onPress={handleSubmit(handleSavePrice)}
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
/>
```

**AFTER:** (using PrimaryButton)
```typescript
<PrimaryButton
  title='Save Price'
  onPress={handleSubmit(handleSavePrice)}
  disabled={saving}
  variant='primary'
/>
```

### Example 2: Form Controller

**BEFORE:** (CreatePrice.tsx:56-77)
```typescript
<Controller
  name='category'
  control={control}
  render={({ field: { onBlur, onChange, value } }) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryLabel}>Category</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          style={styles.picker}
          mode='dialog'
        >
          <Picker.Item label='Grains' value='grains' />
          <Picker.Item label='Fruits' value='fruits' />
          {/* ... */}
        </Picker>
      </View>
    </View>
  )}
/>
```

**AFTER:** (using FormSelect)
```typescript
<FormSelect
  name='category'
  control={control}
  label='Category'
  items={PRICE_CATEGORIES}
/>
```

### Example 3: Constants

**BEFORE:** (Scattered throughout CreatePrice.tsx)
```typescript
// Line 32
category: 'java',

// Line 45
unit: ['PER KG', 'PER UNIT', 'PER BUNCH'][data.unit],

// Line 46
ToastAndroid.show('Price saved successfully!', ToastAndroid.SHORT);

// Line 82-86
<Picker.Item label='Grains' value='grains' />
// ...
```

**AFTER:** (Single constants file)
```typescript
// constants/index.ts
export const DEFAULT_CATEGORY = 'grains';
export const PRICE_UNITS = ['PER KG', 'PER UNIT', 'PER BUNCH'];
export const MESSAGES = {
  PRICE_SAVED: 'Price saved successfully!',
};
export const PRICE_CATEGORIES = [
  { label: 'Grains', value: 'grains' },
  // ...
];

// In CreatePrice.tsx
category: DEFAULT_CATEGORY,
unit: PRICE_UNITS[data.unit],
ToastAndroid.show(MESSAGES.PRICE_SAVED, ToastAndroid.SHORT);
```

---

## 📚 File Cross-Reference

### Components that need refactoring:
- [screens/pricing/CreatePrice.tsx](screens/pricing/CreatePrice.tsx) - 245 lines (Priority: 🔴 CRITICAL)
- [screens/pricing/PurchasePrice.tsx](screens/pricing/PurchasePrice.tsx) - Has dead code
- [screens/pricing/EditPrice.tsx](screens/pricing/EditPrice.tsx) - Duplicates CreatePrice patterns
- [database.ts](database.ts) - Needs error handling

### Files to create:
- `constants/index.ts` - All hardcoded values
- `components/buttons/PrimaryButton.tsx` - Reusable button
- `components/forms/` - Form field components
- `hooks/usePriceForm.ts` - Custom hook
- `utils/notifications.ts` - Centralized notifications
- `services/priceService.ts` - Database abstraction

### Files to update:
- [theme.ts](theme.ts) - Add spacing/sizing constants
- [styles.ts](styles.ts) - Use new constants
- [App.tsx](App.tsx) - Use route constants

---

## ⏱️ Time Estimate by Priority

| Priority | Items | Hours | Difficulty |
|----------|-------|-------|-----------|
| 🔴 CRITICAL | 3 | 9-12 | High |
| 🟠 HIGH | 2 | 4-6 | Medium |
| 🟡 MEDIUM | 4 | 6-9 | Low-Medium |
| 🟢 LOW-MEDIUM | 2 | 6-8 | Medium |
| **TOTAL** | **11** | **25-35** | **Varies** |

**Recommended:** Implement in phases:
- Phase 1 (Week 1): Priority 🔴 + 🟠 = 13-18 hours
- Phase 2 (Week 2): Priority 🟡 + 🟢 = 12-17 hours
- Phase 3 (Week 3): Polish & Testing = 5-10 hours

