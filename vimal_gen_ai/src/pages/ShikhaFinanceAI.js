import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

export default function ShikhaFinanceAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const handleSendRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Actual handleSend function
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    try {
      const res = await axios.post('http://localhost:5000/ai', {
        messages: updatedMessages,
      });
      const assistantMessage = res.data; // backend sends clean content
      setMessages([...updatedMessages, assistantMessage]);
      speak(assistantMessage.content);
    } catch (error) {
      console.error('Error communicating with AI backend', error);
    }
  }, [input, messages]);

  // Keep latest handleSend in ref
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);

      setTimeout(() => {
        if (handleSendRef.current) {
          handleSendRef.current();
        }
      }, 500);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Speech synthesis setup
  let selectedVoice = null;
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    selectedVoice =
      voices.find(v => v.name === 'Google हिन्दी') ||
      voices.find(v => v.name === 'Google UK English Female') ||
      voices.find(v => v.lang === 'hi-IN') ||
      voices.find(v => v.lang === 'en-IN') ||
      voices[0];
  };
  if (typeof window !== 'undefined') {
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    const isHindi = /[ऀ-ॿ]/.test(text);
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
    if (selectedVoice) utterance.voice = selectedVoice;
    synth.speak(utterance);
  };

  const handleMicClick = () => {
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-blue-700">
          💰 Cortana - Personal Finance AI Assistant
        </h1>
        <div className="h-96 overflow-y-auto mb-4 p-2 border rounded-lg bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`my-2 p-2 rounded-md ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100 text-left'}`}
            >
              <p className="text-sm">{msg.role === 'user' ? 'You' : 'Cortana'}: {msg.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 border rounded-md px-4 py-2"
            placeholder="Type or speak your message..."
          />
          <button
            onClick={handleMicClick}
            className={`px-4 py-2 rounded-md text-white ${listening ? 'bg-red-600' : 'bg-purple-600'} hover:opacity-90`}
          >
            🎤
          </button>
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
