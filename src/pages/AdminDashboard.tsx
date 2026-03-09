import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface CoinPurchase {
  id: string;
  user_id: string;
  amount: number;
  price: number;
  status: string;
  payment_method: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<CoinPurchase[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();
      
      if (!data) {
        toast.error("Access denied: Admin only");
        navigate("/");
        return;
      }
      setIsAdmin(true);
    };

    if (user) checkAdmin();
  }, [user, navigate]);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!isAdmin) return;
      setLoadingData(true);
      const { data, error } = await supabase
        .from("coin_purchases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load purchases");
        setLoadingData(false);
        return;
      }

      // Fetch profiles separately
      const userIds = [...new Set(data?.map(p => p.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      
      const purchasesWithProfiles = (data || []).map(purchase => ({
        ...purchase,
        profiles: profilesMap.get(purchase.user_id) || null,
      }));

      setPurchases(purchasesWithProfiles);
      setLoadingData(false);
    };

    if (isAdmin) fetchPurchases();
  }, [isAdmin]);

  const handleApprove = async (purchase: CoinPurchase) => {
    setProcessing(purchase.id);
    
    // Update purchase status
    const { error: updateError } = await supabase
      .from("coin_purchases")
      .update({ status: "completed" })
      .eq("id", purchase.id);

    if (updateError) {
      toast.error("Failed to approve purchase");
      setProcessing(null);
      return;
    }

    // Update user balance
    const { data: balance } = await supabase
      .from("user_balances")
      .select("coins")
      .eq("user_id", purchase.user_id)
      .single();

    if (balance) {
      await supabase
        .from("user_balances")
        .update({ coins: balance.coins + purchase.amount })
        .eq("user_id", purchase.user_id);
    } else {
      await supabase
        .from("user_balances")
        .insert({ user_id: purchase.user_id, coins: purchase.amount });
    }

    toast.success("Purchase approved!");
    setPurchases(purchases.map(p => p.id === purchase.id ? { ...p, status: "completed" } : p));
    setProcessing(null);
  };

  const handleReject = async (purchase: CoinPurchase) => {
    setProcessing(purchase.id);
    
    const { error } = await supabase
      .from("coin_purchases")
      .update({ status: "rejected" })
      .eq("id", purchase.id);

    if (error) {
      toast.error("Failed to reject purchase");
    } else {
      toast.success("Purchase rejected");
      setPurchases(purchases.map(p => p.id === purchase.id ? { ...p, status: "rejected" } : p));
    }
    setProcessing(null);
  };

  if (loading || loadingData || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const pendingPurchases = purchases.filter(p => p.status === "pending");
  const recentPurchases = purchases.slice(0, 20);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="font-body text-muted-foreground">Manage coin purchase requests</p>
          </div>

          {/* Pending Purchases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" />
                Pending Purchases ({pendingPurchases.length})
              </CardTitle>
              <CardDescription>Review and approve or reject coin purchase requests</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPurchases.length === 0 ? (
                <p className="font-body text-muted-foreground text-center py-8">No pending purchases</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {purchase.profiles?.avatar_url ? (
                              <img
                                src={purchase.profiles.avatar_url}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary">
                                {(purchase.profiles?.display_name || "?")[0].toUpperCase()}
                              </div>
                            )}
                            <span className="font-body">{purchase.profiles?.display_name || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-body font-semibold">{purchase.amount} coins</TableCell>
                        <TableCell className="font-body">${purchase.price}</TableCell>
                        <TableCell className="font-body text-muted-foreground">
                          {new Date(purchase.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(purchase)}
                              disabled={processing === purchase.id}
                              className="p-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(purchase)}
                              disabled={processing === purchase.id}
                              className="p-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Purchases */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
              <CardDescription>All coin purchase history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {purchase.profiles?.avatar_url ? (
                            <img
                              src={purchase.profiles.avatar_url}
                              alt="Avatar"
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary">
                              {(purchase.profiles?.display_name || "?")[0].toUpperCase()}
                            </div>
                          )}
                          <span className="font-body">{purchase.profiles?.display_name || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-body font-semibold">{purchase.amount} coins</TableCell>
                      <TableCell className="font-body">${purchase.price}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-body font-medium ${
                            purchase.status === "completed"
                              ? "bg-green-500/10 text-green-600"
                              : purchase.status === "rejected"
                              ? "bg-red-500/10 text-red-600"
                              : "bg-secondary/10 text-secondary"
                          }`}
                        >
                          {purchase.status}
                        </span>
                      </TableCell>
                      <TableCell className="font-body text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
