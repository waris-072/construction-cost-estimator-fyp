# Gemini AI & Voice Input Integration Guide

## Overview
This guide explains how to set up **Gemini AI** for intelligent cost estimation and **Web Speech API** for voice input in the Construction Cost Estimator.

---

## Part 1: Gemini API Setup

### Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev)
2. Click on "Get API Key" button
3. Create a new API key or use an existing one
4. Copy your API key

### Step 2: Configure Environment Variables

1. Open `.env` in the project root (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. Restart the Flask backend for changes to take effect

### Step 3: Verify Gemini Integration

Test if Gemini is properly configured:
```bash
cd backend
python -c "from app.gemini_service import MODEL; print('✅ Gemini loaded' if MODEL else '❌ Gemini not configured')"
```

---

## Part 2: Voice Input Features

### Frontend Features Added

**Voice Input Component** (`src/components/UI/VoiceInput.js`):
- 🎤 **Start/Stop Recording**: Native Web Speech API integration
- 📝 **Transcript Display**: Real-time voice-to-text conversion
- ✨ **AI Parsing**: Parse natural language to extraction form parameters
- 🔄 **Auto-fill**: Automatically populate form with parsed data

### Browser Compatibility
- ✅ Chrome/Edge (Windows, Mac, Linux)
- ✅ Safari (iOS 14.5+)
- ✅ Opera
- ❌ Firefox (limited support)

### Using Voice Input

1. Open the Estimation page
2. Click "Voice Input" tab
3. Click "🎤 Start Listening"
4. Speak clearly: *"I want a 5000 square foot house with 4 rooms in Karachi with premium finishes and 12 foot ceilings"*
5. Click "Stop" when done
6. Click "✨ Parse with AI"
7. Form auto-fills with your project details

---

## Part 3: Gemini API Endpoints

### New Endpoints Added

#### 1. Parse Voice Input
```http
POST /api/estimate/voice-parse
Authorization: Bearer <token>
Content-Type: application/json

{
  "voiceText": "I want a 5000 square foot house with 4 rooms in Karachi..."
}
```

**Response:**
```json
{
  "success": true,
  "parameters": {
    "projectName": "House",
    "projectSize": 5000,
    "location": "Karachi",
    "rooms": 4,
    "floors": 1,
    "materialQuality": "premium",
    "finishes": "Yes",
    "finishesQuality": "premium",
    "ceilingHeight": "12"
  },
  "message": "Voice input parsed successfully"
}
```

#### 2. Validate Project with AI
```http
POST /api/estimate/validate
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectSize": 5000,
  "location": "Karachi",
  "rooms": 4,
  "floors": 2,
  ...
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "valid": true,
    "warnings": [],
    "suggestions": ["Consider reducing ceiling height to save costs"]
  }
}
```

#### 3. Get AI Estimation Advice
```http
POST /api/estimate/ai-advice
Authorization: Bearer <token>
Content-Type: application/json

{
  "estimatedCost": 2500000,
  "projectData": {
    "projectSize": 5000,
    "location": "Karachi",
    ...
  }
}
```

#### 4. Generate AI Report
```http
POST /api/estimate/report
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectData": {...},
  "costBreakdown": {
    "labor_cost": 1000000,
    "material_cost": 1200000,
    ...
  }
}
```

---

## Part 4: How It Works

### Voice Processing Flow
```
User speaks → Web Speech API captures → Transcript sent to backend
  → Gemini parses natural language → Extract project parameters
  → Return structured JSON → Frontend auto-fills form
```

### Gemini Processing
The Gemini AI service:
1. **Parses voice input** into structured project parameters
2. **Validates parameters** for realistic values
3. **Provides cost advice** based on project specifics
4. **Generates reports** for client delivery

### Example: Voice to Parameters Conversion
```
Input: "I want to build a house with 4 rooms and 2 floors in Karachi, 
        5000 square feet, with premium finishes and 12-foot ceilings"

Output:
{
  "projectName": "House",
  "projectSize": 5000,
  "location": "Karachi",
  "rooms": 4,
  "floors": 2,
  "materialQuality": "premium",
  "finishes": "Yes",
  "finishesQuality": "premium",
  "ceilingHeight": "12"
}
```

---

## Part 5: Troubleshooting

### Issue: "Gemini API not configured"
**Solution:** 
- Set `GEMINI_API_KEY` in `.env`
- Ensure you have a valid API key from Google AI Studio
- Restart the backend server

### Issue: Voice input not working
**Solution:**
- Check browser compatibility (use Chrome/Edge)
- Ensure microphone permissions are granted
- Check browser console for errors (F12)
- Try refreshing the page

### Issue: "Cannot parse voice input"
**Solution:**
- Speak more clearly and slowly
- Use specific numbers instead of words ("5000" instead of "five thousand")
- Include location and quality terms ("premium", "standard", "luxury")

### Issue: Incomplete form auto-fill
**Solution:**
- Manually edit the form after voice input
- Gemini may miss some fields if voice is unclear
- All fields can be adjusted before submission

---

## Part 6: Advanced Usage

### Custom Gemini Prompts
Edit `backend/app/gemini_service.py` to customize:
- Parsing logic for voice input
- Validation criteria
- Cost advice generation
- Report formatting

### Rate Limiting
Be aware of Gemini API rate limits:
- Free tier: ~60 requests per minute
- Paid tier: Higher limits with billing

### Caching Results
For production, consider caching common requests:
```python
# Example: Cache voice parsing results
cache = {}
voice_hash = hash(voice_text)
if voice_hash in cache:
    return cache[voice_hash]
```

---

## Part 7: Testing

### Test Voice Input Manually
```bash
# Terminal 1: Run backend
cd backend
python run.py

# Terminal 2: Test voice parsing endpoint
curl -X POST http://localhost:5000/api/estimate/voice-parse \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"voiceText": "5000 square feet house in Karachi with 4 rooms"}'
```

### Test with Frontend
1. Login to http://localhost:3000
2. Go to Estimation page
3. Click "Voice Input" tab
4. Record your voice
5. Click "Parse with AI"
6. Check if form auto-fills correctly

---

## Part 8: Deployment Notes

### Production Considerations
1. **API Key Security**: Never commit `.env` with real API keys
2. **Error Handling**: Gracefully handle Gemini API failures
3. **User Privacy**: Voice input is processed server-side, not stored
4. **CORS Headers**: Ensure CORS is properly configured
5. **Rate Limiting**: Implement request throttling if needed

### Environment Setup (Production)
```bash
# Set Gemini API key as environment variable
export GEMINI_API_KEY="your-api-key"
# or in .env file (not committed to git)
```

---

## Quick Start Command

```bash
# 1. Get API key from https://ai.google.dev
# 2. Set environment variable or update .env
# 3. Restart backend
cd backend
python run.py

# 4. Frontend automatically includes voice features
# Open http://localhost:3000 and test!
```

---

## Resources
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Web Speech API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [SpeechRecognition Browser Support](https://caniuse.com/speech-recognition)

---

**Version:** 1.0  
**Last Updated:** January 2026  
**Maintainer:** Construction Cost Estimator Team
