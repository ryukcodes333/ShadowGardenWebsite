import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";
import { useGetChatMessages, useSendMessage, getGetChatMessagesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { Send } from "lucide-react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export default function Chat() {
  const [draft, setDraft] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useGetChatMessages(undefined, { query: { queryKey: getGetChatMessagesQueryKey(), staleTime: 5_000 } as any });
  const sendMutation = useSendMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) return;
    const sb = createClient(supabaseUrl, supabaseAnonKey);
    const channel = sb
      .channel("sg-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sg_chat_messages" }, () => {
        queryClient.invalidateQueries({ queryKey: getGetChatMessagesQueryKey() });
      })
      .subscribe();
    return () => { void sb.removeChannel(channel); };
  }, [queryClient]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || sendMutation.isPending) return;
    sendMutation.mutate(
      { data: { content: draft.trim() } },
      {
        onSuccess: () => {
          setDraft("");
          queryClient.invalidateQueries({ queryKey: getGetChatMessagesQueryKey() });
        },
      }
    );
  };

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ParticleBackground />
      <Navbar />

      <div className="relative z-10 flex flex-col flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 pt-20 pb-4">
        <div className="text-center py-6">
          <h1 className="text-3xl font-black text-white">
            Community <span className="text-red-500">Chat</span>
          </h1>
          <p className="text-white/35 text-sm mt-1">Real-time chat with Shadow Garden members</p>
        </div>

        {/* Messages */}
        <div className="flex-1 glass-card rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col" style={{ minHeight: "60vh" }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "60vh" }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((msg) => {
                const isMe = user?.id === msg.user_id;
                return (
                  <div key={msg.id} className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-900/60 to-red-700/40 border border-white/10 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                      {msg.avatar_url
                        ? <img src={msg.avatar_url} alt="" className="w-full h-full object-cover" />
                        : msg.username.charAt(0).toUpperCase()}
                    </div>
                    <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? "items-end" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${isMe ? "text-red-400" : "text-red-500/80"}`}>
                          {msg.display_name}
                        </span>
                        <span className="text-white/25 text-[10px]">{fmt(msg.created_at)}</span>
                      </div>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-red-700/25 border border-red-800/30 text-white"
                          : "bg-white/[0.04] border border-white/[0.06] text-white/80"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <p className="text-white/30 text-sm">No messages yet</p>
                <p className="text-white/20 text-xs">Be the first to say hello!</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/[0.05] p-4">
            {user ? (
              <form onSubmit={handleSend} className="flex gap-3">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  data-testid="input-message"
                  maxLength={500}
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-red-700/50 focus:ring-1 focus:ring-red-700/20 transition-all text-sm"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sendMutation.isPending}
                  data-testid="button-send"
                  className="p-3 btn-primary rounded-xl text-white disabled:opacity-40 transition-all"
                >
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <p className="text-center text-sm text-white/35 py-2">
                <a href="/login" className="text-red-400 hover:text-red-300">Sign in</a> to join the conversation
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
