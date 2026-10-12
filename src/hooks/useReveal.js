import { useEffect, useRef, useState } from 'react';

// HOOK REVEAL BERBASIS INTERSECTION OBSERVER (SEKALI JALAN)
export const useReveal = (options = { threshold: 0.15 }) => {
    const ref = useRef(null);
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        // Hormati prefers-reduced-motion: langsung tampil tanpa menunggu observer
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setIsRevealed(true);
            return;
        }

        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsRevealed(true);
                observer.unobserve(el);
            }
        }, options);

        observer.observe(el);

        return () => {
            if (el) observer.unobserve(el);
        };
    }, [options]);

    return [ref, isRevealed];
};

export default useReveal;
