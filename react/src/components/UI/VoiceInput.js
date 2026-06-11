import React, { useState, useRef } from 'react';
import '../styles/VoiceInput.css';

const VoiceInput = ({ onVoiceText, onParsedData }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const recognitionRef = useRef(null);
  const accumulatedRef = useRef('');

  // Get API URL from environment or default
  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  };

  // Initialize Web Speech API
  const initializeVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech Recognition not supported in your browser. Try Chrome, Edge, or Safari.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let interimTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
      setTranscript('');
      accumulatedRef.current = '';
    };

    recognition.onresult = (event) => {
      // Build final and interim transcripts per result batch
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t + ' ';
        } else {
          interim += t;
        }
      }

      // Accumulate final results and update visible transcript once
      if (final) {
        accumulatedRef.current = (accumulatedRef.current + ' ' + final).trim();
      }

      const combined = (accumulatedRef.current + ' ' + interim).trim();
      setTranscript(combined);
    };

    recognition.onerror = (event) => {
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Notify parent of final transcript when recording ends
      try {
        const finalText = accumulatedRef.current.trim();
        if (finalText && typeof onVoiceText === 'function') {
          onVoiceText(finalText);
        }
      } finally {
        // allow reinitialization next time
        recognitionRef.current = null;
      }
    };

    return recognition;
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = initializeVoiceRecognition();
    }

    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleParseVoice = async () => {
    if (!transcript.trim()) {
      setError('Please record some voice input first');
      return;
    }

    setIsParsing(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Not authenticated. Please login first.');
        setIsParsing(false);
        return;
      }

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/estimate/voice-parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voiceText: transcript })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          setError(data.error || `Server error: ${response.status}`);
        } else {
          setError(`Server error ${response.status}: ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();

      if (data.success) {
        onParsedData(data.parameters);
        setTranscript('');
      } else {
        setError(data.error || 'Failed to parse voice input');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setError('');
  };

  return (
    <div className="voice-input-container">
      <div className="voice-input-header">
        <h3>🎤 Voice Input</h3>
        <p>Describe your construction project in natural language</p>
      </div>

      {error && <div className="voice-error">{error}</div>}

      <div className="voice-controls">
        <button
          onClick={startListening}
          disabled={isListening}
          className="btn-voice-start"
          title="Start recording"
        >
          {isListening ? '🎙️ Listening...' : '🎤 Start Listening'}
        </button>

        <button
          onClick={stopListening}
          disabled={!isListening}
          className="btn-voice-stop"
          title="Stop recording"
        >
          ⏹️ Stop
        </button>

        <button
          onClick={clearTranscript}
          className="btn-voice-clear"
          title="Clear transcript"
        >
          ❌ Clear
        </button>
      </div>

      {transcript && (
        <div className="voice-transcript">
          <label>Your Input:</label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your voice will appear here..."
            readOnly={isListening}
          />
        </div>
      )}

      {transcript && (
        <button
          onClick={handleParseVoice}
          disabled={isParsing || !transcript.trim()}
          className="btn-parse-voice"
        >
          {isParsing ? '⏳ Parsing...' : '✨ Parse with AI'}
        </button>
      )}

      <div className="voice-info">
        <p>💡 Example: "I want a 5000 square foot house with 4 rooms in Karachi with premium finishes and 12 foot ceilings"</p>
      </div>
    </div>
  );
};

export default VoiceInput;
