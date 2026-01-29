#!/usr/bin/env python3
"""
Run the Pakistani Construction Cost Estimator - MySQL Version
"""
import os
import sys

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app import create_app

app = create_app()

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🏗️  PAKISTANI CONSTRUCTION COST ESTIMATOR - 2024")
    print("="*60)
    print("\n📊 Database: MySQL (XAMPP)")
    print("💡 Make sure XAMPP MySQL is running on port 3306!")
    print("\n📋 API Endpoints:")
    print("  🔐 Authentication:")
    print("    POST   /api/auth/register      - Register new user")
    print("    POST   /api/auth/login         - Login user")
    print("    GET    /api/auth/profile       - Get current user")
    print("    POST   /api/auth/refresh       - Refresh token")
    print("    POST   /api/auth/logout        - Logout user")
    print("  📈 Estimation:")
    print("    POST   /api/estimate/calculate - Calculate cost")
    print("    GET    /api/estimate/history   - Get estimation history")
    print("    GET    /api/estimate/cities    - Get all cities")
    print("    GET    /api/estimate/materials - Get all materials (2024 prices)")
    print("  👑 Admin:")
    print("    GET    /api/admin/dashboard    - Admin dashboard")
    print("    GET    /api/admin/materials    - Manage materials")
    print("    PUT    /api/admin/materials/:id- Update material")
    print("    GET    /api/admin/cities       - Manage city rates")
    print("    PUT    /api/admin/cities/:id   - Update city")
    print("    GET    /api/admin/estimates    - All estimates")
    print("    GET    /api/admin/users        - User management")
    print("\n🌍 Server running on: http://localhost:5000")
    print("🔐 Test credentials:")
    print("  • Admin: admin@example.com / admin123")
    print("  • User:  test@gmail.com / password123")
    print("\n📱 Frontend: http://localhost:3000")
    print("="*60 + "\n")
    
    # Get port from environment or use default 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app
    try:
        app.run(
            debug=True, 
            host='0.0.0.0', 
            port=port,
            threaded=True,
            use_reloader=True
        )
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure XAMPP MySQL is running")
        print("2. Check if port 5000 is not in use")
        print("3. Try: netstat -ano | findstr :5000")
        print("4. Kill process: taskkill /PID <PID> /F")