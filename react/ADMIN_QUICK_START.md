# Quick Start: Admin Price Management

## 🚀 Quick Access

### Admin Login
```
Email:    admin@example.com
Password: admin123
```

### Navigate to Admin Panel
1. Log in with admin credentials
2. Click "Admin Panel" in the navigation menu
3. You're in! 👋

## 📊 What You Can Do

### Material Prices Tab
- **View**: See all materials with 3 price tiers (Standard/Premium/Luxury)
- **Edit**: Click the pencil icon to change any price
- **Add**: Click "Add Material" to create new materials
- **Delete**: Click the trash icon to remove materials

### City Rates Tab
- **View**: See all cities with their labor, material, and equipment rates
- **Edit**: Click the pencil icon to adjust rates
- **Add**: Click "Add City" to add new cities
- **Delete**: Click the trash icon to remove cities

## ✏️ Workflow Examples

### Example 1: Update Cement Price
```
1. Material Prices → Find "Cement"
2. Click Edit (pencil icon)
3. Change Standard: 1,250 → 1,300
4. Click Save (checkmark)
5. Done! ✓
```

### Example 2: Add Marble Material
```
1. Material Prices → Click "Add Material"
2. Fill form:
   - Name: Marble
   - Category: stone
   - Unit: sq. ft.
   - Standard: 500
   - Premium: 700
   - Luxury: 1000
3. Click "Create Material"
4. Done! ✓
```

### Example 3: Add Lahore City
```
1. City Rates → Click "Add City"
2. Fill form:
   - Name: Lahore
   - Code: LHR
   - Labor Rate/sqft: 500
   - Material Rate: 1600
   - Equipment Rate: 200
3. Click "Create City"
4. Done! ✓
```

## 🎯 Key Features

✅ **Real-Time Updates**
- Changes saved instantly to database
- No need to publish or refresh
- Available immediately for new estimates

✅ **Three Price Tiers**
- Standard: Budget-friendly
- Premium: Mid-range
- Luxury: High-end

✅ **City-Based Rates**
- Different rates for each city
- Used in cost calculations
- Easy to update by region

✅ **Easy Management**
- Simple, intuitive interface
- Clear action buttons
- Instant feedback on changes

## 💡 Tips

1. **Use the Refresh button** if data seems outdated
2. **Confirm deletions** - they're permanent!
3. **Try before updating** - test with one item first
4. **Check the database** - all changes are saved there

## 🔍 Verify Changes

### In the Admin Panel
1. Make a change (e.g., update cement price)
2. Click Refresh button
3. Verify the new value appears

### In the Database
```sql
-- Check cement price
SELECT * FROM materials WHERE name='Cement';

-- Check Karachi rates
SELECT * FROM cities WHERE code='KHI';

-- See all materials
SELECT * FROM materials;

-- See all cities
SELECT * FROM cities;
```

### In Real Estimation
1. Create a new estimate
2. See that it uses the updated prices ✓

## ⚠️ Important Notes

- Only **admins** can access price management
- Changes affect **NEW** estimates only (old ones don't change)
- Deleting is **permanent** - no undo!
- All changes are **database-backed** - survived restarts
- **No approval needed** - changes are instant

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't find Admin Panel | Make sure you're logged in as admin |
| Changes not saving | Check browser console for errors |
| Old prices still showing | Click Refresh button |
| Can't add new material | Make sure all required fields are filled |
| Delete button missing | Scroll right in the table if on mobile |

## 📱 Supported Browsers

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🔐 Security

- Only admins can access
- JWT token required
- All requests validated
- Database encrypted

## Need Help?

1. Check browser console (F12)
2. Review backend logs
3. Read ADMIN_PRICE_MANAGEMENT.md
4. Contact system admin

---

**You're all set!** 🎉 Start managing prices now!
