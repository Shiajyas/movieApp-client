

import React from 'react';
export default function SearchBar({ value, onChange }: { value:string, onChange:(v:string)=>void }) {
  return <input className="search-input" placeholder="Search movies..." value={value} onChange={e => onChange(e.target.value)} />;
}
