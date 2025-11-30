import React from "react";
import { Heart } from "lucide-react";
import fallbackImg from "../assets/image.png"; // make sure this path is correct

type MovieCardProps = {
  movie: {
    id: string;
    title: string;
    year: string;
    poster: string;
    type: string;
  };
  isFav: boolean;
  onToggle: (movie: any) => void;
};

export default function MovieCard({ movie, isFav, onToggle }: MovieCardProps) {

  // Log to debug why image may not show
  // console.log("Movie poster:", movie.poster);
  // console.log("Using fallback image:", fallbackImg);

  const imgSrc = movie.poster && movie.poster !== "N/A" ? movie.poster : fallbackImg;

  return (
    <div className="card relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer">

      {/* Poster */}
      <img
        src={imgSrc}
        alt={movie.title || "Movie Poster"}
        className="w-full h-60 object-cover"
        onError={(e) => {
          console.log("Image failed to load, using fallback");
          (e.currentTarget as HTMLImageElement).src = fallbackImg;
        }}
      />

      {/* Favorite Heart */}
      <button
        className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md hover:scale-110 transition-transform duration-200"
        onClick={() => onToggle(movie)}
        aria-label="toggle favorite"
      >
        <Heart
          size={24}
          fill={isFav ? "crimson" : "none"}
          color={isFav ? "crimson" : "#666"}
        />
      </button>

      {/* Info */}
      <div className="p-3 flex flex-col items-center text-center">
        <h4 className="text-lg font-bold text-gray-800 truncate">{movie.title}</h4>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
          <span>{movie.year}</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs uppercase font-semibold">
            {movie.type}
          </span>
        </div>
      </div>

    </div>
  );
}
