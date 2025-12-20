import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Send, Mic, MicOff, Loader2, Bot, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HealthBot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Hello! I\'m your health assistant. I can help answer questions about your health, disease management, and wellness. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!message.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: message,
        session_id: sessionId,
      });

      const botMessage = {
        role: 'bot',
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      toast.error('Failed to get response. Please try again.');
      const errorMessage = {
        role: 'bot',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Recording started...');
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Processing your voice...');
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.mp3');

      const response = await axios.post(`${API}/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const transcribedText = response.data.text;
      if (transcribedText) {
        await handleSendMessage(transcribedText);
      }
    } catch (error) {
      toast.error('Failed to transcribe audio');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-primary-100 text-primary-600 mb-4">
            <Bot className="h-8 w-8" />
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary-900 mb-4" data-testid="health-bot-title">
            Health Assistant Bot
          </h1>
          <p className="font-sans text-base text-slate-600">Ask questions about your health using text or voice</p>
        </div>

        {/* Chat Container */}
        <Card className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          {/* Messages Area */}
          <ScrollArea className="h-[500px] p-6">
            <div className="space-y-4" data-testid="chat-messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                  data-testid={`message-${index}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.role === 'bot' ? 'bg-primary-100 text-primary-600' : 'bg-accent text-white'
                    }`}
                  >
                    {message.role === 'bot' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`flex-1 max-w-[75%] p-4 rounded-2xl ${
                      message.role === 'bot'
                        ? 'bg-secondary-50 border border-secondary-100'
                        : 'bg-primary-600 text-white'
                    }`}
                  >
                    <p className="font-sans text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={`font-sans text-xs mt-2 ${
                        message.role === 'bot' ? 'text-slate-400' : 'text-primary-100'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary-100 text-primary-600">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="bg-secondary-50 border border-secondary-100 p-4 rounded-2xl">
                    <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-slate-100 p-4 bg-slate-50">
            <div className="flex items-center space-x-3">
              {/* Voice Button */}
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                data-testid="btn-voice-toggle"
                disabled={loading}
                className={`flex-shrink-0 rounded-full p-3 ${
                  isRecording
                    ? 'bg-error text-white hover:bg-red-700 listening-pulse'
                    : 'bg-secondary-100 text-primary-700 hover:bg-secondary-200'
                }`}
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              {/* Text Input */}
              <Input
                type="text"
                placeholder="Type your health question..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                disabled={loading || isRecording}
                data-testid="input-message"
                className="flex-1 bg-white border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-full px-6"
              />

              {/* Send Button */}
              <Button
                onClick={() => handleSendMessage(inputMessage)}
                disabled={loading || !inputMessage.trim() || isRecording}
                data-testid="btn-send-message"
                className="flex-shrink-0 bg-primary-600 text-white hover:bg-primary-700 rounded-full p-3"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {isRecording && (
              <p className="font-sans text-xs text-error text-center mt-2">Recording... Click the microphone icon to stop</p>
            )}
          </div>
        </Card>

        {/* Info Card */}
        <div className="mt-6 bg-secondary-50 rounded-2xl p-6 border border-secondary-200">
          <p className="font-sans text-sm text-slate-600">
            <strong>Tips:</strong> You can ask about disease symptoms, management strategies, medication information, 
            lifestyle modifications, or general health advice. For emergencies, always call your local emergency number.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthBot;