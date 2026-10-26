// src/useScrollReveal.js
import { useEffect, useRef } from 'react';

export default function useScrollReveal({ threshold = 0.05, rootMargin = '0px 0px -40px 0px' } = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('is-revealed');
        observer.unobserve(el);
      }
    }, { threshold, rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);
  return ref;
}
