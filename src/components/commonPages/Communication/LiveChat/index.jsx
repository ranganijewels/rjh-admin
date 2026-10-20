"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, PageHeader } from "@/components/common/ui/page";
import { Button } from "@/components/common/ui/button";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import { MessageSquare, Send, CheckCheck, RefreshCw } from "lucide-react";
import { getAuthToken } from "@/lib/auth-token";

const authHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const fmtTime = (d) => {
  try {
    return new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

export default function LiveChatInbox() {
  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [filter, setFilter] = useState("all"); // all | open | closed
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState(null); // { conversation, messages }
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const scrollRef = useRef(null);
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  // ─── Conversation list ───────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    try {
      const qs = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/chat/conversations${qs}`, { headers: authHeaders() });
      const json = await res.json();
      setConversations(json?.data || []);
    } catch {
      setConversations([]);
    } finally {
      setLoadingList(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoadingList(true);
    fetchList();
  }, [fetchList]);

  // Poll the list so new visitor messages surface without a manual refresh.
  useEffect(() => {
    const t = setInterval(fetchList, 6000);
    return () => clearInterval(t);
  }, [fetchList]);

  // ─── Active thread ───────────────────────────────────────────────────
  const fetchThread = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/chat/conversations/${id}`, { headers: authHeaders() });
      const json = await res.json();
      if (activeIdRef.current === id) setThread(json?.data || null);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setThread(null);
    fetchThread(activeId);
    const t = setInterval(() => fetchThread(activeId), 4000);
    return () => clearInterval(t);
  }, [activeId, fetchThread]);

  // Auto-scroll thread to bottom on new messages.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread?.messages?.length]);

  const openConversation = (c) => {
    setActiveId(c.id);
    // optimistically clear the unread badge
    setConversations((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, unreadForAdmin: 0 } : x)),
    );
  };

  const sendReply = async () => {
    const text = reply.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    setReply("");
    try {
      const res = await fetch(`/api/chat/conversations/${activeId}/messages`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ content: text }),
      });
      const json = await res.json();
      const msg = json?.data;
      if (msg?.id) {
        setThread((prev) =>
          prev ? { ...prev, messages: [...(prev.messages || []), msg] } : prev,
        );
      }
      fetchList();
    } finally {
      setSending(false);
    }
  };

  const toggleStatus = async () => {
    if (!thread?.conversation) return;
    const next = thread.conversation.status === "closed" ? "open" : "closed";
    await fetch(`/api/chat/conversations/${activeId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status: next }),
    });
    setThread((prev) =>
      prev ? { ...prev, conversation: { ...prev.conversation, status: next } } : prev,
    );
    fetchList();
  };

  return (
    <div className="flex flex-col h-screen space-y-4">
      <PageHeader
        title="Live Chat"
        description="Real-time conversations from storefront visitors. Replies appear instantly in their chat window."
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchList}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 flex-1 min-h-[460px]">
        {/* Conversation list */}
        <div className="border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="flex gap-1 p-2 border-b border-border bg-muted/40">
            {["all", "open", "closed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 text-xs py-1.5 rounded-md capitalize transition-colors ${
                  filter === f ? "bg-background font-semibold shadow-sm" : "text-muted-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="p-6"><ContentLoader /></div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No conversations yet.
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openConversation(c)}
                  className={`w-full text-left px-3.5 py-3 border-b border-border hover:bg-muted/40 transition-colors ${
                    activeId === c.id ? "bg-muted/60" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate">
                      {c.visitorName || "Anonymous visitor"}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {fmtTime(c.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">
                      {c.lastMessagePreview || "—"}
                    </span>
                    {c.unreadForAdmin > 0 && (
                      <span
                        className="shrink-0 text-[10px] text-white bg-teal rounded-full px-1.5 min-w-[18px] text-center"
                      >
                        {c.unreadForAdmin}
                      </span>
                    )}
                  </div>
                  {c.status === "closed" && (
                    <span className="inline-block mt-1 text-xs text-muted-foreground">closed</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread */}
        <div className="border border-border rounded-lg overflow-hidden flex flex-col">
          {!activeId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-10 w-10 opacity-30 mb-3" />
              Select a conversation to view the chat.
            </div>
          ) : !thread ? (
            <div className="flex-1 flex items-center justify-center"><ContentLoader /></div>
          ) : (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
                <div>
                  <div className="font-semibold text-sm">
                    {thread.conversation.visitorName || "Anonymous visitor"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {thread.conversation.visitorEmail || "no email provided"}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={toggleStatus}>
                  <CheckCheck className="h-3.5 w-3.5" />
                  {thread.conversation.status === "closed" ? "Reopen" : "Mark resolved"}
                </Button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                {(thread.messages || []).map((m) => {
                  const agent = m.sender === "agent";
                  const system = m.sender === "system";
                  if (system) {
                    return (
                      <div key={m.id} className="mx-auto max-w-[80%] text-center text-xs text-muted-foreground bg-background rounded-lg px-3 py-2 shadow-sm">
                        {m.content}
                      </div>
                    );
                  }
                  return (
                    <div key={m.id} className={`flex ${agent ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-snug shadow-sm ${
                          agent ? "bg-teal text-white rounded-br-sm" : "bg-background rounded-bl-sm"
                        }`}
                      >
                        <div className="text-xs opacity-70 mb-0.5">
                          {agent ? m.senderName || "You" : thread.conversation.visitorName || "Visitor"} · {fmtTime(m.createdAt)}
                        </div>
                        {m.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-end gap-2 border-t border-border p-3">
                <textarea
                  rows={1}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                  placeholder="Type your reply…"
                  className="flex-1 resize-none max-h-28 rounded-lg border border-border px-3 py-2 text-sm bg-background"
                />
                <Button
                  onClick={sendReply}
                  disabled={!reply.trim() || sending}
                  className="gap-1.5 bg-teal hover:bg-teal"
                >
                  <Send className="h-4 w-4" /> Send
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
