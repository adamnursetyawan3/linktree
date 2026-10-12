import React, { useEffect, useRef, useState, useMemo, memo } from 'react';
import { settings } from '../settings.js';

/**
 * ReticleStackRing - Cincin teks stack teknologi di antara bingkai tengah dan luar
 * SVG viewBox 0 0 316 316, sisi jalur 293 membulat 6, tepat di celah bingkai.
 * Berputar berlawanan arah jarum jam (CCW) 60 detik per putaran dengan knockout stroke blue-9.
 */
export const ReticleStackRing = memo(() => {
    const pathRef = useRef(null);
    const [pathLength, setPathLength] = useState(1162);

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

    // Ulangi stack item agar cukup menutupi keliling perimeter penuh (~1162px)
    const repeatedItems = useMemo(() => {
        if (stackItems.length === 0) return [];
        // Ulangi 4 kali agar teks padat menutupi seluruh perimeter 293x293
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

    // Jalur persegi sisi 293 di tengah viewBox 316x316 (x=11.5 y=11.5 w=293 h=293 rx=6)
    const ringPathD = "M 17.5 11.5 H 298.5 A 6 6 0 0 1 304.5 17.5 V 298.5 A 6 6 0 0 1 298.5 304.5 H 17.5 A 6 6 0 0 1 11.5 298.5 V 17.5 A 6 6 0 0 1 17.5 11.5 Z";

    return (
        <svg
            viewBox="0 0 316 316"
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
                textLength={pathLength}
                lengthAdjust="spacing"
            >
                <textPath
                    href="#stack-ring-track"
                    startOffset="0%"
                >
                    {repeatedItems.map((tech, idx) => (
                        <React.Fragment key={idx}>
                            <tspan
                                fill={idx % 2 === 0 ? "var(--blue-2)" : "var(--blue-3)"}
                                opacity="1"
                            >
                                {tech}
                            </tspan>
                            <tspan
                                fill="var(--blue-5)"
                                opacity="1"
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

export default ReticleStackRing;
