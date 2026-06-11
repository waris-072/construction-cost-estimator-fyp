# Admin Panel Features - Visual Guide

## Admin Dashboard Navigation

```
┌─────────────────────────────────────────────────────┐
│ 🏗️ Admin Panel                                [⟳ Logout] │
├─────────────────────────────────────────────────────┤
│ Left Sidebar:                 │ Main Content Area:  │
│                               │                     │
│ 📊 Dashboard                  │ Selected Tab View   │
│ 📦 Material Prices     ✨NEW  │ - Table with data   │
│ 🏙️ City Rates         ✨NEW  │ - Edit buttons      │
│ 📄 Estimates                  │ - Delete buttons    │
│ 👥 User Management            │ - Add buttons       │
│                               │                     │
└─────────────────────────────────────────────────────┘
```

## Material Prices Interface

```
MATERIAL PRICES                              [🔄 Refresh] [➕ Add Material]

┌─────────────────────────────────────────────────────────────────────┐
│ Material  │ Category │ Unit  │ Standard │ Premium │ Luxury │ Actions │
├─────────────────────────────────────────────────────────────────────┤
│ Cement    │ cement   │ bag   │ 1,250    │ 1,400   │ 1,600  │ ✏️ 🗑️   │
├─────────────────────────────────────────────────────────────────────┤
│ Bricks    │ brick    │ 1000  │ 14,000   │ 18,000  │ 22,000 │ ✏️ 🗑️   │
├─────────────────────────────────────────────────────────────────────┤
│ Tiles     │ tiles    │ sqft  │ 180      │ 400     │ 800    │ ✏️ 🗑️   │
└─────────────────────────────────────────────────────────────────────┘

Legend:
✏️  = Edit (inline editing)
🗑️  = Delete (with confirmation)
➕ = Add new material
```

## Editing Material Prices

```
BEFORE CLICK EDIT:                AFTER CLICK EDIT:
                                  
┌──────────────────────┐         ┌──────────────────────┐
│ Material: Cement     │         │ Material: Cement     │
│ Standard: 1,250      │         │ Standard: [1300]     │
│ Premium: 1,400       │    →    │ Premium:  [1500]     │
│ Luxury: 1,600        │         │ Luxury:   [1700]     │
│ Actions: ✏️ 🗑️      │         │ Actions: ✅ ❌      │
└──────────────────────┘         └──────────────────────┘

✏️  = Edit
🗑️  = Delete
✅ = Save
❌ = Cancel
```

## Add Material Dialog

```
┌───────────────────────────────────────────────┐
│ ➕ Add New Material                        [✕] │
├───────────────────────────────────────────────┤
│                                               │
│ Material Name *    [_________________]        │
│ Category *         [_________________]        │
│ Unit *             [_________________]        │
│                                               │
│ Standard Rate      [_________]                │
│ Premium Rate       [_________]                │
│ Luxury Rate        [_________]                │
│                                               │
│                          [Cancel] [✓ Create] │
└───────────────────────────────────────────────┘

* = Required field
```

## City Rates Interface

```
CITY RATES                                    [🔄 Refresh] [➕ Add City]

┌──────────────────────────────────────────────────────────────────┐
│ City       │ Code │ Labor │ Material │ Equipment │     Actions   │
├──────────────────────────────────────────────────────────────────┤
│ Karachi    │ KHI  │ 550   │ 1,800    │ 250       │ ✏️ 🗑️        │
├──────────────────────────────────────────────────────────────────┤
│ Hyderabad  │ HYD  │ 450   │ 1,500    │ 200       │ ✏️ 🗑️        │
├──────────────────────────────────────────────────────────────────┤
│ Sukkur     │ SKR  │ 400   │ 1,300    │ 180       │ ✏️ 🗑️        │
└──────────────────────────────────────────────────────────────────┘
```

## Add City Dialog

```
┌───────────────────────────────────────────────┐
│ ➕ Add New City                           [✕] │
├───────────────────────────────────────────────┤
│                                               │
│ City Name *        [_________________]        │
│ Code *             [_________]                │
│                                               │
│ Labor Rate/sqft    [_________]                │
│ Material Rate      [_________]                │
│ Equipment Rate     [_________]                │
│                                               │
│                          [Cancel] [✓ Create] │
└───────────────────────────────────────────────┘
```

## CRUD Operations Workflow

### CREATE (Add New Material)

