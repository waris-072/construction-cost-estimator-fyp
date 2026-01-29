from flask import Blueprint, request, jsonify
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import Material, City, User, Estimate
from datetime import datetime
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to require admin role"""
    from functools import wraps
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        try:
            current_user_id = get_jwt_identity()
            
            # Handle both string and dict formats
            if isinstance(current_user_id, dict):
                user_id = current_user_id.get('id')
                if user_id is None:
                    return jsonify({'success': False, 'error': 'Invalid token format'}), 401
            else:
                try:
                    user_id = int(current_user_id)
                except (ValueError, TypeError):
                    return jsonify({'success': False, 'error': 'Invalid token format'}), 401
            
            user = User.query.get(user_id)
            
            if not user or user.role != 'admin':
                return jsonify({'success': False, 'error': 'Admin access required'}), 403
            return f(*args, **kwargs)
        except Exception as e:
            print(f"Admin required error: {e}")
            return jsonify({'success': False, 'error': str(e)}), 500
    return decorated_function

# ========== DASHBOARD ==========
@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_dashboard():
    """Get admin dashboard statistics"""
    try:
        # Count statistics
        total_users = User.query.count()
        total_estimates = Estimate.query.count()
        total_materials = Material.query.count()
        
        # Total cost sum
        total_cost_result = db.session.query(func.sum(Estimate.total_cost)).scalar() or 0
        
        # Recent estimates (last 5 with user info)
        recent_estimates = Estimate.query\
            .order_by(Estimate.created_at.desc())\
            .limit(5)\
            .all()
        
        # Format recent estimates with user info
        recent_estimates_data = []
        for estimate in recent_estimates:
            user = User.query.get(estimate.user_id)
            estimate_data = estimate.to_dict()
            estimate_data['user'] = user.to_dict() if user else None
            recent_estimates_data.append(estimate_data)
        
        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'total_estimates': total_estimates,
                'total_materials': total_materials,
                'total_cost_sum': float(total_cost_result),
                'recent_estimates': recent_estimates_data
            }
        }), 200
        
    except Exception as e:
        print(f"Dashboard error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ========== MATERIALS MANAGEMENT ==========
@admin_bp.route('/materials', methods=['GET'])
@admin_required
def get_all_materials():
    """Get all materials (admin view)"""
    try:
        materials = Material.query.order_by(Material.category, Material.name).all()
        return jsonify({
            'success': True,
            'materials': [material.to_dict() for material in materials]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/materials/<int:material_id>', methods=['PUT'])
@admin_required
def update_material(material_id):
    """Update material prices"""
    try:
        data = request.get_json()
        material = Material.query.get(material_id)
        
        if not material:
            return jsonify({'success': False, 'error': 'Material not found'}), 404
        
        # Update fields
        if 'standard_rate' in data:
            material.standard_rate = float(data['standard_rate'])
        if 'premium_rate' in data:
            material.premium_rate = float(data['premium_rate'])
        if 'luxury_rate' in data:
            material.luxury_rate = float(data['luxury_rate'])
        
        # Update other fields if provided
        if 'name' in data:
            material.name = data['name']
        if 'category' in data:
            material.category = data['category']
        if 'unit' in data:
            material.unit = data['unit']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Material updated successfully',
            'material': material.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/materials', methods=['POST'])
@admin_required
def create_material():
    """Create new material"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'category', 'unit', 'standard_rate']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'success': False, 
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Create new material
        material = Material(
            name=data['name'],
            category=data['category'],
            unit=data['unit'],
            standard_rate=float(data['standard_rate']),
            premium_rate=float(data.get('premium_rate', data['standard_rate'])),
            luxury_rate=float(data.get('luxury_rate', data['standard_rate']))
        )
        
        db.session.add(material)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Material created successfully',
            'material': material.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/materials/<int:material_id>', methods=['DELETE'])
@admin_required
def delete_material(material_id):
    """Delete material"""
    try:
        material = Material.query.get(material_id)
        
        if not material:
            return jsonify({'success': False, 'error': 'Material not found'}), 404
        
        db.session.delete(material)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Material deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ========== CITIES MANAGEMENT ==========
