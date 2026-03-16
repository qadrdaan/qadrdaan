import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search, X } from "lucide-react";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<{ posts: any[]; profiles: any[]; books: any[] }>({ posts: [], profiles: [], books: [] });
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults({ posts: [], profiles: [], books: [] }); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const q = `%${query}%`;
      const [profiles, posts, books] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, followers_count, is_verified").ilike("display_name", q).limit(5),
        supabase.from("poetry_posts").select("id, title, category").ilike("title", q).limit(5),
        supabase.from("books").select("id, title").ilike("title", q).limit(5),
      ]);
      setResults({ profiles: profiles.data || [], posts: posts.data || [], books: books.data || [] });
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasResults = results.profiles.length > 0 || results.posts.length > 0 || results.books.length > 0;

  return (
    <div ref={ref} className="relative hidden md:block">
      <div className="flex items-center bg-primary-foreground/10 rounded-lg px-3 py-1.5">
        <Search className="w-4 h-4 text-primary-foreground/50 mr-2" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search..."
          className="bg-transparent text-sm text-primary-foreground font-body placeholder:text-primary-foreground/40 focus:outline-none w-40"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} className="text-primary-foreground/50 hover:text-primary-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-card border border-border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-center font-body text-xs text-muted-foreground">Searching...</p>
          ) : !hasResults ? (
            <p className="p-4 text-center font-body text-xs text-muted-foreground">No results</p>
          ) : (
            <>
              {results.profiles.length > 0 && (
                <div>
                  <p className="px-3 pt-2 pb-1 text-[10px] font-body text-muted-foreground uppercase tracking-wider">Poets</p>
                  {results.profiles.map((p: any) => (
                    <Link key={p.user_id} to={`/poet/${p.user_id}`} onClick={() => setOpen(false)}
                      className="block px-3 py-2 hover:bg-muted transition-colors">
                      <span className="font-body text-sm text-foreground">{p.display_name}</span>
                      <span className="font-body text-xs text-muted-foreground ml-2">{p.followers_count} followers</span>
                    </Link>
                  ))}
                </div>
              )}
              {results.posts.length > 0 && (
                <div>
                  <p className="px-3 pt-2 pb-1 text-[10px] font-body text-muted-foreground uppercase tracking-wider">Posts</p>
                  {results.posts.map((p: any) => (
                    <Link key={p.id} to={`/post/${p.id}`} onClick={() => setOpen(false)}
                      className="block px-3 py-2 hover:bg-muted transition-colors">
                      <span className="font-body text-sm text-foreground">{p.title}</span>
                      {p.category && <span className="font-body text-xs text-muted-foreground ml-2 capitalize">{p.category}</span>}
                    </Link>
                  ))}
                </div>
              )}
              {results.books.length > 0 && (
                <div>
                  <p className="px-3 pt-2 pb-1 text-[10px] font-body text-muted-foreground uppercase tracking-wider">Books</p>
                  {results.books.map((b: any) => (
                    <Link key={b.id} to={`/book/${b.id}`} onClick={() => setOpen(false)}
                      className="block px-3 py-2 hover:bg-muted transition-colors">
                      <span className="font-body text-sm text-foreground">{b.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
