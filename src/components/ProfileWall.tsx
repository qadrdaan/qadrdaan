"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PostCard from './PostCard';
import CreatePostBox from './CreatePostBox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenLine, Video, Image as ImageIcon, Mic, Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileWallProps {
  userId: string;
  isOwnProfile?: boolean;
}

const ProfileWall = ({ userId, isOwnProfile }: ProfileWallProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [mushairas, setMushairas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("poetry_posts")
      .select("*")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("user_id", userId).single();
      setPosts(data.map(p => ({ ...p, creator_name: profile?.display_name || "Poet" })));
    }
    setLoading(false);
  }, [userId]);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("videos").select("*").eq("creator_id", userId).order("created_at", { ascending: false });
    setVideos(data || []);
    setLoading(false);
  }, [userId]);

  const fetchMushairas = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("mushaira_events").select("*").eq("organizer_id", userId).order("scheduled_at", { ascending: false });
    setMushairas(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (activeTab === "posts") fetchPosts();
    else if (activeTab === "videos") fetchVideos();
    else if (activeTab === "mushairas") fetchMushairas();
  }, [userId, activeTab, fetchPosts, fetchVideos, fetchMushairas]);

  return (
    <div className="space-y-6">
      {isOwnProfile && activeTab === "posts" && (
        <CreatePostBox onPostCreated={fetchPosts} />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="posts" className="gap-2 text-xs font-bold uppercase tracking-wider">
            <PenLine className="w-3.5 h-3.5" /> Posts
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2 text-xs font-bold uppercase tracking-wider">
            <Video className="w-3.5 h-3.5" /> Videos
          </TabsTrigger>
          <TabsTrigger value="photos" className="gap-2 text-xs font-bold uppercase tracking-wider">
            <ImageIcon className="w-3.5 h-3.5" /> Photos
          </TabsTrigger>
          <TabsTrigger value="mushairas" className="gap-2 text-xs font-bold uppercase tracking-wider">
            <Mic className="w-3.5 h-3.5" /> Mushairas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
              <PenLine className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-body text-muted-foreground">No posts shared yet.</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={fetchPosts} showDelete={isOwnProfile} />
            ))
          )}
        </TabsContent>

        <TabsContent value="videos" className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : videos.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-card border border-dashed border-border rounded-2xl">
              <Video className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-body text-muted-foreground">No videos uploaded yet.</p>
            </div>
          ) : (
            videos.map((video) => (
              <Link key={video.id} to={`/video/${video.id}`} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-video bg-muted relative">
                  {video.thumbnail_url && <img src={video.thumbnail_url} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-body font-bold text-sm truncate">{video.title}</h4>
                  <p className="font-body text-[10px] text-muted-foreground uppercase mt-1">{video.views_count} views</p>
                </div>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-body text-muted-foreground">Photos feature coming soon.</p>
          </div>
        </TabsContent>

        <TabsContent value="mushairas" className="mt-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : mushairas.length === 0 ? (
            <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
              <Mic className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-body text-muted-foreground">No Mushaira events hosted yet.</p>
            </div>
          ) : (
            mushairas.map((event) => (
              <Link key={event.id} to={`/mushaira/${event.id}`} className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-foreground truncate">{event.title}</h4>
                  <p className="font-body text-xs text-muted-foreground">{new Date(event.scheduled_at).toLocaleDateString()} · {event.event_type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${event.status === 'live' ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {event.status}
                </span>
              </Link>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileWall;