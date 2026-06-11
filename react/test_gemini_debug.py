#!/usr/bin/env python3
import os
import sys
import json
import warnings

sys.path.insert(0, r'D:\projects\construction-cost-estimator-fyp-main\backend')
os.chdir(r'D:\projects\construction-cost-estimator-fyp-main\backend')

from dotenv import load_dotenv
load_dotenv()

# Suppress the FutureWarning from deprecated google.generativeai package
warnings.filterwarnings('ignore', category=FutureWarning, module='google.generativeai')

try:
    # Try to use the new google.genai package
    import google.genai as genai
except ImportError:
    # Fall back to deprecated google.generativeai
    import google.generativeai as genai

key = os.environ.get('GEMINI_API_KEY')
print('API Key loaded:', 'YES' if key else 'NO')
if key:
    print('Key starts with:', key[:10] + '...')
    genai.configure(api_key=key)
    
    prompt = "Parse this construction project description and extract parameters.\nReturn ONLY valid JSON with these fields:\n- projectName: string\n- projectSize: number (in square feet)\n- location: string\n- rooms: number\n- floors: number\n- materialQuality: string (standard, premium, or luxury)\n- finishes: string (Yes or No)\n- finishesQuality: string\n- ceilingHeight: string\n\nDescription: \"I want a 5000 square foot house with 4 rooms in Karachi with premium finishes and 12 foot ceilings\"\n\nReturn ONLY the JSON object, no markdown or extra text."
    
    try:
        print('\n=== Testing gemini-2.5-flash ===')
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        print('Response text:', response.text)
        
        # Try to parse as JSON
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        
        text = text.strip()
        parsed = json.loads(text)
        print('\n✅ Successfully parsed JSON:')
        print(json.dumps(parsed, indent=2))
        
    except Exception as e:
        print('❌ Error:', type(e).__name__)
        print('Details:', str(e))
else:
    print('❌ No API key found')
