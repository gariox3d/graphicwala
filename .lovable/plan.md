

## Problem Analysis

User ko 3 cheezein fix karni hain:
1. **JPG size galat hai** - "Lamba jyada ho gya" - currently 420px width with auto height, aspect ratio fixed nahi hai
2. **2 x 3 portrait chahiye** - Standard photo print size (2:3 aspect ratio jaise 400x600px ya 500x750px)
3. **Logo 1 line me chahiye** - "Graphic Wala" text wrap ho raha hoga chote container me

## Solution

### 1. JPG Size Fix - 2:3 Portrait Ratio
- **Width**: 500px (phone screen ke liye perfect)
- **Height**: 750px (2:3 ratio maintain karne ke liye)
- `html2canvas` ko fixed height bhi dena padega taaki auto-expand na ho

### 2. Logo Single Line Fix
- Header me `flex-shrink: 0` add karna padega logo ko
- Shop name ka `whiteSpace: 'nowrap'` taaki "Graphic Wala" wrap na ho
- Font size chota karna padega 2x3 size me fit karne ke liye

### 3. Content Adjustment for Small Size
- 2x3 size chota hai toh:
  - Font sizes choti karni hain
  - Padding/margins reduce karni hain
  - Table rows compact karni hain
  - QR code size choti karni hai

### 4. Fixed Container for JPG
- `jpgRef` container ko fixed 500x750px banana hai
- Overflow handling add karna hai taaki content clip na ho

## Files to Edit
- `src/pages/admin/AdminBilling.tsx` - JPG generation logic aur BillTemplate styling

## Changes Summary
1. `handleDownloadJPG` me width: 500, height: 750 set karna
2. `BillTemplate` ko `isJpg` prop dena taaki 2x3 ke liye alag compact styling ho
3. Header me logo + name ko single line me force karna
4. Font sizes, spacing choti karni for 2x3 format
5. Add JPG size option in page size dropdown

