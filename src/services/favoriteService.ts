const API = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:4000/api';

export async function fetchFavorites(page = 1, limit = 10) {
  const userId = localStorage.getItem("userId");
  const res = await fetch(
    `${API}/movies/favorites?userId=${userId}&page=${page}&limit=${limit}`
  );
  return res.json();
}

export async function addFavorite(movie: any) {
  const userId = localStorage.getItem("userId");
  const res = await fetch(`${API}/movies/favorites?userId=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movie),
  });
  return res.json();
}

export async function removeFavorite(imdbID: string) {
  const userId = localStorage.getItem("userId");
  const res = await fetch(`${API}/movies/favorites/${imdbID}?userId=${userId}`, {
    method: 'DELETE',
  });
  return res.json();
}
