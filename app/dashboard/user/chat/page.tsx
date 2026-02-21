"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { ChatInterface } from "@/components/chat/chat-interface";

export default function ChatPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Array<{ id: string; title: string; created_at: string }>>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const loadSessions = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("chat_sessions")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setSessions(data);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleNewChat = useCallback(async () => {
    if (isCreatingNew) return;
    setIsCreatingNew(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: newSession } = await supabase
        .from("chat_sessions")
        .insert({ user_id: user.id, title: "New chat" })
        .select("id")
        .single();
      if (newSession) {
        await loadSessions();
        router.push(`/dashboard/user/chat?session=${newSession.id}`);
      }
    } finally {
      setIsCreatingNew(false);
    }
  }, [isCreatingNew, loadSessions, router]);

  const handleDeleteChat = async (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this chat?")) return;
    const supabase = createClient();
    await supabase.from("chat_sessions").delete().eq("id", sessionId);
    await loadSessions();
    router.push("/dashboard/user/chat");
  };

  return (
    <div className="flex gap-6 p-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <GlassCard className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-text-primary">Chat history</h2>
            <button
              type="button"
              onClick={handleNewChat}
              disabled={isCreatingNew}
              className="text-xs text-teal hover:underline disabled:opacity-50"
            >
              New chat
            </button>
          </div>
          <div className="space-y-1">
            {sessions.length === 0 && (
              <p className="text-xs text-text-muted">No chats yet</p>
            )}
            {sessions.map((s) => (
              <div
                key={s.id}
                className="group flex items-center gap-1 rounded-lg hover:bg-white/5"
              >
                <a
                  href={`/dashboard/user/chat?session=${s.id}`}
                  className="min-w-0 flex-1 truncate px-3 py-2 text-xs text-text-secondary hover:text-text-primary"
                >
                  {s.title || "New chat"}
                </a>
                <button
                  type="button"
                  onClick={(e) => handleDeleteChat(e, s.id)}
                  className="rounded p-1.5 text-text-muted opacity-0 hover:bg-error/20 hover:text-error group-hover:opacity-100"
                  title="Delete chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      </aside>
      <main className="min-w-0 flex-1">
        <h1 className="mb-4 text-2xl font-semibold text-text-primary">AI Health Assistant</h1>
        <p className="mb-6 text-sm text-text-muted">
          Ask health questions. I consider your chronic data and may trigger SOS if I detect serious risks.
        </p>
        <ChatInterface onSessionSaved={loadSessions} />
      </main>
    </div>
  );
}
