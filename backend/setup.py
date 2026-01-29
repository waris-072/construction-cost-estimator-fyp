# setup.py - Manual database setup script
import os
import sys

print("="*60)
print("DATABASE SETUP FOR CONSTRUCTION COST ESTIMATOR")
print("="*60)

print("\n📋 Manual Database Setup Instructions:")
print("\n1. Open XAMPP Control Panel")
print("2. Start MySQL service")
print("3. Open phpMyAdmin (http://localhost/phpmyadmin)")
print("4. Create a new database with these settings:")
print("   - Database name: construction_estimator")
print("   - Collation: utf8mb4_general_ci")
print("5. Click 'Create' button")
print("\n6. After creating the database, run:")
print("   python run.py")
print("\nThe server will automatically create tables and seed data.")
print("="*60)