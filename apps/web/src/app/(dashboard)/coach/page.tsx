'use client';

import { useState } from 'react';
import { sendCoachMessage } from '@/lib/api-client';
import type { ChatMessage } from '@/types/api';

const INTRO_MESSAGE: ChatMessage = {
  id: 'intro',
  role: 'assistant',
  content:
    "Hi! I'm your AI coach. Ask me about your nutrition, workouts, or goals. (This is a V1 feature — chat is currently a UI shell per architecture-plan.md §H/§K.)",
  createdAt: new Date().toISOString(),
};

export default function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMessage: ChatMessage = { id: `local-${Date.now()}`, role: 'user', content: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const reply = await sendCoachMessage(text);
      setMessages((prev) => [...prev, reply]);
    } catch {
      // Expected until POST /coach/chat is live — the shell stays fully usable rather than erroring out.
      setMessages((prev) => [
        ...prev,
        {
          id: `fallback-${Date.now()}`,
          role: 'assistant',
          content:
            "The coach service isn't connected yet in this scaffold — this reply is a local stub. Once the backend's POST /coach/chat is live, this will stream real responses.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <h1 className="text-2xl font-bold text-charcoal-900">Coach</h1>
      <p className="mt-1 text-sm text-neutral-500">AI fitness coach — V1 feature, shown here as a UI shell.</p>

      <div className="mt-4 flex flex-1 flex-col rounded-2xl border border-neutral-200 bg-white">
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === 'user' ? 'bg-charcoal-900 text-white' : 'bg-neutral-100 text-charcoal-800'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {sending ? <div className="text-xs text-neutral-400">Coach is typing…</div> : null}
        </div>
        <form onSubmit={handleSend} className="flex gap-2 border-t border-neutral-200 p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach anything..."
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-charcoal-900 hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
