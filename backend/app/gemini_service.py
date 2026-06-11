"""
Gemini AI Service for intelligent construction cost estimation
"""
import os
import json
import warnings
from app.database import City, Material

# Suppress the FutureWarning from deprecated google.generativeai package
warnings.filterwarnings('ignore', category=FutureWarning, module='google.generativeai')

try:
    # Try to use the new google.genai package
    import google.genai as genai
    USING_NEW_GENAI = True
except ImportError:
    # Fall back to deprecated google.generativeai
    import google.generativeai as genai
    USING_NEW_GENAI = False

# Configure Gemini API
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if GEMINI_API_KEY:
    if not USING_NEW_GENAI:
        genai.configure(api_key=GEMINI_API_KEY)
    MODEL = True
else:
    MODEL = None

def parse_voice_input(voice_text):
    """
    Parse natural language voice input to extract estimation parameters
    
    Example: "I want to build a 5000 square foot house with 4 rooms in Karachi with premium finishes"
    """
    if not MODEL:
        return None
    
    prompt = f"""Parse this construction project description and extract parameters.
Return ONLY valid JSON with these fields (use exact field names):
- projectName: string
- projectSize: number (in square feet)
- location: string (city in Pakistan)
- rooms: number
- floors: number (default 1)
- materialQuality: string (standard, premium, or luxury)
- finishes: string (Yes or No)
- finishesQuality: string (standard, premium, or luxury if finishes=Yes)
- ceilingHeight: string (10, 12, or 14 feet)

Description: "{voice_text}"

IMPORTANT: Return ONLY the JSON object, no markdown, no code blocks, no extra text."""
    
    try:
        # Use gemini-2.5-flash model (latest available)
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        text = response.text.strip()
        
        # Clean up markdown code blocks if present
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        
        text = text.strip()
        
        # Parse JSON
        params = json.loads(text)
        return params
    except Exception as e:
        print(f"Error parsing voice input: {e}")
        return None

def get_ai_estimation_advice(project_data, estimated_cost):
    """
    Get AI-generated advice and cost breakdown explanation
    """
    if not MODEL:
        return {"advice": "Gemini API not configured", "breakdown": ""}
    
    prompt = f"""Provide construction cost estimation advice for this project:

Project Data:
- Size: {project_data.get('projectSize')} sq.ft
- Location: {project_data.get('location')}
- Rooms: {project_data.get('rooms')}
- Floors: {project_data.get('floors')}
- Quality: {project_data.get('materialQuality')}
- Finishes: {project_data.get('finishes')}
- Ceiling Height: {project_data.get('ceilingHeight')} feet

Estimated Cost: PKR {estimated_cost:,.0f}

Provide:
1. A brief cost breakdown explanation (2-3 sentences)
2. 2-3 specific recommendations to reduce costs
3. Any quality considerations for the chosen material quality

Keep response concise and practical."""
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        text = response.text.strip()
        return {"advice": text, "breakdown": ""}
    except Exception as e:
        print(f"Error getting AI advice: {e}")
        return {"advice": "Unable to generate advice", "breakdown": ""}

def validate_project_with_ai(project_data):
    """
    Use Gemini to validate project parameters and suggest improvements
    """
    if not MODEL:
        return {"valid": True, "warnings": [], "suggestions": []}
    
    area = project_data.get('projectSize', 0)
    rooms = project_data.get('rooms', 0)
    floors = project_data.get('floors', 1)
    
    prompt = f"""Review this construction project for realistic parameters:
- Area: {area} sq.ft
- Rooms: {rooms}
- Floors: {floors}
- Location: {project_data.get('location')}
- Material Quality: {project_data.get('materialQuality')}

Return JSON with:
- valid: boolean (is this realistic?)
- warnings: array of strings (any concerns)
- suggestions: array of strings (improvements)

Return ONLY JSON, no markdown."""
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        
        text = text.strip()
        return json.loads(text)
    except Exception as e:
        print(f"Error validating project: {e}")
        return {"valid": True, "warnings": [], "suggestions": []}

def generate_estimation_report(project_data, cost_breakdown):
    """
    Generate a detailed estimation report using Gemini
    """
    if not MODEL:
        return "Report generation unavailable"
    
    prompt = f"""Generate a professional construction cost estimation report summary (max 150 words):

Project: {project_data.get('projectName')}
Area: {project_data.get('projectSize')} sq.ft
Rooms: {project_data.get('rooms')}
Location: {project_data.get('location')}
Quality: {project_data.get('materialQuality')}

Cost Breakdown:
- Labor: PKR {cost_breakdown.get('labor_cost', 0):,.0f}
- Materials: PKR {cost_breakdown.get('material_cost', 0):,.0f}
- Equipment: PKR {cost_breakdown.get('equipment_cost', 0):,.0f}
- Finishes: PKR {cost_breakdown.get('finishes_cost', 0):,.0f}
- Contingency: PKR {cost_breakdown.get('contingency_cost', 0):,.0f}
- Total: PKR {cost_breakdown.get('total_estimated_cost', 0):,.0f}

Write a professional summary suitable for a client report."""
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        return response.text
    except Exception as e:
        print(f"Error generating report: {e}")
        return "Unable to generate report"

