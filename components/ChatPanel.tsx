'use client';

import { useEffect, useRef, useState } from 'react';
import { AnalysisResponse, ChatRequest, sendChatMessage } from '@/utils/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'confirmation';
  pendingMessage?: string; // the original user message awaiting confirmation
}

interface ChatPanelProps {
  incidentNo: string;
  onClose: () => void;
  onAnalysisUpdated: (updated: AnalysisResponse) => void;
}

export default function ChatPanel({ incidentNo, onClose, onAnalysisUpdated }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      type: 'text',
      content:
        "Hello! I can help refine the incident analysis with additional context. Paste TWS logs, Informatica session logs, or any relevant diagnostic data and I'll explain what it means before updating the analysis.",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accumulatedContext, setAccumulatedContext] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pushMessage = (msg: Omit<ChatMessage, 'id'>) => {
    setMessages((prev) => [...prev, { ...msg, id: Date.now().toString() }]);
  };

  // ── Phase 1: understanding ──────────────────────────────────────────────────

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    setInputText('');
    pushMessage({ role: 'user', type: 'text', content: text });
    setIsLoading(true);

    try {
      const payload: ChatRequest = {
        incident_no: incidentNo,
        message: text,
        accumulated_context: accumulatedContext,
        confirmed: false,
      };
      const response = await sendChatMessage(payload);

      if (response.requires_confirmation) {
        pushMessage({
          role: 'assistant',
          type: 'confirmation',
          content: response.understanding,
          pendingMessage: text,
        });
      } else {
        // Should not happen in understanding phase, but handle gracefully
        pushMessage({ role: 'assistant', type: 'text', content: response.understanding });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      pushMessage({ role: 'assistant', type: 'text', content: `Error: ${msg}` });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Phase 2: regeneration (after confirmation) ──────────────────────────────

  const handleConfirm = async (pendingMessage: string, messageId: string) => {
    // Swap confirmation bubble to plain text so buttons disappear
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, type: 'text' as const } : m
      )
    );
    setIsLoading(true);

    const newContext = accumulatedContext
      ? `${accumulatedContext}\n\n${pendingMessage}`.trim()
      : pendingMessage;

    try {
      const payload: ChatRequest = {
        incident_no: incidentNo,
        message: pendingMessage,
        accumulated_context: newContext,
        confirmed: true,
      };
      const response = await sendChatMessage(payload);

      setAccumulatedContext(newContext);

      if (response.updated_analysis) {
        onAnalysisUpdated(response.updated_analysis);
        pushMessage({
          role: 'assistant',
          type: 'text',
          content: 'Analysis updated successfully. The result panel on the left reflects the new findings. You can provide more context anytime.',
        });
      } else {
        pushMessage({
          role: 'assistant',
          type: 'text',
          content: 'The analysis was re-run but no updated result was returned. Please try again.',
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      pushMessage({ role: 'assistant', type: 'text', content: `Error: ${msg}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, type: 'text' as const } : m
      )
    );
    pushMessage({
      role: 'assistant',
      type: 'text',
      content: 'Analysis update cancelled. You can provide more context anytime.',
    });
  };

  // ── Keyboard handling ───────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col border-l border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            {/* Chat bubble icon */}
            <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">AI Assistant</p>
            <p className="text-[11px] text-slate-400">{incidentNo}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          aria-label="Close chat"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={
                msg.role === 'user'
                  ? 'max-w-[85%] rounded-2xl rounded-tr-sm bg-blue-600 text-white px-4 py-2.5 text-sm leading-relaxed'
                  : 'max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 text-slate-900 px-4 py-2.5 text-sm leading-relaxed'
              }
            >
              {msg.content}
            </div>

            {/* Confirm / Cancel buttons (only on confirmation-type assistant messages) */}
            {msg.type === 'confirmation' && msg.role === 'assistant' && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleConfirm(msg.pendingMessage!, msg.id)}
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  Update Analysis
                </button>
                <button
                  onClick={() => handleCancel(msg.id)}
                  disabled={isLoading}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start">
            <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-100 px-3 py-3 bg-white shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste TWS logs, Informatica logs, or describe what you found… (Enter to send, Shift+Enter for new line)"
            rows={3}
            disabled={isLoading}
            className="flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="shrink-0 rounded-lg bg-blue-600 p-2.5 text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:bg-blue-300"
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400">
          Shift+Enter for new line · Context is accumulated across confirmed updates
        </p>
      </div>
    </div>
  );
}
