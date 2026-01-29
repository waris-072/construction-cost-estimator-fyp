from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

# Create extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    
    # ========== CONFIGURATION ==========
    # Load from .env file first
    from dotenv import load_dotenv
    load_dotenv()
    
    # Direct configuration (simpler approach)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'construction-estimator-secret-2024')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-construction-2024')
    
    # MySQL Database Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL', 
        'mysql+pymysql://root:@localhost/construction_estimator'
    )
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_recycle': 3600,
        'pool_pre_ping': True,
    }
    
    # JWT Configuration
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours in seconds
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 2592000  # 30 days in seconds
    
    # Ensure upload folder exists
    upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = upload_folder
    # ========== END CONFIGURATION ==========
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # Configure CORS
    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
    
    # Import and register blueprints
    from app.auth import auth_bp
    from app.estimate import estimate_bp
    from app.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(estimate_bp, url_prefix='/api/estimate')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Create database tables
    with app.app_context():
        create_tables()
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

def create_tables():
    """Create database tables and seed initial data"""
    try:
        # Import models inside function to avoid circular imports
        from app.database import City, Material, User, Estimate
        
        # Create all tables
        db.create_all()
        print("✅ Database tables created successfully!")
        
        # Seed initial data
        seed_initial_data()
        
    except Exception as e:
        print(f"⚠️  Error creating tables: {str(e)}")
        print("This is normal if the database doesn't exist yet.")
        print("\n🔧 Please create the database manually:")
        print("1. Open XAMPP Control Panel")
        print("2. Start MySQL service")
        print("3. Open phpMyAdmin: http://localhost/phpmyadmin")
        print("4. Create database: 'construction_estimator'")
        print("5. Collation: utf8mb4_general_ci")
        print("\nThen restart the server.")
        return False
    return True

def seed_initial_data():
    """Seed database with initial data - 2024 prices"""
    from app.database import City, Material, User
    
    try:
        # Check if database is empty
        # Seed cities if empty
        if City.query.count() == 0:
            cities = [
                City(name='Karachi', code='KHI', labor_rate_per_sqft=550, material_base_rate=1800, equipment_rate=250),
                City(name='Hyderabad', code='HYD', labor_rate_per_sqft=450, material_base_rate=1500, equipment_rate=200),
                City(name='Sukkur', code='SKR', labor_rate_per_sqft=400, material_base_rate=1300, equipment_rate=180),
            ]
            for city in cities:
                db.session.add(city)
            print("✅ Cities added with 2024 prices")
        else:
            print("✅ Cities already exist in database")
        
        # Seed materials if empty
        if Material.query.count() == 0:
            materials = [
                Material(name='Cement', category='cement', unit='bag', standard_rate=1250, premium_rate=1400, luxury_rate=1600),
                Material(name='Bricks', category='brick', unit='1000 pcs', standard_rate=14000, premium_rate=18000, luxury_rate=22000),
                Material(name='Steel Bars', category='steel', unit='kg', standard_rate=280, premium_rate=350, luxury_rate=450),
                Material(name='Sand', category='sand', unit='truck', standard_rate=30000, premium_rate=35000, luxury_rate=40000),
                Material(name='Crush', category='crush', unit='truck', standard_rate=35000, premium_rate=40000, luxury_rate=45000),
                Material(name='Tiles', category='tiles', unit='sq. ft.', standard_rate=180, premium_rate=400, luxury_rate=800),
                Material(name='Paint', category='paint', unit='liter', standard_rate=800, premium_rate=1200, luxury_rate=2000),
            ]
            for material in materials:
                db.session.add(material)
            print("✅ Materials added with 2024 prices")
        else:
            print("✅ Materials already exist in database")
        
        # Create admin user if not exists
        if not User.query.filter_by(email='admin@example.com').first():
            admin = User(
                name='Administrator',
                email='admin@example.com',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            print("✅ Admin user created")
        else:
            print("✅ Admin user already exists")
        
        # Create test user if not exists
        if not User.query.filter_by(email='test@gmail.com').first():
            user = User(
                name='Test User',
                email='test@gmail.com',
                role='user'
            )
            user.set_password('password123')
            db.session.add(user)
            print("✅ Test user created")
        else:
            print("✅ Test user already exists")
        
        db.session.commit()
        print("✅ Database seeding completed successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"⚠️  Error seeding database: {str(e)}")
        print("⚠️  Some data may not have been saved")