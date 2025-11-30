

import { useEffect, useState } from 'react';
export default function useDebounce<T>(value:T, delay=500){
  const [deb, setDeb] = useState(value);
  useEffect(()=>{
    const id = setTimeout(()=>setDeb(value), delay);
    return ()=>clearTimeout(id);
  }, [value, delay]);
  return deb;
}
