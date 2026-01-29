from flask import Blueprint, request, jsonify
from app import db
from app.database import Estimate, City, Material
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

estimate_bp = Blueprint('estimate', __name__)

QUALITY_FACTORS = {
    'standard': 1.0,
    'premium': 1.10,
    'luxury': 1.20
}

# ================= SIMPLE ENDPOINTS =================
@estimate_bp.route('/cities', methods=['GET'])
def get_cities():
    cities = City.query.all()
    cities_data = [c.to_dict() for c in cities]
    return jsonify({'success': True, 'cities': cities_data}), 200

# ================= ESTIMATION HISTORY =================
@estimate_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    try:
        user = get_jwt_identity()
        user_id = user.get('id') if isinstance(user, dict) else int(user)

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        pagination = Estimate.query.filter_by(user_id=user_id)\
            .order_by(Estimate.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)

        estimates = [e.to_dict() for e in pagination.items]

        return jsonify({
            'success': True,
            'estimates': estimates,
            'total': pagination.total,
            'pages': pagination.pages
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ================= CALCULATION ENDPOINT =================
@estimate_bp.route('/calculate', methods=['POST'])
@jwt_required()
def calculate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        user = get_jwt_identity()
        user_id = user.get('id') if isinstance(user, dict) else int(user)

        # -------- INPUTS --------
        area = float(data.get('projectSize', 0))
        location = data.get('location', 'Karachi')
        quality = data.get('materialQuality', 'standard').lower()
        floors = int(data.get('floors', 1))
        rooms = int(data.get('rooms', 0))
        ceiling_height = data.get('ceilingHeight', '10')
        includes_finishes = data.get('finishes', 'No') == 'Yes'
        finishes_quality = data.get('finishesQuality', 'standard').lower()
        project_name = data.get('projectName', 'Untitled Project')

        if area <= 0:
            return jsonify({'success': False, 'error': 'Invalid area'}), 400

        # -------- LABOR RATE --------
        city = City.query.filter_by(name=location).first()
        if not city:
            city = City.query.filter_by(name='Karachi').first()
        labor_rate = city.labor_rate_per_sqft
        labor_cost = area * labor_rate * floors

        # -------- MATERIAL QUANTITY TAKE-OFF --------
        effective_area = area * floors
        qf = QUALITY_FACTORS.get(quality, 1.0)

        # Fetch material rates from DB
        materials = Material.query.all()
        material_dict = {m.name.lower(): m for m in materials}

        # Get rates from DB
        cement_rate = getattr(material_dict.get('cement'), f"{quality}_rate", 0) or 0
        steel_rate = getattr(material_dict.get('steel bars'), f"{quality}_rate", 0) or 0
        bricks_rate = getattr(material_dict.get('bricks'), f"{quality}_rate", 0) or 0
        sand_rate = getattr(material_dict.get('sand'), f"{quality}_rate", 0) or 0
        crush_rate = getattr(material_dict.get('crush'), f"{quality}_rate", 0) or 0

        # Quantities
        cement_bags = effective_area * 0.40 * qf
        steel_kg = effective_area * 3.50 * qf
        bricks_qty = effective_area * 8
        sand_cft = effective_area * 1.20
        crush_cft = effective_area * 0.90

        # ---- NORMALIZE UNITS ----
        # Bricks: rate is per 1000 pcs
        bricks_cost = (bricks_qty / 1000) * bricks_rate
        # Sand & Crush: rate is per truck (~1000 cft per truck)
        sand_cost = (sand_cft / 1000) * sand_rate
        crush_cost = (crush_cft / 1000) * crush_rate

        cement_cost = cement_bags * cement_rate
        steel_cost = steel_kg * steel_rate

        material_cost = sum([cement_cost, steel_cost, bricks_cost, sand_cost, crush_cost])

        material_boq = [
            {'material': 'Cement', 'unit': 'bag', 'quantity': round(cement_bags), 'rate': round(cement_rate), 'total': round(cement_cost)},
            {'material': 'Steel', 'unit': 'kg', 'quantity': round(steel_kg), 'rate': round(steel_rate), 'total': round(steel_cost)},
            {'material': 'Bricks', 'unit': 'pcs', 'quantity': round(bricks_qty), 'rate': round(bricks_rate / 1000), 'total': round(bricks_cost)},
            {'material': 'Sand', 'unit': 'cft', 'quantity': round(sand_cft), 'rate': round(sand_rate / 1000), 'total': round(sand_cost)},
            {'material': 'Crush', 'unit': 'cft', 'quantity': round(crush_cft), 'rate': round(crush_rate / 1000), 'total': round(crush_cost)}
        ]

        # -------- EQUIPMENT --------
        equipment_cost = labor_cost * 0.18

        # -------- FINISHES --------
        finishes_cost = 0
        if includes_finishes:
            finishes_rates = {'standard': 450, 'premium': 750, 'luxury': 1300}
            finishes_cost = area * finishes_rates.get(finishes_quality, 450) * floors

        # -------- OTHER COSTS --------
        room_cost = rooms * 60000
        sub_total = material_cost + labor_cost + equipment_cost + finishes_cost
        other_costs = sub_total * 0.12

        # -------- CEILING HEIGHT --------
        ceiling_multiplier = {'10': 1.0, '12': 1.12, '14': 1.25}.get(ceiling_height, 1.0)

        total_cost = round((sub_total + other_costs) * ceiling_multiplier + room_cost)

        # -------- SAVE TO DB --------
        estimate = Estimate(
            user_id=user_id,
            project_name=project_name,
            total_area=area,
            location=location,
            num_rooms=rooms,
            ceiling_height=ceiling_height,
            material_quality=quality.capitalize(),
            includes_finishes=includes_finishes,
            finishes_quality=finishes_quality.capitalize(),
            num_floors=floors,
            material_cost=round(material_cost),
            labor_cost=round(labor_cost),
            equipment_cost=round(equipment_cost),
            finishes_cost=round(finishes_cost),
            other_costs=round(other_costs),
            total_cost=total_cost
        )
        db.session.add(estimate)
        db.session.commit()

        return jsonify({
            'success': True,
            'estimate': {
                'material_cost': round(material_cost),
                'labor_cost': round(labor_cost),
                'equipment_cost': round(equipment_cost),
                'finishes_cost': round(finishes_cost),
                'other_costs': round(other_costs),
                'total_cost': total_cost,
                'estimated_duration_days': max(45, round((area / 1000) * 45 * floors)),
                'material_boq': material_boq,
                'accuracy_level': '±7–9% (material take-off based)',
                'estimate_id': estimate.id
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ================= TEST =================
@estimate_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'success': True, 'message': 'Estimate API running'}), 200
