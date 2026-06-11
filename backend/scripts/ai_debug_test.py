import requests, json
BASE='http://127.0.0.1:5000'
login={'email':'test@gmail.com','password':'password123'}
print('Logging in...')
r=requests.post(f'{BASE}/api/auth/login',json=login,timeout=10)
print('login status', r.status_code)
print(r.text[:1000])
if r.status_code!=200:
    raise SystemExit('Login failed')
token=r.json().get('access_token')
headers={'Authorization':f'Bearer {token}','Content-Type':'application/json'}
formData={
  'projectName':'Test House',
  'projectSize':5000,
  'location':'Karachi',
  'rooms':4,
  'roomLength':20,
  'roomWidth':20,
  'materialQuality':'Standard',
  'finishes':'Yes',
  'finishesQuality':'Premium',
  'floors':1,
  'ceilingHeight':'12'
}
print('\nCalling /api/estimate/calculate')
rc=requests.post(f'{BASE}/api/estimate/calculate',json=formData,headers=headers,timeout=30)
print('calculate status', rc.status_code)
try:
    print(json.dumps(rc.json(), indent=2)[:2000])
except Exception:
    print(rc.text[:2000])
    raise SystemExit('Calculate parse failed')
est = rc.json().get('estimate')
if not est:
    raise SystemExit('No estimate returned')
current_cost = est.get('total_cost') or est.get('total_estimated_cost') or 0
print('\nCalling /api/estimate/location-suggestions with currentCost=', current_cost)
payload={'projectData': formData, 'currentCost': current_cost}
rs=requests.post(f'{BASE}/api/estimate/location-suggestions',json=payload,headers=headers,timeout=120)
print('suggestions status', rs.status_code)
try:
    print(json.dumps(rs.json(), indent=2)[:4000])
except Exception:
    print(rs.text[:4000])
