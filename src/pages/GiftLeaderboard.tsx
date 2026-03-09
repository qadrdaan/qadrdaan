import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";

interface TopReceiver {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_gifts_received: number;
  is_verified: boolean;
}

interface TopSender {
  sender_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_coins_spent: number;
  is_verified: boolean;
}

const GiftLeaderboard = () => {
  const [receivers, setReceivers] = useState<TopReceiver[]>([]);
  const [senders, setSenders] = useState<TopSender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);

      // Fetch top receivers
      const { data: receiversData, error: receiversError } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, total_gifts_received, is_verified")
        .gt("total_gifts_received", 0)
        .order("total_gifts_received", { ascending: false })
        .limit(50);

      if (receiversError) {
        toast.error("Failed to load top receivers");
      } else {
        setReceivers(receiversData || []);
      }

      // Fetch top senders
      const { data: sendersData, error: sendersError } = await supabase
        .from("gifts")
        .select(`
          sender_id,
          coin_cost,
          profiles:sender_id (
            display_name,
            avatar_url,
            is_verified
          )
        `);

      if (sendersError) {
        toast.error("Failed to load top senders");
      } else if (sendersData) {
        // Aggregate by sender
        const senderMap = new Map<string, TopSender>();
        sendersData.forEach((gift: any) => {
          const senderId = gift.sender_id;
          const existing = senderMap.get(senderId);
          if (existing) {
            existing.total_coins_spent += gift.coin_cost;
          } else {
            senderMap.set(senderId, {
              sender_id: senderId,
              display_name: gift.profiles?.display_name || null,
              avatar_url: gift.profiles?.avatar_url || null,
              total_coins_spent: gift.coin_cost,
              is_verified: gift.profiles?.is_verified || false,
            });
          }
        });

        const sortedSenders = Array.from(senderMap.values())
          .sort((a, b) => b.total_coins_spent - a.total_coins_spent)
          .slice(0, 50);

        setSenders(sortedSenders);
      }

      setLoading(false);
    };

    fetchLeaderboards();
  }, []);

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-6 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-foreground mb-3">Gift Leaderboard</h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Celebrating the most generous supporters and beloved creators in our community
            </p>
          </div>

          <Tabs defaultValue="receivers" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="receivers" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Top Receivers
              </TabsTrigger>
              <TabsTrigger value="senders" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Top Senders
              </TabsTrigger>
            </TabsList>

            {/* Top Receivers */}
            <TabsContent value="receivers">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-secondary" />
                    Most Appreciated Creators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center font-body text-muted-foreground py-8">Loading...</p>
                  ) : receivers.length === 0 ? (
                    <p className="text-center font-body text-muted-foreground py-8">No data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {receivers.map((receiver, index) => (
                        <Link
                          key={receiver.user_id}
                          to={`/poet/${receiver.user_id}`}
                          className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-muted/50 border border-border transition-colors"
                        >
                          <span className="font-display text-2xl font-bold text-secondary w-12 text-center">
                            {getMedal(index)}
                          </span>
                          <div className="flex items-center gap-3 flex-1">
                            {receiver.avatar_url ? (
                              <img
                                src={receiver.avatar_url}
                                alt={receiver.display_name || "User"}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-primary font-bold">
                                {(receiver.display_name || "?")[0].toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-display text-lg font-semibold text-foreground">
                                  {receiver.display_name || "Anonymous"}
                                </span>
                                {receiver.is_verified && (
                                  <span className="text-secondary">✓</span>
                                )}
                              </div>
                              <p className="font-body text-sm text-muted-foreground">
                                Total gifts received
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-2xl font-bold text-secondary">
                              {receiver.total_gifts_received}
                            </p>
                            <p className="font-body text-xs text-muted-foreground">gifts</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Senders */}
            <TabsContent value="senders">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                    Most Generous Supporters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center font-body text-muted-foreground py-8">Loading...</p>
                  ) : senders.length === 0 ? (
                    <p className="text-center font-body text-muted-foreground py-8">No data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {senders.map((sender, index) => (
                        <Link
                          key={sender.sender_id}
                          to={`/poet/${sender.sender_id}`}
                          className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-muted/50 border border-border transition-colors"
                        >
                          <span className="font-display text-2xl font-bold text-secondary w-12 text-center">
                            {getMedal(index)}
                          </span>
                          <div className="flex items-center gap-3 flex-1">
                            {sender.avatar_url ? (
                              <img
                                src={sender.avatar_url}
                                alt={sender.display_name || "User"}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-primary font-bold">
                                {(sender.display_name || "?")[0].toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-display text-lg font-semibold text-foreground">
                                  {sender.display_name || "Anonymous"}
                                </span>
                                {sender.is_verified && (
                                  <span className="text-secondary">✓</span>
                                )}
                              </div>
                              <p className="font-body text-sm text-muted-foreground">
                                Total coins spent on gifts
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-2xl font-bold text-secondary">
                              {sender.total_coins_spent}
                            </p>
                            <p className="font-body text-xs text-muted-foreground">coins</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default GiftLeaderboard;