```
Step 1: Click "Add Material"
        ↓
Step 2: Modal opens with form
        ↓
Step 3: Fill in all required fields
        ↓
Step 4: Click "Create Material"
        ↓
Step 5: SUCCESS! Item added to database
        ↓
Step 6: Modal closes, item appears in list
```

### READ (View Materials)

```
Material Prices Tab
        ↓
Table displays all materials
        ↓
Shows: Name, Category, Unit, 3 price tiers
        ↓
Paginated if many items
        ↓
Can scroll horizontally on mobile
```

### UPDATE (Edit Prices)

```
Step 1: Find the material/city
        ↓
Step 2: Click Edit (pencil icon)
        ↓
Step 3: Input fields become editable
        ↓
Step 4: Change the prices
        ↓
Step 5: Click Save (checkmark)
        ↓
Step 6: SUCCESS! Database updated
        ↓
Step 7: Form closes, new price displayed
```

### DELETE (Remove Item)

```
Step 1: Find the material/city
        ↓
Step 2: Click Delete (trash icon)
        ↓
Step 3: Confirmation dialog appears
        ↓
Step 4: Click OK to confirm
        ↓
Step 5: SUCCESS! Item removed from database
        ↓
Step 6: Item disappears from list
```

## Color Legend

```
🔵 Blue   (#3b82f6)   Primary actions, headers
🟢 Green  (#10b981)   Success, Create, Positive actions
🟡 Orange (#f59e0b)   Warnings, Premium tier
🔴 Red    (#ef4444)   Danger, Delete, Errors
🟣 Purple (#8b5cf6)   Secondary information
🔵 Cyan   (#06b6d4)   Info, City codes
⚫ Gray   (#374151)   Text, Borders
```

## Success & Error Messages

```
✅ SUCCESS
┌─────────────────────────────────────────┐
│ ✓ Material updated successfully!        │
│ ✓ City created successfully!            │
│ ✓ Material deleted successfully!        │
└─────────────────────────────────────────┘

❌ ERROR
┌─────────────────────────────────────────┐
│ ⚠️  Please fill in all required fields  │
│ ⚠️  Failed to create material            │
│ ⚠️  Failed to delete city                │
└─────────────────────────────────────────┘
```

## Keyboard Shortcuts (Optional Future)

```
Suggested shortcuts:
Ctrl+E  = Edit mode
Ctrl+S  = Save changes
Ctrl+D  = Delete item
Escape  = Cancel/Close dialog
Enter   = Confirm (when in input)
```

## Responsive Design

```
DESKTOP (>768px):
┌──────┬──────────────────┐
│ Nav  │   Main Content   │
│ Bar  │                  │
│ (25%)│      (75%)       │
└──────┴──────────────────┘

TABLET (600-768px):
┌─────────────────────┐
│ Hamburger Menu      │
├─────────────────────┤
│   Main Content      │
│                     │
└─────────────────────┘

MOBILE (<600px):
┌─────────────────────┐
│ ☰ | Title         │
├─────────────────────┤
│  Stacked Layout     │
│  (Full width)       │
└─────────────────────┘
```

## Data Validation

```
REQUIRED FIELDS (Must fill):
  Material: ✓ Name, Category, Unit
  City:     ✓ Name, Code

OPTIONAL FIELDS (Auto-fill with 0):
  Material: Standard/Premium/Luxury Rates
  City:     Labor/Material/Equipment Rates

FIELD CONSTRAINTS:
  - Name:   Text, max 100 chars
  - Code:   Text, max 4 chars (uppercase)
  - Rates:  Numbers only, decimals allowed
  - Category: Text, max 50 chars
  - Unit:   Text, max 20 chars
```

## Permission Matrix

```
                    Regular User    Admin User
──────────────────────────────────────────────
View Prices              ✓            ✓
Edit Prices              ✗            ✓
Add Materials            ✗            ✓
Delete Materials         ✗            ✓
Edit City Rates          ✗            ✓
Add Cities               ✗            ✓
Delete Cities            ✗            ✓
Access Admin Panel       ✗            ✓
──────────────────────────────────────────────
```

## Database Changes Flow

```
User Action          Browser              API Server          Database
─────────────────────────────────────────────────────────────────────
Edit Material  →  Form Submission  →  Validate Input  →  UPDATE Query
                     (PUT request)    (Backend Check)   (MySQL Save)
                                              ↓
                                       Response 200 OK
                        ↓─────────────────────
                   Update UI with
                   New Values
```

This completes the visual guide for the Admin CRUD Operations! 🎉