@admin_bp.route('/cities', methods=['GET'])
@admin_required
def get_all_cities():
    """Get all cities (admin view)"""
    try:
        cities = City.query.order_by(City.name).all()
        return jsonify({
            'success': True,
            'cities': [city.to_dict() for city in cities]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/cities/<int:city_id>', methods=['PUT'])
@admin_required
def update_city(city_id):
    """Update city rates"""
    try:
        data = request.get_json()
        city = City.query.get(city_id)
        
        if not city:
            return jsonify({'success': False, 'error': 'City not found'}), 404
        
        # Update fields
        if 'labor_rate_per_sqft' in data:
            city.labor_rate_per_sqft = float(data['labor_rate_per_sqft'])
        if 'material_base_rate' in data:
            city.material_base_rate = float(data['material_base_rate'])
        if 'equipment_rate' in data:
            city.equipment_rate = float(data['equipment_rate'])
        
        # Update other fields if provided
        if 'name' in data:
            city.name = data['name']
        if 'code' in data:
            city.code = data['code']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'City rates updated successfully',
            'city': city.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/cities', methods=['POST'])
@admin_required
def create_city():
    """Create new city"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'code', 'labor_rate_per_sqft', 'material_base_rate', 'equipment_rate']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'success': False, 
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Create new city
        city = City(
            name=data['name'],
            code=data['code'],
            labor_rate_per_sqft=float(data['labor_rate_per_sqft']),
            material_base_rate=float(data['material_base_rate']),
            equipment_rate=float(data['equipment_rate'])
        )
        
        db.session.add(city)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'City created successfully',
            'city': city.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/cities/<int:city_id>', methods=['DELETE'])
@admin_required
def delete_city(city_id):
    """Delete city"""
    try:
        city = City.query.get(city_id)
        
        if not city:
            return jsonify({'success': False, 'error': 'City not found'}), 404
        
        db.session.delete(city)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'City deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ========== ESTIMATES MANAGEMENT ==========
@admin_bp.route('/estimates', methods=['GET'])
@admin_required
def get_all_estimates():
    """Get all estimates (admin view)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Query with pagination
        query = Estimate.query.order_by(Estimate.created_at.desc())
        total = query.count()
        
        # Apply pagination
        estimates = query.offset((page - 1) * per_page).limit(per_page).all()
        
        # Get user info for each estimate
        estimates_data = []
        for estimate in estimates:
            user = User.query.get(estimate.user_id)
            estimate_data = estimate.to_dict()
            estimate_data['user'] = user.to_dict() if user else None
            estimates_data.append(estimate_data)
        
        return jsonify({
            'success': True,
            'estimates': estimates_data,
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        print(f"Get estimates error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/estimates/<int:estimate_id>', methods=['GET'])
@admin_required
def get_estimate_details(estimate_id):
    """Get specific estimate details"""
    try:
        estimate = Estimate.query.get(estimate_id)
        if not estimate:
            return jsonify({'success': False, 'error': 'Estimate not found'}), 404
        
        user = User.query.get(estimate.user_id)
        estimate_data = estimate.to_dict()
        estimate_data['user'] = user.to_dict() if user else None
            
        return jsonify({
            'success': True,
            'estimate': estimate_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/estimates/<int:estimate_id>', methods=['DELETE'])
@admin_required
def delete_estimate_admin(estimate_id):
    """Delete estimate (admin)"""
    try:
        estimate = Estimate.query.get(estimate_id)
        if not estimate:
            return jsonify({'success': False, 'error': 'Estimate not found'}), 404
        
        db.session.delete(estimate)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Estimate deleted successfully',
            'deleted_id': estimate_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ========== USER MANAGEMENT ==========
@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Query with pagination
        query = User.query.order_by(User.created_at.desc())
        total = query.count()
        
        # Apply pagination
        users = query.offset((page - 1) * per_page).limit(per_page).all()
        
        users_data = []
        for user in users:
            user_data = user.to_dict()
            # Add estimate count
            user_data['estimate_count'] = Estimate.query.filter_by(user_id=user.id).count()
            users_data.append(user_data)
        
        return jsonify({
            'success': True,
            'users': users_data,
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    """Get specific user details"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        user_data = user.to_dict()
        # Add estimate count
        user_data['estimate_count'] = Estimate.query.filter_by(user_id=user.id).count()
        
        return jsonify({
            'success': True,
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user details"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        # Get current user ID from JWT
        if isinstance(current_user_id, dict):
            current_user_id = current_user_id.get('id')
        current_user_id = int(current_user_id)
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Don't allow modifying self
        if current_user_id == user.id:
            return jsonify({'success': False, 'error': 'Cannot modify your own account'}), 400
        
        # Update fields
        if 'is_active' in data:
            user.is_active = bool(data['is_active'])
        
        if 'role' in data and data['role'] in ['user', 'admin']:
            # Don't allow demoting the only admin
            if data['role'] == 'user' and user.role == 'admin':
                admin_count = User.query.filter_by(role='admin').count()
                if admin_count <= 1:
                    return jsonify({
                        'success': False, 
                        'error': 'Cannot remove the only admin'
                    }), 400
            user.role = data['role']
        
        if 'name' in data:
            user.name = data['name']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete user"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get current user ID from JWT
        if isinstance(current_user_id, dict):
            current_user_id = current_user_id.get('id')
        current_user_id = int(current_user_id)
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Don't allow deleting self
        if current_user_id == user.id:
            return jsonify({'success': False, 'error': 'Cannot delete your own account'}), 400
        
        # Don't allow deleting other admins
        if user.role == 'admin':
            return jsonify({'success': False, 'error': 'Cannot delete admin users'}), 400
        
        # Delete user's estimates first
        Estimate.query.filter_by(user_id=user_id).delete()
        
        # Delete the user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ========== SYSTEM STATS ==========
@admin_bp.route('/system/stats', methods=['GET'])
@admin_required
def get_system_stats():
    """Get system statistics"""
    try:
        # Basic counts
        stats = {
            'total_users': User.query.count(),
            'active_users': User.query.filter_by(is_active=True).count(),
            'total_estimates': Estimate.query.count(),
            'today_estimates': Estimate.query.filter(
                func.date(Estimate.created_at) == func.current_date()
            ).count(),
            'total_materials': Material.query.count(),
            'total_cities': City.query.count(),
            'total_cost': float(db.session.query(func.sum(Estimate.total_cost)).scalar() or 0),
            'avg_cost': float(db.session.query(func.avg(Estimate.total_cost)).scalar() or 0),
            'server_time': datetime.utcnow().isoformat()
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ========== TEST ENDPOINT ==========
@admin_bp.route('/test', methods=['GET'])
@admin_required
def test_admin():
    """Test admin endpoint"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        return jsonify({
            'success': True,
            'message': 'Admin API is working!',
            'user': user.to_dict() if user else None,
            'is_admin': True
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500