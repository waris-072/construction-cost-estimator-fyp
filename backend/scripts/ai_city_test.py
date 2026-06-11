import requests, json
BASE='http://127.0.0.1:5000'
login={'email':'test@gmail.com','password':'password123'}
print('Logging in...')
r=requests.post(f'{BASE}/api/auth/login',json=login,timeout=10)
print('login status', r.status_code)
if r.status_code!=200:
    print(r.text); raise SystemExit('Login failed')
token=r.json().get('access_token')
headers={'Authorization':f'Bearer {token}','Content-Type':'application/json'}
formData={
  'projectName':'Custom City Test',
  'projectSize':2500,
  'location':'',
  'rooms':3,
  'roomLength':12,
  'roomWidth':12,
  'materialQuality':'Standard',
  'finishes':'No',
  'finishesQuality':'Standard',
  'floors':1,
  'ceilingHeight':'10'
}
print('\nCalling /api/estimate/calculate')
rc=requests.post(f'{BASE}/api/estimate/calculate',json=formData,headers=headers,timeout=30)
print('calculate status', rc.status_code)
print(json.dumps(rc.json(), indent=2)[:1000])
est = rc.json().get('estimate')
current_cost = est.get('total_cost')
print('\nCalling /api/estimate/ai-city-estimate for Gujranwala')
payload={'projectData': formData, 'targetCity': 'Gujranwala', 'currentCost': current_cost}
rs=requests.post(f'{BASE}/api/estimate/ai-city-estimate',json=payload,headers=headers,timeout=120)
print('ai-city-estimate status', rs.status_code)
try:
    print(json.dumps(rs.json(), indent=2))
except Exception:
    print(rs.text)
