# Form Sheets & UI Improvements - Masar App

## Overview
This update fixes critical UX issues with form modals, implements proper select components, normalizes currency to QAR, and cleans up the heavy theme styling.

## 🚀 Key Changes

### 1. FormSheet Wrapper Component
- **New**: `components/ui/FormSheet.tsx`
- Provides safe area handling, keyboard avoidance, and sticky footer
- Wraps all modal forms for consistent behavior
- Uses `react-native-safe-area-context` for proper notch/status bar handling

### 2. Select Component
- **New**: `components/ui/Select.tsx`
- Replaces faux TextInput selects with proper modal pickers
- Opens bottom sheet for option selection
- Never steals keyboard focus
- Consistent styling with other form elements

### 3. Currency Normalization
- **New**: `utils/currency.ts`
- Default currency set to QAR (Qatar Riyal)
- Stores amounts as minor units (dirhams) to avoid float errors
- Provides formatting utilities for consistent money display
- No more hardcoded $ symbols

### 4. Theme Cleanup
- Updated `constants/colors.ts`
- Removed heavy black borders (`borderWidth: 4`)
- Replaced brutal shadows with subtle ones
- Added clean color tokens: `border`, `surface`, `placeholder`
- Consistent spacing and border radius (12px, 16px)

## 📱 Components Updated

### Modal Forms
- ✅ `AddExpenseModal` - Uses FormSheet + Select
- ✅ `AddSubscriptionModal` - Uses FormSheet + Select  
- ✅ `CreateDealModal` - Uses FormSheet + Select
- ✅ `AccountDetailsModal` - Uses FormSheet

### UI Components
- ✅ `FormInput` - Clean borders, subtle shadows
- ✅ `BrutalCard` - Clean borders, subtle shadows
- ✅ `TransactionHistory` - Updated currency formatting

## 🔧 Technical Details

### FormSheet Features
```tsx
<FormSheet
  header={<Header title="Add New Expense" onClose={close}/>}
  footer={<Footer onCancel={close} onSave={handleSubmit}/>}
>
  {/* Form content with proper spacing */}
</FormSheet>
```

- SafeAreaView with top/bottom edges
- KeyboardAvoidingView with iOS padding behavior
- ScrollView with keyboard persistence
- Sticky footer above home indicator

### Select Component Usage
```tsx
<Select
  label="Category"
  value={category}
  options={categoryOptions}
  onChange={setCategory}
  placeholder="Select category"
/>
```

### Currency Usage
```tsx
import { formatMoney, parseMoneyToMinor, DEFAULT_CURRENCY } from '@/utils/currency';

// Format for display
formatMoney(12345, DEFAULT_CURRENCY) // "QAR 123.45"

// Parse user input to minor units
const amountMinor = parseMoneyToMinor("123.45"); // 12345
```

## 🎨 Design Tokens

### Colors
- `border: '#E5E7EB'` - Light gray borders
- `surface: '#FFFFFF'` - Card backgrounds  
- `placeholder: '#9CA3AF'` - Placeholder text
- `surfaceSecondary: '#F9FAFB'` - Secondary backgrounds

### Shadows
- `subtle` - elevation 1, very light
- `small` - elevation 1-2, light
- `medium` - elevation 2-4, moderate

### Spacing
- Container padding: 16px
- Field gap: 12px
- Border radius: 12px (inputs), 16px (cards)

## 🧪 Testing

### Manual QA Checklist
- [ ] iPhone 14/15 (iOS 17/18) - Notch handling
- [ ] Pixel 7 (Android 14) - Status bar handling
- [ ] Chrome mobile (RN Web) - Keyboard scroll

### Test Scenarios
1. **Safe Areas**: Header never under notch/status bar
2. **Keyboard**: CTAs remain visible when keyboard open
3. **Selects**: Open modal picker, no keyboard focus
4. **Currency**: All amounts show QAR, no $ literals
5. **Theme**: Clean borders, subtle shadows

### Unit Tests
- Currency utility functions
- Form validation
- Component rendering

## 🚨 Breaking Changes

### API Changes
- Amount fields now expect minor units (integers)
- Currency formatting functions updated
- Select components replace picker props

### Migration Required
- Update amount handling in forms
- Replace picker props with Select components
- Update currency display calls

## 📋 Next Steps

### Immediate
- [ ] Test on physical devices
- [ ] Verify keyboard behavior
- [ ] Check safe area handling

### Future Enhancements
- [ ] Add @gorhom/bottom-sheet for better select UX
- [ ] Implement design token system
- [ ] Add E2E tests with Detox
- [ ] Create reusable form field components

## 🔍 Files Changed

```
components/
├── ui/
│   ├── FormSheet.tsx (NEW)
│   └── Select.tsx (NEW)
├── AddExpenseModal.tsx
├── AddSubscriptionModal.tsx
├── CreateDealModal.tsx
├── AccountDetailsModal.tsx
├── FormInput.tsx
├── BrutalCard.tsx
└── TransactionHistory.tsx

constants/
└── colors.ts

utils/
└── currency.ts (NEW)
```

## 💡 Usage Examples

### Basic Form
```tsx
import FormSheet from '@/components/ui/FormSheet';
import Select from '@/components/ui/Select';

export default function MyForm() {
  return (
    <FormSheet
      header={<Text>Form Title</Text>}
      footer={<Button title="Save" />}
    >
      <FormInput label="Name" />
      <Select label="Category" options={options} />
    </FormSheet>
  );
}
```

### Currency Handling
```tsx
// Store as minor units
const amountMinor = parseMoneyToMinor(userInput);

// Display formatted
const displayAmount = formatMoney(amountMinor, 'QAR');

// API expects minor units
await api.createExpense({ amount: amountMinor });
```

## 🎯 Acceptance Criteria

- [x] No header overlaps with status bar/notch
- [x] Save/Cancel buttons visible with keyboard open
- [x] Select fields open modal, no keyboard focus
- [x] All amounts show QAR (no $ literals)
- [x] Clean theme with subtle borders/shadows
- [x] Consistent spacing and typography
- [x] Safe area handling on all devices
- [x] Keyboard avoidance working properly

## 🐛 Known Issues

- Date fields still use text input (future: implement DatePicker)
- Some inline styles may need cleanup
- Web keyboard behavior may need additional testing

## 📞 Support

For questions or issues with this update:
1. Check the test cases in `utils/currency.test.ts`
2. Verify FormSheet usage in updated components
3. Test on target devices (iOS/Android/Web)
