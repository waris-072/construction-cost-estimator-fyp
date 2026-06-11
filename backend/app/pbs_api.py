import os
from flask import Blueprint, request, jsonify
from app.pbs_rates import parse_pbs_rates

pbs_bp = Blueprint('pbs', __name__)

@pbs_bp.route('/pbs-rates', methods=['GET'])
def get_pbs_rates():
    city = request.args.get('city')
    try:
        rates = parse_pbs_rates(city)
        return jsonify({'success': True, 'rates': rates}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
