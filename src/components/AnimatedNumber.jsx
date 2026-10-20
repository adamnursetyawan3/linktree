import React, { useState, useEffect, useRef } from 'react';

// COUNT-UP DARI 0 SAAT PERTAMA MUNCUL DI LAYAR
const AnimatedNumber = ({ value, duration = 650 }) => {
    const [displayStr, setDisplayStr] = useState(String(value ?? ''));
    const hasAnimatedRef = useRef(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const raw = String(value ?? '').trim();
        // Cek apakah mengandung angka
        const match = raw.match(/(\d+[\d.,]*)/);
        if (!match) {
            setDisplayStr(raw);
            return;
        }

        // Hormati prefers-reduced-motion
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setDisplayStr(raw);
            return;
        }

        const numberStr = match[1].replace(/,/g, '');
        const targetNum = parseInt(numberStr, 10);
        if (isNaN(targetNum)) {
            setDisplayStr(raw);
            return;
        }

        const prefix = raw.slice(0, match.index);
        const suffix = raw.slice((match.index || 0) + match[1].length);

        if (hasAnimatedRef.current) {
            setDisplayStr(raw);
            return;
        }

        let startTimestamp = null;
        let animationId;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Easing cubic out
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * targetNum);

            setDisplayStr(`${prefix}${current}${suffix}`);

            if (progress < 1) {
                animationId = requestAnimationFrame(step);
            } else {
                setDisplayStr(raw);
                hasAnimatedRef.current = true;
            }
        };

        animationId = requestAnimationFrame(step);

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [value, duration]);

    return (
        <span ref={elementRef} className="tabular-nums">
            {displayStr}
        </span>
    );
};

export default AnimatedNumber;
