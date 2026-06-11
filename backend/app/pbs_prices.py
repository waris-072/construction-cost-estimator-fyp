import os
import pandas as pd
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "pbs_data")
EXCEL_PATH = os.path.join(DATA_DIR, "pbs_latest.xlsx")

# Parse PBS Excel and return a dict: { (city, material): {unit, rate, date} }
def parse_pbs_prices():
    if not os.path.exists(EXCEL_PATH):
        return {}
    df = pd.read_excel(EXCEL_PATH, sheet_name=0, engine='openpyxl')
    df.columns = [str(c).strip() for c in df.columns]
    # Try to auto-detect columns
    def find_col(possibles):
        for col in df.columns:
            if any(p.lower() == col.lower() for p in possibles):
                return col
        return None
    city_col = find_col(['City', 'city', 'city_name', 'Urban Centre', 'Rural Centre'])
    material_col = find_col(['Item', 'item', 'Material', 'material'])
    unit_col = find_col(['Unit', 'unit', 'UOM', 'uom'])
    price_col = find_col(['Price', 'price', 'Rate', 'rate', 'Value'])
    date_col = find_col(['Month', 'month', 'Date', 'date', 'Period'])
    prices = {}
    for _, row in df.iterrows():
        city = str(row.get(city_col, '')).strip() if city_col else ''
        material = str(row.get(material_col, '')).strip() if material_col else ''
        unit = str(row.get(unit_col, '')).strip() if unit_col else ''
        rate = row.get(price_col) if price_col else None
        date = row.get(date_col) if date_col else str(datetime.now().date())
        if city and material and rate:
            prices[(city.lower(), material.lower())] = {
                'unit': unit,
                'rate': float(rate),
                'date': date
            }
    return prices

def get_pbs_rate(city, material):
    prices = parse_pbs_prices()
    key = (city.lower(), material.lower())
    return prices.get(key)
