import React, { useEffect, useRef, useState } from 'react';

// GARIS PEMISAH DENGAN SVG LINE-DRAW SAAT MASUK VIEWPORT
const SectionDivider = ({ label = "PROJECT" }) => {
    const [inView, setInView] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        // Hormati prefers-reduced-motion
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.25 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="section-divider-container" aria-label={label}>
            <svg className="divider-svg divider-svg-left" viewBox="0 0 200 2" preserveAspectRatio="none">
                <line
                    x1="0"
                    y1="1"
                    x2="200"
                    y2="1"
                    stroke="var(--blue-7)"
                    strokeWidth="1.5"
                    strokeDasharray="200"
                    className={`divider-line-left ${inView ? 'drawn' : ''}`}
                />
            </svg>
            <span className="section-divider-badge">{label}</span>
            <svg className="divider-svg divider-svg-right" viewBox="0 0 200 2" preserveAspectRatio="none">
                <line
                    x1="0"
                    y1="1"
                    x2="200"
                    y2="1"
                    stroke="var(--blue-7)"
                    strokeWidth="1.5"
                    strokeDasharray="200"
                    className={`divider-line-right ${inView ? 'drawn' : ''}`}
                />
            </svg>
        </div>
    );
};

export default SectionDivider;
