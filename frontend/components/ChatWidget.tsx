/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
// "use client";
// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { MessageCircle, X } from 'lucide-react';

// type Source = { title: string; url: string };
// type Msg = { id: string; role: 'user' | 'assistant'; content: string; sources?: Source[] };

// export default function ChatWidget() {
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState<Msg[]>([]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);

//   const convoId = useMemo(() => {
//     if (typeof window === 'undefined') return '';
//     const key = 'chatbot_convo_id';
//     let id = sessionStorage.getItem(key);
//     if (!id) {
//       id = Math.random().toString(36).slice(2);
//       sessionStorage.setItem(key, id);
//     }
//     return id;
//   }, []);

//   const inputRef = useRef<HTMLInputElement>(null);
//   useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

//   async function send() {
//     const text = input.trim();
//     if (!text || loading) return;
//     setLoading(true);
//     setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: text }]);
//     setInput('');
//     try {
//       const res = await fetch('http://localhost:8000/api/chatbot/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ conversationId: convoId, message: text, userId: getUserEmail() })
//       });
//       const data = await res.json();
//       const reply = data?.message?.content || 'Sorry, something went wrong.';
//       const sources = (data?.message?.sources || []).map((s: any) => ({ title: s.title, url: s.url })) as Source[];
//       setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply, sources }]);
//     } catch {
//       setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Network error. Please try again.' }]);
//     }
//     setLoading(false);
//   }

//   function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       send();
//     }
//   }

//   function getUserEmail() {
//     try {
//       const raw = sessionStorage.getItem('user');
//       if (!raw) return null;
//       const u = JSON.parse(raw);
//       return u?.email || null;
//     } catch { return null; }
//   }

//   return (
//     <>
//       {!open && (
//         <button
//           onClick={() => setOpen(true)}
//           aria-label="Open chat"
//           className="fixed bottom-6 right-6 z-50 shadow-2xl rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:scale-110"
//         >
//           <span className="sr-only">Open chat</span>
//           <div className="p-4 relative">
//             <MessageCircle className="w-6 h-6" />
//             <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
//           </div>
//         </button>
//       )}

//       {open && (
//         <div className="fixed inset-0 z-[100]">
//           <button aria-label="Close chat" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

//           <div
//             role="dialog"
//             aria-modal="true"
//             className="fixed bottom-6 right-6 w-[92vw] max-w-[420px] h-[70vh] md:h-[70vh] rounded-3xl shadow-2xl overflow-hidden bg-white border-0"
//           >
//             <div className="relative px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
//                   <MessageCircle className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <div className="text-sm font-bold">SK Medicals Assistant</div>
//                   <div className="text-xs text-white/90 flex items-center gap-1">
//                     <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" /> Online
//                   </div>
//                 </div>
//               </div>
//               <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Close">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-4 h-[calc(70vh-112px)] overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
//               {messages.length === 0 && (
//                 <div className="text-center py-8">
//                   <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center">
//                     <MessageCircle className="w-8 h-8 text-emerald-600" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to SK Medicals</h3>
//                   <p className="text-gray-600 text-sm mb-4">Ask about products, availability, or pricing</p>
//                   <div className="space-y-2">
//                     <div className="text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
//                       💊 "Show vitamin C tablets"
//                     </div>
//                     <div className="text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
//                       🏥 "What adult diapers do you have?"
//                     </div>
//                     <div className="text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
//                       💰 "Check prices for hair care products"
//                     </div>
//                   </div>
//                 </div>
//               )}
//               <div className="space-y-3">
//                 {messages.map(m => (
//                   <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
//                     <div className={
//                       'inline-block max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm ' + (m.role === 'user' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none')
//                     }>
//                       {m.content}
//                     </div>
//                     {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
//                       <div className="mt-2 flex flex-wrap gap-2">
//                         {m.sources.map((s, idx) => (
//                           <a
//                             key={idx}
//                             href={s.url}
//                             className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-emerald-200 text-emerald-700 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 hover:text-white hover:border-transparent transition-all duration-300 text-xs font-medium shadow-sm"
//                           >
//                             <span className="font-medium">View</span>
//                             <span className="truncate max-w-[180px]" title={s.title}>{s.title}</span>
//                           </a>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//                 {loading && (
//                   <div className="text-left">
//                     <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white text-gray-600 border border-gray-100 text-sm">
//                       <div className="flex space-x-1">
//                         <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
//                         <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                         <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//                       </div>
//                       <span>Typing...</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="p-4 border-t border-gray-100 bg-white">
//               <div className="flex items-center gap-2">
//                 <input
//                   ref={inputRef}
//                   type="text"
//                   value={input}
//                   onChange={e => setInput(e.target.value)}
//                   onKeyDown={onKeyDown}
//                   placeholder="Type your message…"
//                   className="flex-1 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
//                 />
//                 <button 
//                   onClick={send} 
//                   disabled={loading || !input.trim()} 
//                   className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl disabled:opacity-50 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-sm disabled:cursor-not-allowed"
//                 >
//                   Send
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";

type Source = { title: string; url: string };
type Msg = { id: string; role: "user" | "assistant"; content: string; sources?: Source[] };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const convoId = useMemo(() => {
    if (typeof window === "undefined") return "";
    const key = "chatbot_convo_id";
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = Math.random().toString(36).slice(2);
      sessionStorage.setItem(key, id);
    }
    return id;
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setLoading(true);
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: text }]);
    setInput("");
    try {
      const res = await fetch("http://localhost:8000/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convoId, message: text, userId: getUserEmail() }),
      });
      const data = await res.json();
      const reply = data?.message?.content || "Sorry, something went wrong.";
      const sources = (data?.message?.sources || []).map((s: any) => ({ title: s.title, url: s.url })) as Source[];
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: reply, sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "Network error. Please try again." },
      ]);
    }
    setLoading(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function getUserEmail() {
    try {
      const raw = sessionStorage.getItem("user");
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u?.email || null;
    } catch {
      return null;
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-6 right-6 z-50 shadow-2xl rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-110"
        >
          <div className="p-4 relative">
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </div>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Overlay: no blur */}
          <button
            aria-label="Close chat"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/30"
          />

          {/* Card */}
          <div
            role="dialog"
            aria-modal="true"
            className="fixed bottom-6 right-6 w-[92vw] max-w-[420px] h-[70vh] md:h-[70vh] rounded-3xl shadow-2xl border border-gray-200 bg-white overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">SK Medicals Assistant</div>
                  <div className="text-xs text-white/90 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" /> Online
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages (flex-1 instead of calc height) */}
            <div className="p-4 flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to SK Medicals</h3>
                  <p className="text-gray-600 text-sm mb-4">Ask about products, availability, or pricing</p>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">
                      💊 "Show vitamin C tablets"
                    </div>
                    <div className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">
                      🏥 "What adult diapers do you have?"
                    </div>
                    <div className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">
                      💰 "Check prices for hair care products"
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
                    <div
                      className={
                        "inline-block max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm " +
                        (m.role === "user"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-none"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-none")
                      }
                    >
                      {m.content}
                    </div>

                    {m.role === "assistant" && m.sources?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.sources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.url}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-blue-200 text-blue-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white hover:border-transparent transition-all duration-300 text-xs font-medium shadow-sm"
                          >
                            <span className="font-medium">View</span>
                            <span className="truncate max-w-[180px]" title={s.title}>
                              {s.title}
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}

                {loading && (
                  <div className="text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white text-gray-600 border border-gray-200 text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      <span>Typing...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type your message…"
                  className="flex-1 border border-gray-300 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition-all"
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl disabled:opacity-50 hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium shadow-sm disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


