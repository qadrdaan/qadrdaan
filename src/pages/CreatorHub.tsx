"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Users, Crown, Plus, Layout, TrendingUp, Gift, ShieldAlert, BadgeCheck, Loader2, Search } from 'lucide-react';

const CreatorHub = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [hub, setHub] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [publicHubs, setPublicHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) fetchHubData();
  }, [user]);

  const fetchHubData = async () => {
    setLoading(true);
    try {
      // Check if user is a leader or member of a hub
      const { data: hubMember } = await (supabase
        .from("hub_members" as any)
        .select("hub_id, role")
        .eq("user_id", user!.id)
        .maybeSingle() as any);

      if (hubMember) {
        const { data: hubData } = await (supabase
          .from("creator_hubs" as any)
          .select("*")
          .eq("id", hubMember.hub_id)
          .single() as any);
        
        setHub(hubData);

        const { data: memberData } = await (supabase
          .from("hub_members" as any)
          .select("*, profiles:user_id(display_name, avatar_url, is_verified)")
          .eq("hub_id", hubMember.hub_id) as any);
        
        setMembers(memberData || []);
      } else {
        // Fetch public hubs to join
        const { data: hubs } = await (supabase
          .from("creator_hubs" as any)
          .select("*, profiles:leader_id(display_name)")
          .limit(10) as any);
        setPublicHubs(hubs || []);
      }
    } catch (err) {
      console.error("Error fetching hub data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHub = async () => {
    if (!profile?.is_verified) {
      toast.error("Only verified creators can lead a Hub.");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Hub name is required.");
      return;
    }

    setCreating(true);
    try {
      const { data: newHub, error: hubError } = await (supabase
        .from("creator_hubs" as any)
        .insert({
          leader_id: user!.id,
          name: form.name.trim(),
          description: form.description.trim() || null,
        })
        .select()
        .single() as any);

      if (hubError) throw hubError;

      await (supabase
        .from("hub_members" as any)
        .insert({
          hub_id: newHub.id,
          user_id: user!.id,
          role: 'leader'
        }) as any);

      toast.success("Poetry Family created successfully!");
      fetchHubData();
    } catch (error: any) {
      toast.error("Failed to create hub: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinHub = async (hubId: string) => {
    setJoining(hubId);
    try {
      const { error } = await (supabase
        .from("hub_members" as any)
        .insert({
          hub_id: hubId,
          user_id: user!.id,
          role: 'member'
        }) as any);

      if (error) throw error;

      toast.success("Joined the family!");
      fetchHubData();
    } catch (error: any) {
      toast.error("Failed to join: " + error.message);
    } finally {
      setJoining(null);
    }
  };

  if (authLoading || loading) return <div className="min-h-screen bg-background"><Navbar /><div className="pt-28 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div></div>;

  const isEligible = profile?.is_verified;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="h-48 bg-gradient-hero relative flex items-end">
        <div className="container mx-auto px-6 pb-6 relative z-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground flex items-center gap-3">
            <Crown className="w-8 h-8" /> Creator Hub
          </h1>
          <p className="font-body text-primary-foreground/80 mt-1">Build your poetry family and grow together.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {!hub ? (
          <div className="space-y-12">
            <div className="max-w-2xl mx-auto text-center space-y-8 py-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold text-foreground">Join a Poetry Family</h2>
                <p className="font-body text-muted-foreground">
                  Creator Hubs (Families) allow top poets to mentor others, host exclusive rooms, and share earnings.
                </p>
              </div>

              {!isEligible ? (
                <div className="p-6 bg-accent/5 border border-accent/20 rounded-3xl flex flex-col items-center gap-4">
                  <ShieldAlert className="w-10 h-10 text-accent" />
                  <p className="font-body text-sm text-foreground/80 max-w-md">
                    Only <strong>Verified Creators (Blue Badge)</strong> can lead a Hub. Apply for verification to unlock this feature.
                  </p>
                  <button onClick={() => navigate('/verification')} className="px-8 py-3 bg-accent text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-brand">Apply for Verification</button>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
                  <h3 className="font-display text-xl font-bold">Start Your Own Family</h3>
                  <div className="space-y-4">
                    <input 
                      placeholder="Hub Name (e.g. The Ghazal Masters)" 
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 outline-none font-body" 
                    />
                    <textarea 
                      placeholder="Hub Description" 
                      value={form.description}
                      onChange={(e) => setForm({...form, description: e.target.value})}
                      rows={3} 
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 outline-none font-body resize-none" 
                    />
                  </div>
                  <button 
                    onClick={handleCreateHub}
                    disabled={creating}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold uppercase text-xs tracking-widest shadow-brand hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    Create Hub (Free for Blue Badge)
                  </button>
                </div>
              )}
            </div>

            {/* Public Hubs List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold">Discover Families</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input placeholder="Search hubs..." className="pl-10 pr-4 py-2 rounded-xl bg-muted/50 border-none text-sm font-body focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicHubs.map((h) => (
                  <motion.div key={h.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center text-xl font-bold text-white mb-4">
                      {h.name[0]}
                    </div>
                    <h3 className="font-display text-lg font-bold mb-1">{h.name}</h3>
                    <p className="font-body text-xs text-muted-foreground mb-4 line-clamp-2">{h.description || "A community of passionate poets."}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="font-body text-[10px] text-muted-foreground uppercase font-bold">Leader: {h.profiles?.display_name}</span>
                      <button 
                        onClick={() => handleJoinHub(h.id)}
                        disabled={joining === h.id}
                        className="px-4 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                      >
                        {joining === h.id ? "Joining..." : "Join"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            <div className="space-y-8">
              {/* Hub Header */}
              <div className="bg-card border border-border rounded-3xl p-8 flex items-center gap-6 shadow-sm">
                <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center text-3xl font-bold text-white">
                  {hub.name[0]}
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">{hub.name}</h2>
                  <p className="font-body text-sm text-muted-foreground">{hub.description}</p>
                </div>
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-2xl p-6 text-center">
                  <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="font-display text-xl font-bold text-foreground">12.4K</p>
                  <p className="font-body text-[10px] text-muted-foreground uppercase font-bold">Team Score</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 text-center">
                  <Gift className="w-5 h-5 text-secondary mx-auto mb-2" />
                  <p className="font-display text-xl font-bold text-foreground">850</p>
                  <p className="font-body text-[10px] text-muted-foreground uppercase font-bold">Gifts Today</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 text-center">
                  <Layout className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="font-display text-xl font-bold text-foreground">5/5</p>
                  <p className="font-body text-[10px] text-muted-foreground uppercase font-bold">Active Rooms</p>
                </div>
              </div>

              {/* Members List */}
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold">Team Members</h3>
                  <button className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Invite Poet</button>
                </div>
                <div className="divide-y divide-border">
                  {members.map((m) => (
                    <div key={m.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                          {m.profiles?.avatar_url ? <img src={m.profiles.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-brand text-white text-xs font-bold">{m.profiles?.display_name[0]}</div>}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="font-body text-sm font-bold text-foreground">{m.profiles?.display_name}</p>
                            {m.profiles?.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-secondary" />}
                          </div>
                          <p className="font-body text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{m.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-sm font-bold text-secondary">2.1K Gems</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="bg-gradient-brand rounded-3xl p-6 text-white shadow-brand">
                <h3 className="font-display text-lg font-bold mb-2">Hub Leaderboard</h3>
                <p className="font-body text-xs text-white/80 mb-4">Your hub is currently ranked <strong>#12</strong> globally.</p>
                <button className="w-full py-2 bg-white text-primary rounded-xl text-[10px] font-bold uppercase tracking-widest">View Rankings</button>
              </div>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CreatorHub;