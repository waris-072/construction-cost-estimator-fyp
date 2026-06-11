# Admin Price Management System

## Overview
The Construction Cost Estimator includes a comprehensive Admin Panel that allows administrators to manage all material and city prices directly through the application. All changes are automatically saved to the database.

## Features Implemented

### 1. Material Price Management
**CRUD Operations:**
- ✅ **Create** - Add new materials with standard, premium, and luxury rates
- ✅ **Read** - View all materials organized by category
- ✅ **Update** - Edit any material's prices (standard, premium, luxury rates)
- ✅ **Delete** - Remove materials from the system

**Material Fields:**
- Material Name
- Category (cement, brick, steel, sand, crush, tiles, paint, etc.)
- Unit (bag, 1000 pcs, kg, truck, sq. ft., liter, etc.)
- Standard Rate (PKR)
- Premium Rate (PKR)
- Luxury Rate (PKR)

### 2. City Rate Management
**CRUD Operations:**
- ✅ **Create** - Add new cities with regional rates
- ✅ **Read** - View all cities and their rates
- ✅ **Update** - Modify city rates in real-time
- ✅ **Delete** - Remove cities from the system

**City Fields:**
- City Name
- City Code (3-4 letters, e.g., KHI, HYD)
- Labor Rate per Sqft (PKR)
- Material Base Rate (PKR)
- Equipment Rate (PKR)

### 3. Current Materials in Database (2024 Prices)
```
1. Cement - 1,250 PKR (standard) → 1,600 PKR (luxury)
2. Bricks - 14,000 PKR (standard) → 22,000 PKR (luxury)
3. Steel Bars - 280 PKR (standard) → 450 PKR (luxury)
4. Sand - 30,000 PKR (standard) → 40,000 PKR (luxury)
5. Crush - 35,000 PKR (standard) → 45,000 PKR (luxury)
6. Tiles - 180 PKR (standard) → 800 PKR (luxury)
7. Paint - 800 PKR (standard) → 2,000 PKR (luxury)
```

### 4. Current Cities in Database
```
1. Karachi (KHI) - Labor: 550/sqft, Material: 1,800, Equipment: 250
2. Hyderabad (HYD) - Labor: 450/sqft, Material: 1,500, Equipment: 200
3. Sukkur (SKR) - Labor: 400/sqft, Material: 1,300, Equipment: 180
```

## How to Use

### Accessing Admin Panel
1. Login with admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
2. Navigate to **Admin Panel** from the menu
3. Select the tab you want to manage (Materials/Cities)

### Managing Material Prices

#### Update Existing Material
1. Go to **Admin Panel** → **Material Prices**
2. Find the material you want to edit
3. Click the **Edit** (pencil) icon
4. Enter new prices for:
   - Standard Rate (budget-friendly option)
   - Premium Rate (mid-range option)
   - Luxury Rate (high-end option)
5. Click **Save** (checkmark) to update
6. Click **Cancel** (X) to discard changes

#### Add New Material
1. Go to **Admin Panel** → **Material Prices**
2. Click **Add Material** button (if available)
3. Fill in:
   - Material Name (e.g., "Marble", "Granite")
   - Category (e.g., "tiles", "stone")
   - Unit (e.g., "sq. ft.", "kg")
   - Standard, Premium, and Luxury rates
4. Click **Create**

#### Delete Material
1. Find the material in the list
2. Click the **Delete** icon (trash can)
3. Confirm deletion
4. Material is removed from the system

### Managing City Rates

#### Update Existing City
1. Go to **Admin Panel** → **City Rates**
2. Find the city you want to edit
3. Click the **Edit** (pencil) icon
4. Update:
   - Labor Rate per Sqft
   - Material Base Rate
   - Equipment Rate
5. Click **Save** to update the database

#### Add New City
1. Go to **Admin Panel** → **City Rates**
2. Click **Add City** button
3. Enter:
   - City Name (e.g., "Lahore", "Islamabad")
   - City Code (3-4 letter code, e.g., "LHR", "ISL")
   - Labor Rate per Sqft (PKR)
   - Material Base Rate (PKR)
   - Equipment Rate (PKR)
4. Click **Create**

#### Delete City
1. Find the city in the list
2. Click **Delete**
3. Confirm deletion

## Backend API Endpoints

All price management is handled by these API endpoints (admin-only):

### Materials Management
```
GET    /api/admin/materials              - Get all materials
POST   /api/admin/materials              - Create new material
PUT    /api/admin/materials/<id>         - Update material prices
DELETE /api/admin/materials/<id>         - Delete material
```

### Cities Management
```
GET    /api/admin/cities                 - Get all cities
POST   /api/admin/cities                 - Create new city
PUT    /api/admin/cities/<id>            - Update city rates
DELETE /api/admin/cities/<id>            - Delete city
```

## Database Schema

### Materials Table
```sql
CREATE TABLE materials (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    standard_rate FLOAT DEFAULT 0,
    premium_rate FLOAT DEFAULT 0,
    luxury_rate FLOAT DEFAULT 0
);
```

### Cities Table
```sql
CREATE TABLE cities (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    labor_rate_per_sqft FLOAT DEFAULT 0,
    material_base_rate FLOAT DEFAULT 0,
    equipment_rate FLOAT DEFAULT 0
);
```

## Real-Time Updates

✅ **All changes are immediately saved to the database**
- No need to manually save or publish changes
- Changes take effect immediately for all new estimates
- Users will see updated prices when they create new estimates

## Security

- ✅ Only users with **admin role** can access price management
- ✅ All requests are protected by JWT authentication
- ✅ Admin verification is enforced on the backend
- ✅ CORS headers configured for secure requests

## Example: Updating Cement Prices

1. Login as admin
2. Go to Admin Panel → Material Prices
3. Find "Cement" in the table
4. Click Edit
5. Update prices:
   - Standard: 1,300 (was 1,250)
   - Premium: 1,500 (was 1,400)
   - Luxury: 1,700 (was 1,600)
6. Click Save
7. Database updated ✓

Next time a user creates an estimate, they'll see the new cement prices!

## Troubleshooting

### Prices Not Updating
- Ensure you're logged in as admin
- Click the **Refresh** button in the admin panel
- Check browser console for errors

### Cannot Access Admin Panel
- Verify your account has "admin" role
- Re-login with correct admin credentials
- Contact another admin if you've lost access

### Need to Reset Prices
- Contact database administrator
- Admin can delete and recreate price entries
- Or modify database directly if needed

## Future Enhancements

Potential improvements:
- [ ] Bulk price updates (percentage increase/decrease)
- [ ] Price history and audit logs
- [ ] Category-based price templates
- [ ] Import/Export prices from CSV
- [ ] Price change notifications for users
- [ ] Scheduled price updates

## Support

For issues with price management:
1. Check this documentation
2. Review backend logs in `backend/run.py` output
3. Check browser console (F12) for JavaScript errors
4. Contact system administrator
