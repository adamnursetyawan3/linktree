import React, { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { settings } from '../settings.js';

/**
 * ReticleStackRing - Cincin teks stack teknologi di celah antara bingkai tengah dan luar
 * SVG persegi tegak lurus (TIDAK berputar). Teks bergerak mengelilingi jalur via textPath startOffset.
 * 60 detik per keliling, linear, infinite, searah jarum jam.
 * Knockout stroke blue-9 3px, font JetBrains Mono 12px 500 uppercase.
 */
export const ReticleStackRing = forwardRef(({ isHeroPaused = false }, ref) => {
    const pathRef = useRef(null);
    const svgRef = useRef(null);
    const [pathLength, setPathLength] = useState(1162);
    const [isReducedMotion, setIsReducedMotion] = useState(false);

    useImperativeHandle(ref, () => svgRef.current);

    useEffect(() => {
        const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
        setIsReducedMotion(mql.matches);
        const onChange = (e) => setIsReducedMotion(e.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    // Ambil stack dari settings.profile.stack secara dinamis saat runtime
    const stackItems = useMemo(() => {
        if (!settings?.profile?.stack || !Array.isArray(settings.profile.stack)) {
            return [];
        }
        return settings.profile.stack.map(item => {
            if (typeof item === 'string') return item.toUpperCase();
            return (item.name || item.title || '').toUpperCase();
        }).filter(Boolean);
    }, []);

    // Ulangi teks agar menutupi 2 keliling penuh (tepat 2 kali panjang jalur)
    // 4 repetisi stack items memberikan kerapatan yang pas untuk 2 perimeter penuh
    const repeatedItems = useMemo(() => {
        if (stackItems.length === 0) return [];
        return [...stackItems, ...stackItems, ...stackItems, ...stackItems];
    }, [stackItems]);

    // Ukur panjang total path sebenarnya di DOM
    useEffect(() => {
        if (pathRef.current && typeof pathRef.current.getTotalLength === 'function') {
            const len = pathRef.current.getTotalLength();
            if (len > 0) {
                setPathLength(Math.round(len));
            }
        }
    }, []);

    // Kontrol jeda animasi SMIL saat hero tidak terlihat atau tab tidak aktif
    useEffect(() => {
        if (!svgRef.current) return;
        if (isHeroPaused) {
            svgRef.current.pauseAnimations?.();
        } else if (!isReducedMotion) {
            svgRef.current.unpauseAnimations?.();
        }
    }, [isHeroPaused, isReducedMotion]);

    // Jalur persegi sisi 293 membulat 6 tepat di tengah viewBox 450x450
    // Sisi jalur = rata-rata bingkai luar (316) dan tengah (270.18) = 293.09
    // Center: (225, 225). Side = 293. Radius = 6.
    // x0 = 225 - 293/2 = 78.5, y0 = 78.5
    // x1 = 225 + 293/2 = 371.5, y1 = 371.5
    const ringPathD = "M 84.5 78.5 H 365.5 A 6 6 0 0 1 371.5 84.5 V 365.5 A 6 6 0 0 1 365.5 371.5 H 84.5 A 6 6 0 0 1 78.5 365.5 V 84.5 A 6 6 0 0 1 84.5 78.5 Z";

    return (
        <svg
            ref={svgRef}
            viewBox="0 0 450 450"
            className="hud-stack-ring-svg"
            aria-hidden="true"
        >
            <defs>
                <path
                    ref={pathRef}
                    id="stack-ring-track"
                    d={ringPathD}
                    fill="none"
                />
            </defs>

            <text
                className="hud-stack-ring-text"
                textLength={pathLength * 2}
                lengthAdjust="spacing"
            >
                <textPath
                    href="#stack-ring-track"
                    startOffset="0"
                >
                    {!isReducedMotion && (
                        <animate
                            attributeName="startOffset"
                            from="0"
                            to={-pathLength}
                            dur="60s"
                            repeatCount="indefinite"
                        />
                    )}
                    {repeatedItems.map((tech, idx) => (
                        <React.Fragment key={idx}>
                            <tspan
                                fill={idx % 2 === 0 ? "var(--blue-2)" : "var(--blue-3)"}
                            >
                                {tech}
                            </tspan>
                            <tspan
                                fill="var(--blue-5)"
                            >
                                {" // "}
                            </tspan>
                        </React.Fragment>
                    ))}
                </textPath>
            </text>
        </svg>
    );
});

ReticleStackRing.displayName = 'ReticleStackRing';
export default ReticleStackRing;

