"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, BadgeCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const CreatorsSection = () => {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_creator", true)
        .order("followers_count", { ascending: false })
        .limit(4);
      
      if (data) setCreators(data);
      setLoading(false);
    };
    fetchCreators();
  }, []);

  return (
    <section id="creators" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-body text-sm tracking-[0.2em] uppercase text-secondary mb-3">Featured Poets</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Rising <span className="text-gradient-brand">Voices</span>
          </h2>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {creators.map((poet, i) => (
              <motion.div
                key={poet.id}
                className="group relative p-6 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-brand text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/poet/${poet.user_id}`}>
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform overflow-hidden">
                    {poet.avatar_url ? (
                      <img src={poet.avatar_url} className="w-full h-full object-cover" alt={poet.display_name} />
                    ) : (
                      <span className="font-display text-2xl font-bold text-white">{(poet.display_name || "?")[0]}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{poet.display_name}</h3>
                    {poet.is_verified && <BadgeCheck className="w-4 h-4 text-secondary" />}
                  </div>
                  <p className="font-body text-sm text-muted-foreground mb-4">{poet.language || "Global"}</p>

                  <div className="flex items-center justify-center gap-4 text-sm font-body text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{poet.books_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{poet.followers_count}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CreatorsSection;