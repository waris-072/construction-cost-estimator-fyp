from flask import Blueprint, jsonify, request
from app.pbs_prices import parse_pbs_prices

pbs_admin_bp = Blueprint('pbs_admin', __name__)

@pbs_admin_bp.route('/admin/pbs-rates', methods=['GET'])
def get_pbs_rates():
    city = request.args.get('city')
    prices = parse_pbs_prices()
    # If city is provided, filter by city
    if city:
        city = city.lower()
        filtered = [
            {'city': c, 'material': m, **data}
            for (c, m), data in prices.items() if c == city
        ]
        return jsonify({'success': True, 'rates': filtered})
    # Otherwise, return all
    all_rates = [
        {'city': c, 'material': m, **data}
        for (c, m), data in prices.items()
    ]
    return jsonify({'success': True, 'rates': all_rates})
