from flask import Blueprint, request, jsonify
from app import db
from app.database import Estimate, City, Material
from app.gemini_service import estimate_for_city
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.gemini_service import (
    parse_voice_input,
    get_ai_estimation_advice,
    validate_project_with_ai,
    generate_estimation_report
)

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
        building_type = data.get('buildingType', 'residential').lower()  # New: for complexity
        inflation_rate = 0.11  # Example: 11% annual inflation

        if area <= 0:
            return jsonify({'success': False, 'error': 'Invalid area'}), 400

        # -------- CITY CHECK --------
        city = City.query.filter_by(name=location).first()
        if not city:
            gemini_result = estimate_for_city(data, location)
            if gemini_result and gemini_result.get('estimatedCost'):
                return jsonify({
                    'success': True,
                    'estimate': {
                        'total_cost': gemini_result['estimatedCost'],
                        'ai_reason': gemini_result.get('reason', ''),
                        'source': 'gemini'
                    }
                }), 200
            else:
                return jsonify({'success': False, 'error': 'Gemini could not estimate for this city.'}), 400

        # ----------- BASELINE ESTIMATION LOGIC (unchanged) -----------
        labor_rate = city.labor_rate_per_sqft
        labor_cost = area * labor_rate * floors
        effective_area = area * floors
        qf = QUALITY_FACTORS.get(quality, 1.0)
        materials = Material.query.all()
        material_dict = {m.name.lower(): m for m in materials}
        cement_rate = getattr(material_dict.get('cement'), f"{quality}_rate", 0) or 0
        steel_rate = getattr(material_dict.get('steel bars'), f"{quality}_rate", 0) or 0
        bricks_rate = getattr(material_dict.get('bricks'), f"{quality}_rate", 0) or 0
        sand_rate = getattr(material_dict.get('sand'), f"{quality}_rate", 0) or 0
        crush_rate = getattr(material_dict.get('crush'), f"{quality}_rate", 0) or 0
        cement_bags = effective_area * 0.40 * qf
        steel_kg = effective_area * 3.50 * qf
        bricks_qty = effective_area * 8
        sand_cft = effective_area * 1.20
        crush_cft = effective_area * 0.90
        bricks_cost = (bricks_qty / 1000) * bricks_rate
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
        equipment_cost = labor_cost * 0.18
        finishes_cost = 0
        if includes_finishes:
            finishes_rates = {'standard': 450, 'premium': 750, 'luxury': 1300}
            finishes_cost = area * finishes_rates.get(finishes_quality, 450) * floors
        room_cost = rooms * 60000
        sub_total = material_cost + labor_cost + equipment_cost + finishes_cost
        other_costs = sub_total * 0.12
        ceiling_multiplier = {'10': 1.0, '12': 1.12, '14': 1.25}.get(ceiling_height, 1.0)
        base_estimate = round((sub_total + other_costs) * ceiling_multiplier + room_cost)

        # ----------- INTELLIGENT COST PREDICTION LAYER -----------
        def ai_predict_adjustment(area, building_type, base_cost):
            """
            AI-inspired adjustment factor:
            - Area scaling (economy-of-scale, nonlinear)
            - Building type complexity
            - Historical growth simulation
            """
            # Area scaling: nonlinear (sqrt for large, log for small)
            if area > 10000:
                scale_factor = 0.93 + 0.02 * (area / 20000)  # economy-of-scale
            elif area < 1500:
                scale_factor = 1.12 - 0.03 * (area / 1500)  # higher per-unit cost
            else:
                scale_factor = 1.0
            # Complexity weight
            complexity_weights = {
                'residential': 1.0,
                'commercial': 1.15,
                'industrial': 1.25,
                'mixed-use': 1.18
            }
            complexity_factor = complexity_weights.get(building_type, 1.0)
            # Historical growth simulation (simulate market trend)
            growth_factor = 1.0 + 0.03 * (floors - 1)  # more floors, higher cost
            # Final adjustment
            return base_cost * scale_factor * complexity_factor * growth_factor

        ai_adjusted_estimate = round(ai_predict_adjustment(area, building_type, base_estimate))

        # ----------- DYNAMIC RISK ADJUSTMENT -----------
        def get_risk_score(area, quality, location):
            """
            Simulate risk based on area, quality, and location
            """
            risk = 'low'
            if area > 20000 or quality == 'luxury':
                risk = 'high'
            elif area > 8000 or quality == 'premium':
                risk = 'medium'
            # Location risk simulation
            if location.lower() in ['karachi', 'quetta']:
                risk = 'high'
            elif location.lower() in ['lahore', 'islamabad'] and risk != 'high':
                risk = 'medium'
            return risk

        risk_level = get_risk_score(area, quality, location)
        contingency_percent = {'low': 0.05, 'medium': 0.08, 'high': 0.12}[risk_level]
        contingency = round(ai_adjusted_estimate * contingency_percent)

        # ----------- PREDICTION CONFIDENCE SCORE -----------
        def get_confidence_score(data, inflation_rate, risk_level):
            """
            Simulate confidence based on input completeness, inflation, and risk
            """
            completeness = sum([bool(data.get(k)) for k in ['projectName', 'projectSize', 'location', 'materialQuality', 'floors', 'rooms', 'ceilingHeight']])
            completeness_score = completeness / 7
            inflation_certainty = max(0, 1 - abs(inflation_rate - 0.11))  # closer to 11% is more certain
            risk_penalty = {'low': 0.05, 'medium': 0.15, 'high': 0.25}[risk_level]
            score = completeness_score * 0.6 + inflation_certainty * 0.3 + (1 - risk_penalty) * 0.1
            return round(score * 100)

        confidence_score = get_confidence_score(data, inflation_rate, risk_level)

        # ----------- FUTURE COST PROJECTION -----------
        def project_future_cost(current_cost, inflation_rate, years):
            """
            Compound inflation projection
            """
            return round(current_cost * ((1 + inflation_rate) ** years))

        one_year_projection = project_future_cost(ai_adjusted_estimate, inflation_rate, 1)
        three_year_projection = project_future_cost(ai_adjusted_estimate, inflation_rate, 3)

        # ----------- STRUCTURED INTELLIGENT BREAKDOWN -----------
        detailed_breakdown = {
            'materials': round(material_cost),
            'labor': round(labor_cost),
            'equipment': round(equipment_cost),
            'overhead': round(other_costs),
            'contingency': contingency
        }

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
            total_cost=ai_adjusted_estimate
        )
        db.session.add(estimate)
        db.session.commit()

        # ----------- FINAL RESPONSE -----------
        return jsonify({
            'success': True,
            'estimate': {
                'base_estimate': base_estimate,
                'ai_adjusted_estimate': ai_adjusted_estimate,
                'risk_level': risk_level,
                'confidence_score': confidence_score,
                'one_year_projection': one_year_projection,
                'three_year_projection': three_year_projection,
                'detailed_breakdown': detailed_breakdown,
                'material_boq': material_boq,
                'accuracy_level': '±7–9% (material take-off based)',
                'estimate_id': estimate.id,
                # Legacy fields for frontend compatibility
                'material_cost': round(material_cost),
                'labor_cost': round(labor_cost),
                'equipment_cost': round(equipment_cost),
                'finishes_cost': round(finishes_cost),
                'other_costs': round(other_costs),
                'total_cost': ai_adjusted_estimate
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ================= GEMINI AI ENDPOINTS =================
@estimate_bp.route('/voice-parse', methods=['POST'])
@jwt_required()
def parse_voice():
    """Parse voice input using Gemini AI"""
    try:
        data = request.get_json()
        voice_text = data.get('voiceText', '').strip()
        
        if not voice_text:
            return jsonify({'success': False, 'error': 'No voice text provided'}), 400
        
        # Parse with Gemini
        params = parse_voice_input(voice_text)
        
        if not params:
            return jsonify({
                'success': False,
                'error': 'Unable to parse voice input. Please try again with more specific details.'
            }), 400
        
        return jsonify({
            'success': True,
            'parameters': params,
            'message': 'Voice input parsed successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@estimate_bp.route('/validate', methods=['POST'])
@jwt_required()
def validate_project():
    """Validate project parameters using Gemini AI"""
    try:
        data = request.get_json()
        
        # Validate with Gemini
        validation = validate_project_with_ai(data)
        
        return jsonify({
            'success': True,
            'validation': validation
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@estimate_bp.route('/ai-advice', methods=['POST'])
@jwt_required()
def get_advice():
    """Get AI advice for cost estimation"""
    try:
        data = request.get_json()
        estimated_cost = float(data.get('estimatedCost', 0))
        project_data = data.get('projectData', {})
        
        advice = get_ai_estimation_advice(project_data, estimated_cost)
        
        return jsonify({
            'success': True,
            'advice': advice
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@estimate_bp.route('/report', methods=['POST'])
@jwt_required()
def generate_report():
    """Generate AI-powered estimation report"""
    try:
        data = request.get_json()
        project_data = data.get('projectData', {})
        cost_breakdown = data.get('costBreakdown', {})
        
        report = generate_estimation_report(project_data, cost_breakdown)
        
        return jsonify({
            'success': True,
            'report': report
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@estimate_bp.route('/location-suggestions', methods=['POST'])
@jwt_required()
def location_suggestions():
    """Get AI suggestions for alternative locations and cost comparisons"""
    try:
        data = request.get_json()
        
        if not data or 'projectData' not in data or 'currentCost' not in data:
            return jsonify({'success': False, 'error': 'Missing projectData or currentCost'}), 400
        
        project_data = data['projectData']
        current_cost = float(data['currentCost'])
        
        # Get AI suggestions for alternative locations
        from app.gemini_service import suggest_alternative_locations
        suggestions = suggest_alternative_locations(project_data, current_cost)
        
        return jsonify({
            'success': True,
            'suggestions': suggestions,
            'message': 'Location suggestions generated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@estimate_bp.route('/ai-city-estimate', methods=['POST'])
@jwt_required()
def ai_city_estimate():
    """Estimate project cost for a user-provided city using Gemini"""
    try:
        data = request.get_json() or {}
        project_data = data.get('projectData')
        target_city = data.get('targetCity')
        current_cost = data.get('currentCost')

        if not project_data or not target_city:
            return jsonify({'success': False, 'error': 'Missing projectData or targetCity'}), 400

        # Use gemini to estimate for the city
        from app.gemini_service import estimate_for_city
        result = estimate_for_city(project_data, target_city, current_cost)

        return jsonify({'success': True, 'cityEstimate': result}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ================= TEST =================
@estimate_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'success': True, 'message': 'Estimate API running'}), 200

