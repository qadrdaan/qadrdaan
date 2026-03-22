"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PostCard from './PostCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenLine, Video, Image as ImageIcon, Mic, Loader2 } from 'lucide-react';

interface ProfileWallProps {
  userId: string;
  isOwnProfile?: boolean;
}

const ProfileWall = ({ userId, isOwnProfile }: ProfileWallProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  const fetchPosts = useCallback(async (reset = false) => {
    const currentPage = reset ? 0 : page;
    setLoading(true);
    
    const { data, error } = await supabase
      .from("poetry_posts")
      .select("*")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false })
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

    if (!error && data) {
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("user_id", userId).single();
      const enriched = data.map(p => ({ ...p, creator_name: profile?.display_name || "Poet" }));
      
      if (reset) setPosts(enriched);
      else setPosts(prev => [...prev, ...enriched]);
      
      setHasMore(data.length === PAGE_SIZE);
      if (!reset) setPage(prev => prev + 1);
    }
    setLoading(false);
  }, [userId, page]);

  useEffect(() => {
    fetchPosts(true);
  }, [userId]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="posts" className="w-full">
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
          {posts.length === 0 && !loading ? (
            <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
              <PenLine className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-body text-muted-foreground">No posts shared yet.</p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onUpdate={() => fetchPosts(true)} 
                  showDelete={isOwnProfile} 
                />
              ))}
              {hasMore && (
                <button
                  onClick={() => fetchPosts()}
                  disabled={loading}
                  className="w-full py-4 font-body text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More Posts"}
                </button>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
            <Video className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-body text-muted-foreground">No videos uploaded yet.</p>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-body text-muted-foreground">No photos shared yet.</p>
          </div>
        </TabsContent>

        <TabsContent value="mushairas" className="mt-6">
          <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
            <Mic className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-body text-muted-foreground">No Mushaira events hosted yet.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileWall;