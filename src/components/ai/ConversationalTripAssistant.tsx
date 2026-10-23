import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Plus, MapPin, DollarSign, Bot, User, Check, RefreshCw } from 'lucide-react';
import { Trip, Activity } from '../../types/travel';
import { sendTripChatMessage, ChatMessage } from '../../services/ai';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';

interface ConversationalTripAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: Trip | null;
  activities?: Activity[];
}

export const ConversationalTripAssistant: React.FC<ConversationalTripAssistantProps> = ({
  isOpen,
  onClose,
  trip,
  activities = [],
}) => {
  const { profile } = useAuth();
  const { addActivity } = useTrips();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${profile?.displayName?.split(' ')[0] || 'Traveler'}! I am your **GlobeTrotter Travel Concierge**.\n\nI am grounded in your ${trip ? `**${trip.title}** voyage to **${trip.destination}**` : 'travel plans'}. Ask me about activity pacing, authentic dining, neighborhood secrets, packing tips, or budget adjustments!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedActivityIds, setAddedActivityIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const quickPrompts = [
    trip?.destination ? `Best authentic dining in ${trip.destination.split(',')[0]} under $40?` : 'Best dinner spots?',
    'Is my current itinerary pacing too rushed?',
    'How can I optimize this trip budget?',
    'What should I pack for this trip?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendTripChatMessage({
        messages: chatHistory,
        tripContext: {
          ...trip,
          activities,
        },
        userProfile: profile,
      });

      // Parse activity suggestions if any: [ACTIVITY_SUGGESTION: {...}]
      let parsedActivity: Partial<Activity> | undefined;
      let cleanReply = res.reply;

      const match = res.reply.match(/\[ACTIVITY_SUGGESTION:\s*({.*?})\]/s);
      if (match && match[1]) {
        try {
          const actData = JSON.parse(match[1]);
          parsedActivity = {
            name: actData.name,
            category: actData.category || 'experience',
            estimatedCost: actData.cost || 25,
            dayIndex: actData.day || 1,
            location: actData.location || trip?.destination || '',
            description: actData.description || 'AI Recommended Experience',
            startTime: actData.startTime || '02:00 PM',
          };
          cleanReply = res.reply.replace(/\[ACTIVITY_SUGGESTION:\s*{.*?}\]/s, '').trim();
        } catch {
          // ignore parsing error
        }
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: cleanReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActivity: parsedActivity,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: 'I had trouble connecting to the travel intelligence service. Please check your network or try again shortly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestedActivity = async (suggested: Partial<Activity>, msgId: string) => {
    if (!trip || !suggested.name) return;
    try {
      await addActivity({
        tripId: trip.id,
        dayIndex: suggested.dayIndex || 1,
        name: suggested.name,
        category: (suggested.category as any) || 'experience',
        startTime: suggested.startTime || '03:00 PM',
        location: suggested.location || trip.destination,
        description: suggested.description || 'Recommended by AI Concierge',
        estimatedCost: suggested.estimatedCost || 20,
        isCompleted: false,
      });
      setAddedActivityIds((prev) => [...prev, msgId]);
    } catch (e) {
      console.error('Failed to add suggested activity', e);
    }
  };

  return (
    <div className="fixed inset-0 sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[440px] sm:h-[620px] z-50 flex flex-col bg-white sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="px-5 py-4 bg-[#1B4332] text-[#FBF8F3] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-lg font-bold">Conversational Concierge</h3>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded">
                Live AI
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80 font-light truncate max-w-[240px]">
              {trip ? `${trip.destination} • ${trip.durationDays} Days` : 'General Travel Planning'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          aria-label="Close Assistant"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FBF8F3]/60 text-xs">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-2xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-[#1B4332] text-white rounded-br-xs'
                    : 'bg-white text-stone-800 border border-stone-200/90 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {m.content.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className="mb-2 last:mb-0">
                      {paragraph.split('**').map((chunk, cIdx) =>
                        cIdx % 2 === 1 ? <strong key={cIdx}>{chunk}</strong> : chunk
                      )}
                    </p>
                  ))}
                </div>

                {/* Optional Activity Suggestion Card with Add Button */}
                {m.suggestedActivity && (
                  <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-stone-900 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-emerald-800">
                        Suggested Itinerary Stop
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-900">
                        Day {m.suggestedActivity.dayIndex}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-stone-900">
                      {m.suggestedActivity.name}
                    </p>
                    <p className="text-[11px] text-stone-600">
                      {m.suggestedActivity.location} • {trip?.currency || '$'} {m.suggestedActivity.estimatedCost}
                    </p>
                    <button
                      type="button"
                      disabled={addedActivityIds.includes(m.id)}
                      onClick={() => handleAddSuggestedActivity(m.suggestedActivity!, m.id)}
                      className="w-full mt-1 py-1.5 bg-[#1B4332] text-white rounded-lg text-xs font-semibold hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {addedActivityIds.includes(m.id) ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to Itinerary</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to My Itinerary</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-stone-400 mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-stone-200 text-xs text-stone-500 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1B4332]" />
            <span>Consulting GlobeTrotter AI concierge...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-white border-t border-stone-100 flex gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="text-[11px] font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer flex-shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask questions about your planned voyage..."
          className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
