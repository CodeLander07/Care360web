"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sosTriggered?: boolean;
  sosReason?: string;
}

export function ChatInterface({
  onSessionSaved,
}: {
  onSessionSaved?: () => void;
} = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sosAlert, setSosAlert] = useState<{ reason?: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get("session");

  const loadSession = useCallback(async (sid: string) => {
    setLoading(false);
    setSosAlert(null);
    const { data } = await supabase
      .from("chat_messages")
      .select("id, role, content, sos_triggered")
      .eq("session_id", sid)
      .order("created_at", { ascending: true });
    setMessages(
      (data ?? []).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        sosTriggered: m.sos_triggered,
      }))
    );
  }, [supabase]);

  const loadOrCreateSession = useCallback(async () => {
    if (urlSessionId) {
      setSessionId(urlSessionId);
      await loadSession(urlSessionId);
      return;
    }
    const { data: sessions } = await supabase
      .from("chat_sessions")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1);
    if (sessions?.[0]) {
      setSessionId(sessions[0].id);
      await loadSession(sessions[0].id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: newSession } = await supabase
        .from("chat_sessions")
        .insert({ user_id: user.id, title: "New chat" })
        .select("id")
        .single();
      if (newSession) {
        setSessionId(newSession.id);
        onSessionSaved?.();
      }
    }
  }, [supabase, loadSession, urlSessionId, onSessionSaved]);

  useEffect(() => {
    setMessages([]);
    setSessionId(null);
    setSosAlert(null);
    setLoading(false);
    loadOrCreateSession();
  }, [loadOrCreateSession, urlSessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    setSosAlert(null);

    let sid = sessionId;
    if (!sid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: newSession, error: sessionErr } = await supabase
        .from("chat_sessions")
        .insert({ user_id: user.id, title: "New chat" })
        .select("id")
        .single();
      sid = newSession?.id ?? null;
      setSessionId(sid);
      if (newSession) onSessionSaved?.();
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);

    if (sid) {
      const { error: userErr } = await supabase.from("chat_messages").insert({
        session_id: sid,
        role: "user",
        content: text,
      });
      if (!userErr) {
        if (messages.length === 0) {
          await supabase.from("chat_sessions").update({ title: text.slice(0, 50) || "New chat" }).eq("id", sid);
        }
        onSessionSaved?.();
      }
    }

    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: sid, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        sosTriggered: data.sosTriggered,
        sosReason: data.sosReason,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.sosTriggered) {
        setSosAlert({ reason: data.sosReason });
      }

      if (sid) {
        const { error: assistantErr } = await supabase.from("chat_messages").insert({
          session_id: sid,
          role: "assistant",
          content: data.message,
          sos_triggered: data.sosTriggered ?? false,
        });
        if (!assistantErr) onSessionSaved?.();
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[min(70vh,600px)] flex-col rounded-2xl border border-white/10 bg-navy-light/50">
      {sosAlert && (
        <div className="flex flex-col gap-2 border-b border-error/50 bg-error/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-error">
            SOS: Potential health risk detected. {sosAlert.reason && `(${sosAlert.reason})`}
          </p>
          <div className="flex gap-2">
            <a
              href="tel:911"
              className="rounded-lg bg-error px-4 py-2 text-sm font-medium text-white hover:bg-error/90"
            >
              Call emergency
            </a>
            <button
              type="button"
              onClick={() => setSosAlert(null)}
              className="rounded-lg border border-error/50 px-4 py-2 text-sm text-error hover:bg-error/10"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-7 w-7 text-teal"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-text-primary">Care360 Health Assistant</p>
              <p className="mt-1 text-sm text-text-muted">
                Share symptoms or ask health questions. I&apos;ll consider your chronic data and may suggest SOS if needed.
              </p>
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-teal/30 text-text-primary"
                  : "bg-white/5 text-text-secondary"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{m.content}</p>
              {m.sosTriggered && (
                <p className="mt-2 text-xs text-error">SOS triggered — please seek professional care if urgent.</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3">
              <div className="h-2 w-2 animate-bounce rounded-full bg-teal [animation-delay:-0.3s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-teal [animation-delay:-0.15s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-teal" />
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-white/10 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-teal px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-teal/90 disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
