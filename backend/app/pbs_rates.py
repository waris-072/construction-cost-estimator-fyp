import os
import requests
import pandas as pd
from datetime import datetime

PBS_URL = "https://www.pbs.gov.pk/sites/default/files//price_statistics/monthly_prices_building_materials.xlsx"
DATA_DIR = os.path.join(os.path.dirname(__file__), "pbs_data")
EXCEL_PATH = os.path.join(DATA_DIR, "monthly_prices_building_materials.xlsx")


def download_latest_pbs_excel():
    os.makedirs(DATA_DIR, exist_ok=True)
    response = requests.get(PBS_URL)
    if response.status_code == 200:
        with open(EXCEL_PATH, "wb") as f:
            f.write(response.content)
        return EXCEL_PATH
    else:
        raise Exception(f"Failed to download PBS Excel file: {response.status_code}")


def parse_pbs_rates(city=None):
    if not os.path.exists(EXCEL_PATH):
        download_latest_pbs_excel()
    df = pd.read_excel(EXCEL_PATH, sheet_name=0, engine='openpyxl')
    # Clean up columns
    df.columns = [str(c).strip() for c in df.columns]
    # Filter by city if provided
    if city:
        city = city.strip().lower()
        df = df[df['City'].str.lower() == city]
    # Return as list of dicts
    return df.to_dict(orient="records")


def get_material_rate(city, material):
    records = parse_pbs_rates(city)
    material = material.strip().lower()
    for rec in records:
        if rec.get('Item', '').strip().lower() == material:
            return {
                "city": rec.get('City'),
                "material": rec.get('Item'),
                "unit": rec.get('Unit'),
                "rate": rec.get('Price'),
                "date": rec.get('Month') or str(datetime.now().date())
            }
    return None

if __name__ == "__main__":
    # Example usage
    print(get_material_rate("Lahore", "Cement"))
    print(parse_pbs_rates("Karachi"))
