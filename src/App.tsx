import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import MovieCard from "./components/MovieCard";
import useDebounce from "./hooks/useDebounce";
import { fetchFavorites, addFavorite, removeFavorite } from "./services/favoriteService";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = (import.meta.env?.VITE_API_BASE as string) || "http://localhost:4000/api";
const PAGE_LIMIT = 15;

const getUserId = () => {
  let id = localStorage.getItem("userId");
  if (!id) {
    id = Math.random().toString(36).substring(2);
    localStorage.setItem("userId", id);
  }
  return id;
};
getUserId();

export default function App() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 600);

  const [movies, setMovies] = useState<any[]>([]);
  const [moviePage, setMoviePage] = useState(1);
  const [movieTotalPages, setMovieTotalPages] = useState(1);
  const [loadingMovies, setLoadingMovies] = useState(false);

  const [favorites, setFavorites] = useState<any[]>([]);
  const [favPage, setFavPage] = useState(1);
  const [favTotalPages, setFavTotalPages] = useState(1);
  const [loadingFav, setLoadingFav] = useState(false);

  const [recent, setRecent] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync URL → state
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const page = Number(searchParams.get("page") || 1);
    setQuery(q);
    setMoviePage(page);
  }, [searchParams]);

  // Track recent searches
  useEffect(() => {
    if (debounced) {
      setRecent((prev) => {
        const updated = [debounced, ...prev.filter((x) => x !== debounced)];
        return updated.slice(0, 5);
      });
    }
  }, [debounced]);

  // Apply recent search click
  const applyRecent = (text: string) => {
    setQuery(text);
    setSearchParams({ q: text, page: "1" });
  };

  // Fetch movies
  useEffect(() => {
    if (!debounced) {
      setMovies([]);
      setMovieTotalPages(1);
      return;
    }
    setLoadingMovies(true);
    fetch(`${API_BASE}/movies/search?q=${encodeURIComponent(debounced)}&page=${moviePage}`)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.results || []);
        setMovieTotalPages(data.totalPages || 1);
      })
      .catch(() => {
        setMovies([]);
        setMovieTotalPages(1);
      })
      .finally(() => setLoadingMovies(false));
  }, [debounced, moviePage]);

  // Favorites
  const loadFavorites = (page = 1) => {
    setLoadingFav(true);
    fetchFavorites(page, PAGE_LIMIT)
      .then((data) => {
        setFavorites(data.results || []);
        setFavTotalPages(data.totalPages || 1);
        setFavPage(page);
      })
      .catch(() => setFavorites([]))
      .finally(() => setLoadingFav(false));
  };
  useEffect(() => loadFavorites(), []);

  const isFav = (id: string) => favorites.some((f) => f.id === id);

  const toggleFav = async (movie: any) => {
    const id = movie.id || movie.imdbID;
    if (isFav(id)) {
      await removeFavorite(id);
      toast.error("Removed from favorites");
    } else {
      await addFavorite({
        id,
        title: movie.title || movie.Title,
        year: movie.year || movie.Year,
        poster: movie.poster || movie.Poster,
        type: movie.type || movie.Type,
      });
      toast.success("Added to favorites!");
    }
    loadFavorites(favPage);
  };

  const handleMoviePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > movieTotalPages) return;
    setMoviePage(newPage);
    setSearchParams({ q: debounced, page: newPage.toString() });
  };

  const handleFavPageChange = (newPage: number) => {
    if (newPage < 1 || newPage > favTotalPages) return;
    loadFavorites(newPage);
  };

  // Pagination Component
  const Pagination = ({ current, total, onChange }: any) => {
    const [input, setInput] = useState(current);
    if (total <= 1) return null;
    const jump = () => {
      const page = Number(input);
      if (page >= 1 && page <= total) onChange(page);
    };
    return (
      <div className="pagination" style={{ marginTop: 10 }}>
        <button disabled={current <= 1} onClick={() => onChange(current - 1)}>Prev</button>
        <span style={{ margin: "0 8px" }}>{current} / {total}</span>
        <button disabled={current >= total} onClick={() => onChange(current + 1)}>Next</button>
        <input
          type="number"
          min={1}
          max={total}
          value={input}
          onChange={(e) => setInput(Number(e.target.value))}
          style={{ width: 50, marginLeft: 8 }}
        />
        <button onClick={jump}>Go</button>
      </div>
    );
  };

  return (
    <div className="app">
      <ToastContainer position="top-center" autoClose={2000} theme="dark" />

      <header className="header">
        <h1>Movie Search</h1>
        <SearchBar value={query} onChange={setQuery} />
      </header>

      <main className="main-content">

        {/* 🔍 SEARCH RESULTS */}
        <section>
          <h2>Search Results</h2>
          {loadingMovies && <p className="loading fade-in">⏳ Loading...</p>}

          {!debounced && recent.length > 0 && (
            <div className="fade-in" style={{ marginBottom: 15 }}>
              <h4 style={{ margin: "5px 0" }}>Recent Searches:</h4>
              {recent.map((r) => (
                <span key={r} className="recent-chip" onClick={() => applyRecent(r)}>
                  🔍 {r}
                </span>
              ))}
            </div>
          )}

          {!debounced && !loadingMovies && (
            <p className="fade-in" style={{ textAlign: "center", marginTop: 20, fontSize: 18 }}>
              🔍 <strong>Start typing</strong> to search for movies
            </p>
          )}

          {debounced && !loadingMovies && movies.length === 0 && (
            <p className="fade-in" style={{ textAlign: "center", marginTop: 20, fontSize: 18 }}>
              ❌ <strong>No movies found</strong><br />Try a different keyword
            </p>
          )}

          <div className="grid fade-in">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} isFav={isFav(m.id)} onToggle={toggleFav} />
            ))}
          </div>

          {movies.length > 0 && (
            <Pagination current={moviePage} total={movieTotalPages} onChange={handleMoviePageChange} />
          )}
        </section>

        {/* ⭐ FAVORITES */}
        <section style={{ marginTop: 40 }}>
          <h2>Your Favorites</h2>
          {loadingFav && <p className="loading fade-in">⏳ Loading...</p>}

          {!loadingFav && favorites.length === 0 && (
            <p className="fade-in" style={{ textAlign: "center", marginTop: 20, fontSize: 18 }}>
              ⭐ <strong>No favorites yet</strong><br />Add movies to build your list!
            </p>
          )}

          <div className="grid fade-in">
            {favorites.map((f) => (
              <MovieCard key={f.id} movie={f} isFav onToggle={toggleFav} />
            ))}
          </div>

          {favorites.length > 0 && (
            <Pagination current={favPage} total={favTotalPages} onChange={handleFavPageChange} />
          )}
        </section>
      </main>
    </div>
  );
}
