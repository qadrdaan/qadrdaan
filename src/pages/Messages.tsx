import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Send, Search, ArrowLeft, MessageCircle } from "lucide-react";

interface Conversation {
  id: string;
  other_user: { user_id: string; display_name: string; avatar_url: string | null; is_verified: boolean };
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
}

const Messages = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      setLoadingConvs(true);
      const { data: participations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (!participations?.length) { setLoadingConvs(false); return; }

      const convIds = participations.map((p) => p.conversation_id);
      const convs: Conversation[] = [];

      for (const convId of convIds) {
        const { data: participants } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", convId)
          .neq("user_id", user.id);

        if (!participants?.length) continue;

        const otherUserId = participants[0].user_id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, is_verified")
          .eq("user_id", otherUserId)
          .single();

        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (profile) {
          convs.push({
            id: convId,
            other_user: profile,
            last_message: lastMsg?.content,
            last_message_at: lastMsg?.created_at,
          });
        }
      }

      convs.sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime());
      setConversations(convs);
      setLoadingConvs(false);
    };
    fetchConversations();
  }, [user]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConv) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConv.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`messages-${activeConv.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConv.id}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConv]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !activeConv) return;
    const msg = newMessage.trim();
    setNewMessage("");
    await supabase.from("messages").insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      content: msg,
    });
    // Update conversation timestamp
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", activeConv.id);
  };

  const handleSearchUser = async (q: string) => {
    setSearchUser(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, is_verified")
      .ilike("display_name", `%${q}%`)
      .neq("user_id", user?.id || "")
      .limit(5);
    setSearchResults(data || []);
  };

  const startConversation = async (otherUser: any) => {
    if (!user) return;
    // Check existing conversation
    const existing = conversations.find((c) => c.other_user.user_id === otherUser.user_id);
    if (existing) {
      setActiveConv(existing);
      setShowMobileList(false);
      setSearchUser("");
      setSearchResults([]);
      return;
    }

    // Create new conversation
    const { data: conv, error } = await supabase.from("conversations").insert({}).select().single();
    if (error || !conv) { toast.error("Failed to start conversation"); return; }

    await supabase.from("conversation_participants").insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: otherUser.user_id },
    ]);

    const newConv: Conversation = { id: conv.id, other_user: otherUser };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConv(newConv);
    setShowMobileList(false);
    setSearchUser("");
    setSearchResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 h-screen flex flex-col">
        <div className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full">
          {/* Conversations List */}
          <aside className={`${showMobileList ? "flex" : "hidden"} md:flex flex-col w-full md:w-80 lg:w-96 border-r border-border bg-card`}>
            <div className="p-4 border-b border-border">
              <h1 className="font-display text-xl font-bold text-foreground mb-3">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={searchUser}
                  onChange={(e) => handleSearchUser(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted font-body text-sm border-none focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 bg-card border border-border rounded-xl overflow-hidden">
                  {searchResults.map((u) => (
                    <button key={u.user_id} onClick={() => startConversation(u)} className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {(u.display_name || "?")[0].toUpperCase()}
                      </div>
                      <span className="font-body text-sm font-bold text-foreground truncate">{u.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="p-4 text-center font-body text-sm text-muted-foreground">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-body text-sm text-muted-foreground">No conversations yet</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">Search for a user to start chatting</p>
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setActiveConv(c); setShowMobileList(false); }}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors border-b border-border/50 ${activeConv?.id === c.id ? "bg-muted" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {c.other_user.avatar_url ? (
                        <img src={c.other_user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (c.other_user.display_name || "?")[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-body text-sm font-bold text-foreground truncate">{c.other_user.display_name}</p>
                      {c.last_message && (
                        <p className="font-body text-xs text-muted-foreground truncate">{c.last_message}</p>
                      )}
                    </div>
                    {c.last_message_at && (
                      <span className="font-body text-[10px] text-muted-foreground shrink-0">
                        {new Date(c.last_message_at).toLocaleDateString()}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* Message Thread */}
          <main className={`${!showMobileList ? "flex" : "hidden"} md:flex flex-col flex-1 bg-background`}>
            {activeConv ? (
              <>
                <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
                  <button onClick={() => setShowMobileList(true)} className="md:hidden p-1">
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {activeConv.other_user.avatar_url ? (
                      <img src={activeConv.other_user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (activeConv.other_user.display_name || "?")[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-body text-sm font-bold text-foreground">{activeConv.other_user.display_name}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl font-body text-sm ${
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-border bg-card">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-muted font-body text-sm border-none focus:ring-1 focus:ring-primary outline-none"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim()}
                      className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="font-display text-lg font-bold text-foreground/50">Select a conversation</p>
                  <p className="font-body text-sm text-muted-foreground mt-1">or search for a user to start chatting</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Messages;
