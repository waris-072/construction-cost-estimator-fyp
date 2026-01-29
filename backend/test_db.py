#!/usr/bin/env python3
"""
Test database connection and models
"""
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from sqlalchemy import text  # ADD THIS IMPORT

app = create_app()

with app.app_context():
    print("="*60)
    print("DATABASE CONNECTION TEST")
    print("="*60)
    
    try:
        # Test database connection
        print("🔍 Testing database connection...")
        db.session.execute(text("SELECT 1"))  # ADD text() wrapper
        print("✅ Database connection successful!")
        
        # Test if tables exist
        print("\n🔍 Checking for tables...")
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        
        if tables:
            print(f"✅ Found {len(tables)} tables:")
            for table in tables:
                print(f"   - {table}")
        else:
            print("❌ No tables found!")
            
        # Test User model
        print("\n🔍 Testing User model...")
        try:
            from app.database import User
            user_count = User.query.count()
            print(f"✅ User model works! Found {user_count} users")
        except Exception as e:
            print(f"❌ User model error: {e}")
            
        # Test City model
        print("\n🔍 Testing City model...")
        try:
            from app.database import City
            city_count = City.query.count()
            print(f"✅ City model works! Found {city_count} cities")
        except Exception as e:
            print(f"❌ City model error: {e}")
            
        # Test Material model
        print("\n🔍 Testing Material model...")
        try:
            from app.database import Material
            material_count = Material.query.count()
            print(f"✅ Material model works! Found {material_count} materials")
        except Exception as e:
            print(f"❌ Material model error: {e}")
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure MySQL is running in XAMPP")
        print("2. Check if database 'construction_estimator' exists")
        print("3. Try creating database manually in phpMyAdmin")
        print("4. Check your DATABASE_URL in .env file")
    
    print("\n" + "="*60)