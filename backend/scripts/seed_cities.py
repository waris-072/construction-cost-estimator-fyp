# backend/scripts/seed_cities.py
from app import db
from app.database import City

def seed_cities():
    cities = [
        City(name='Karachi', code='KHI', labor_rate_per_sqft=50, material_base_rate=100, equipment_rate=20),
        City(name='Lahore', code='LHR', labor_rate_per_sqft=48, material_base_rate=98, equipment_rate=18),
        City(name='Islamabad', code='ISB', labor_rate_per_sqft=55, material_base_rate=110, equipment_rate=25),
        City(name='Peshawar', code='PEW', labor_rate_per_sqft=45, material_base_rate=95, equipment_rate=15),
        City(name='Quetta', code='UET', labor_rate_per_sqft=42, material_base_rate=92, equipment_rate=14),
    ]
    for city in cities:
        exists = City.query.filter_by(name=city.name).first()
        if not exists:
            db.session.add(city)
    db.session.commit()
    print('Seeded cities successfully.')

if __name__ == '__main__':
    seed_cities()
