import { useQuery } from "@tanstack/react-query";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export function useMovieSearch(q: string, page: number) {
  return useQuery({
    queryKey: ["movies", q, page],
    enabled: !!q,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/movies/search?q=${encodeURIComponent(q)}&page=${page}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    }
  });
}
