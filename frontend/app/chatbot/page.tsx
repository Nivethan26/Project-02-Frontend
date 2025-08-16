"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type Source = { title: string; url: string };
type Msg = { id: string; role: 'user' | 'assistant'; content: string; sources?: Source[] };

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const convoId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const key = 'chatbot_convo_id';
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = Math.random().toString(36).slice(2);
      sessionStorage.setItem(key, id);
    }
    return id;
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setLoading(true);
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: text }]);
    setInput('');
    try {
      const res = await fetch('http://localhost:8000/api/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convoId, message: text, userId: getUserEmail() })
      });
      const data = await res.json();
      const reply = data?.message?.content || 'Sorry, something went wrong.';
      const sources = (data?.message?.sources || []).map((s: any) => ({ title: s.title, url: s.url })) as Source[];
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply, sources }]);

      // Optional auto-redirect when the user asks to open/view and there's a single product match
      if (sources && sources.length === 1 && /\b(open|buy|view|show|details)\b/i.test(text)) {
        const target = sources[0].url;
        if (target) router.push(target);
      }
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Network error. Please try again.' }]);
    }
    setLoading(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function getUserEmail() {
    try {
      const raw = sessionStorage.getItem('user');
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u?.email || null;
    } catch { return null; }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 text-black">AI Assistant</h1>
        <div className="border border-gray-300 rounded p-4 h-[60vh] overflow-y-auto bg-white">
          {messages.length === 0 && (
            <p className="text-gray-500">Ask about products, availability, or pricing.</p>
          )}
          <div className="space-y-3">
            {messages.map(m => (
              <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={
                  'inline-block px-3 py-2 rounded ' + (m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black')
                }>
                  {m.content}
                </div>
                {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black text-black hover:bg-black hover:text-white transition"
                      >
                        <span className="font-medium">View</span>
                        <span className="truncate max-w-[200px]" title={s.title}>{s.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="text-left">
                <div className="inline-block px-3 py-2 rounded bg-gray-100 text-black animate-pulse">Typing…</div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your message and press Enter"
            className="flex-1 border border-black text-black rounded px-3 py-2"
          />
          <button onClick={send} disabled={loading || !input.trim()} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">Send</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

