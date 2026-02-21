"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type Sentiment = "positive" | "neutral" | "negative" | "uncertain";
export type Confidence = "high" | "medium" | "low";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sentiment?: Sentiment;
  confidence?: Confidence;
  timestamp?: Date;
}

const sentimentColors: Record<Sentiment, string> = {
  positive: "bg-success/20 text-success border border-success/30",
  neutral: "bg-text-muted/20 text-text-secondary border border-text-muted/30",
  negative: "bg-error/20 text-error border border-error/30",
  uncertain: "bg-warning/20 text-warning border border-warning/30",
};

const confidenceColors: Record<Confidence, string> = {
  high: "bg-teal/30 text-teal",
  medium: "bg-blue-600/30 text-blue-600",
  low: "bg-text-muted/30 text-text-muted",
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full",
          "bg-teal text-white shadow-lg shadow-teal/30",
          "hover:bg-teal/90 hover:shadow-teal/40 hover:scale-110",
          "focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-navy",
          "transition-shadow duration-300"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed bottom-24 right-6 z-50 flex w-96 max-w-[calc(100vw-3rem)] flex-col",
              "rounded-[1.75rem] border border-[rgba(232,242,248,0.12)]",
              "bg-[rgba(15,36,53,0.95)] backdrop-blur-[20px]",
              "shadow-2xl shadow-black/40"
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 8V4H8" />
                  <rect width="16" height="12" x="4" y="8" rx="2" />
                  <path d="M2 14h2" />
                  <path d="M20 14h2" />
                  <path d="M15 13v2" />
                  <path d="M9 13v2" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">Care360 AI</h3>
                <p className="text-xs text-text-muted">Clinical assistance</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex max-h-80 flex-1 flex-col gap-3 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <p className="text-sm text-text-muted">
                    Ask me about patient data, care plans, or clinical workflows.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Summarize latest vitals", "Care plan status", "Medication review"].map(
                      (suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() =>
                            setMessages([
                              {
                                id: "1",
                                role: "user",
                                content: suggestion,
                              },
                            ])
                          }
                          className={cn(
                            "rounded-lg border border-teal/30 bg-teal/10 px-3 py-1.5 text-xs text-teal",
                            "hover:bg-teal/20 transition-colors"
                          )}
                        >
                          {suggestion}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col gap-1",
                      msg.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-xl px-4 py-2.5 text-sm",
                        msg.role === "user"
                          ? "bg-teal/20 text-text-primary"
                          : "bg-navy-light text-text-primary"
                      )}
                    >
                      {msg.content}
                    </div>
                    {(msg.sentiment || msg.confidence) && (
                      <div className="flex gap-2">
                        {msg.sentiment && (
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-xs capitalize",
                              sentimentColors[msg.sentiment]
                            )}
                          >
                            {msg.sentiment}
                          </span>
                        )}
                        {msg.confidence && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs capitalize",
                              confidenceColors[msg.confidence]
                            )}
                          >
                            {msg.confidence} confidence
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about patient care..."
                  className={cn(
                    "flex-1 rounded-xl border border-white/10 bg-navy-light px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted",
                    "focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const input = e.currentTarget;
                      if (input.value.trim()) {
                        setMessages((m) => [
                          ...m,
                          {
                            id: Date.now().toString(),
                            role: "user",
                            content: input.value.trim(),
                          },
                        ]);
                        input.value = "";
                      }
                    }
                  }}
                />
                <Button variant="teal" size="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
