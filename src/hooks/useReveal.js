import { useEffect, useRef, useState } from 'react';

// HOOK REVEAL BERBASIS INTERSECTION OBSERVER (SEKALI JALAN)
// threshold: 0 dengan rootMargin: '0px 0px -10% 0px' agar elemen tinggi dipicu saat bagian atas masuk viewport
export const useReveal = (options = {}) => {
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

        // Cek visibilitas awal: untuk section yang lebih tinggi dari layar atau sudah dalam viewport
        const checkVisibility = () => {
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            // Dipicu saat bagian atasnya masuk viewport
            return rect.top <= windowHeight * 0.95 && rect.bottom >= 0;
        };

        if (checkVisibility()) {
            setIsRevealed(true);
            return;
        }

        // Gunakan threshold: 0 dengan rootMargin: '0px 0px -10% 0px'
        const observerOptions = {
            threshold: 0,
            rootMargin: '0px 0px -10% 0px',
            ...options,
            threshold: 0
        };

        const observer = new IntersectionObserver(([entry]) => {
            if (entry && (entry.isIntersecting || entry.intersectionRatio > 0)) {
                setIsRevealed(true);
                observer.unobserve(el);
            }
        }, observerOptions);

        observer.observe(el);

        // Fallback cadangan scroll & resize: jika bagian atas masuk viewport
        const handleScrollOrResize = () => {
            if (checkVisibility()) {
                setIsRevealed(true);
                observer.unobserve(el);
                cleanup();
            }
        };

        // Fallback: jika setelah 1,5 detik elemen sudah berada di viewport tapi masih tersembunyi, tampilkan paksa
        const fallbackTimer = setTimeout(() => {
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            if (rect.top < windowHeight && rect.bottom > 0) {
                setIsRevealed(true);
                observer.unobserve(el);
                cleanup();
            }
        }, 1500);

        const cleanup = () => {
            window.removeEventListener('scroll', handleScrollOrResize);
            window.removeEventListener('resize', handleScrollOrResize);
            clearTimeout(fallbackTimer);
        };

        window.addEventListener('scroll', handleScrollOrResize, { passive: true });
        window.addEventListener('resize', handleScrollOrResize, { passive: true });

        return () => {
            if (el) observer.unobserve(el);
            cleanup();
        };
    }, []);

    return [ref, isRevealed];
};

export default useReveal;

