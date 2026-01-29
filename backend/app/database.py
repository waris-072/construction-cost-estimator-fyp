from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationship
    estimates = db.relationship('Estimate', backref='estimator', lazy=True, cascade='all, delete-orphan')
    
    def __init__(self, name, email, role='user'):
        self.name = name
        self.email = email
        self.role = role
        self.is_active = True
    
    def set_password(self, password):
        from app import bcrypt
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        from app import bcrypt
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class City(db.Model):
    __tablename__ = 'cities'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    code = db.Column(db.String(10), unique=True, nullable=False)
    labor_rate_per_sqft = db.Column(db.Float, default=0)
    material_base_rate = db.Column(db.Float, default=0)
    equipment_rate = db.Column(db.Float, default=0)
    # REMOVED: created_at and updated_at to simplify
    # They were causing the error
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'labor_rate_per_sqft': float(self.labor_rate_per_sqft),
            'material_base_rate': float(self.material_base_rate),
            'equipment_rate': float(self.equipment_rate)
        }

class Material(db.Model):
    __tablename__ = 'materials'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    category = db.Column(db.String(50), nullable=False)
    unit = db.Column(db.String(20), nullable=False)
    standard_rate = db.Column(db.Float, default=0)
    premium_rate = db.Column(db.Float, default=0)
    luxury_rate = db.Column(db.Float, default=0)
    # REMOVED: created_at and last_updated to simplify
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'unit': self.unit,
            'standard_rate': float(self.standard_rate),
            'premium_rate': float(self.premium_rate),
            'luxury_rate': float(self.luxury_rate)
        }

class Estimate(db.Model):
    __tablename__ = 'estimates'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    project_name = db.Column(db.String(200), nullable=False, index=True)
    total_area = db.Column(db.Float, nullable=False)
    location = db.Column(db.String(100), nullable=False, index=True)
    num_rooms = db.Column(db.Integer, nullable=False)
    room_length = db.Column(db.Float, default=0)
    room_width = db.Column(db.Float, default=0)
    ceiling_height = db.Column(db.String(20), default='10')
    material_quality = db.Column(db.String(20), default='Standard')
    includes_finishes = db.Column(db.Boolean, default=False)
    finishes_quality = db.Column(db.String(20), default='Standard')
    num_floors = db.Column(db.Integer, default=1)
    material_cost = db.Column(db.Float, default=0)
    labor_cost = db.Column(db.Float, default=0)
    equipment_cost = db.Column(db.Float, default=0)
    finishes_cost = db.Column(db.Float, default=0)
    other_costs = db.Column(db.Float, default=0)
    total_cost = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_name': self.project_name,
            'total_area': float(self.total_area),
            'location': self.location,
            'num_rooms': self.num_rooms,
            'room_length': float(self.room_length) if self.room_length else 0,
            'room_width': float(self.room_width) if self.room_width else 0,
            'ceiling_height': self.ceiling_height,
            'material_quality': self.material_quality,
            'includes_finishes': self.includes_finishes,
            'finishes_quality': self.finishes_quality,
            'num_floors': self.num_floors,
            'material_cost': float(self.material_cost),
            'labor_cost': float(self.labor_cost),
            'equipment_cost': float(self.equipment_cost),
            'finishes_cost': float(self.finishes_cost),
            'other_costs': float(self.other_costs),
            'total_cost': float(self.total_cost),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user_id': self.user_id
        }