def suggest_alternative_locations(project_data, current_cost):
    """
    Use Gemini to suggest alternative locations and cost differences
    """
    if not MODEL:
        return {"suggestions": [], "message": "AI not available"}
    
    project_name = project_data.get('projectName', 'Project')
    area = project_data.get('projectSize', 0)
    quality = project_data.get('materialQuality', 'Standard')
    current_location = project_data.get('location', 'Karachi')
    
    prompt = f"""Based on this construction project, suggest 3-4 alternative Pakistani cities and estimate cost differences:

Project: {project_name}
Current Location: {current_location}
Size: {area} sq.ft
Quality: {quality}
Current Estimated Cost: PKR {current_cost:,.0f}

Consider factors like:
- Regional labor costs (Karachi, Lahore, Islamabad typically higher; Hyderabad, Quetta lower)
- Material availability and transportation
- Economic conditions and inflation rates
- Infrastructure and development stage

Return ONLY valid JSON with this structure:
{{
  "suggestions": [
    {{
      "location": "City Name",
      "costDifference": number (positive for more expensive, negative for cheaper),
      "estimatedCost": number,
      "reason": "Brief explanation of cost difference"
    }}
  ],
  "savingsPotential": "Brief insight about best value locations",
  "riskFactors": "Any risks to consider for alternative locations"
}}

Return ONLY the JSON, no markdown or extra text."""
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        
        text = text.strip()
        result = json.loads(text)
        return result
    except Exception as e:
        print(f"Error suggesting locations: {e}")
        return {"suggestions": [], "message": f"Error: {str(e)}"}


def estimate_for_city(project_data, target_city, current_cost=None):
    """
    Ask Gemini to estimate total project cost for a specific target city.
    Returns dict: { 'estimatedCost': number, 'reason': str }
    """
    if not MODEL:
        return {"estimatedCost": None, "reason": "Gemini not configured"}

    project_name = project_data.get('projectName', 'Project')
    area = project_data.get('projectSize', 0)
    quality = project_data.get('materialQuality', 'Standard')

    rooms = project_data.get('rooms', 0)
    floors = project_data.get('floors', 1)
    finishes = project_data.get('finishes', 'No')
    finishes_quality = project_data.get('finishesQuality', 'Standard')
    ceiling_height = project_data.get('ceilingHeight', '10')

    prompt = f"""
You are a professional construction cost estimator for Pakistan. Estimate the total construction cost (in PKR) for the following project if built in {target_city}. Provide a detailed breakdown (BOQ) and percentage for each major cost component (materials, labor, equipment, finishes, other). Use realistic, region-specific rates and explain any assumptions.

Project Details:
- Name: {project_name}
- Area: {area} sq.ft
- Location: {target_city}
- Rooms: {rooms}
- Floors: {floors}
- Material Quality: {quality}
- Finishes: {finishes} (Quality: {finishes_quality})
- Ceiling Height: {ceiling_height} ft
- Current Estimated Cost (if available): PKR {current_cost if current_cost is not None else 'unknown'}

Return ONLY valid JSON with this structure:
{{
    "estimatedCost": number,
    "reason": string,
    "material_cost": number,
    "labor_cost": number,
    "equipment_cost": number,
    "finishes_cost": number,
    "other_costs": number,
    "material_boq": [
        {{"material": string, "unit": string, "quantity": number, "rate": number, "total": number, "percent": number}}
    ],
    "percentages": {{
        "material": number,
        "labor": number,
        "equipment": number,
        "finishes": number,
        "other": number
    }}
}}

Return ONLY the JSON object, no markdown, no extra text.
"""

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        text = text.strip()
        result = json.loads(text)
        # Ensure all required fields are present for the estimate API
        return {
            'estimatedCost': result.get('estimatedCost'),
            'reason': result.get('reason', ''),
            'material_cost': result.get('material_cost'),
            'labor_cost': result.get('labor_cost'),
            'equipment_cost': result.get('equipment_cost'),
            'finishes_cost': result.get('finishes_cost'),
            'other_costs': result.get('other_costs'),
            'material_boq': result.get('material_boq', []),
            'percentages': result.get('percentages', {}),
        }
    except Exception as e:
        print(f"Error estimating for city {target_city}: {e}")
        return {"estimatedCost": None, "reason": str(e)}
