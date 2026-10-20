import { useState, useEffect } from 'react';

// HOOK SCROLL PROGRESS (0..1) DENGAN REQUEST ANIMATION FRAME & PASSIVE LISTENER
export const useScrollProgress = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let ticking = false;

        const updateScroll = () => {
            const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollTotal <= 0) {
                setProgress(0);
                return;
            }
            const currentProgress = Math.min(1, Math.max(0, window.scrollY / scrollTotal));
            setProgress(currentProgress);
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScroll);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        updateScroll();

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return progress;
};

export default useScrollProgress;
