import React, { memo } from 'react';

/**
 * ReticleTraces - Jalur sirkuit PCB mikro di belakang bingkai reticle
 * Di HP (< 900px): 2 jalur pendek (kiri atas dan kanan bawah avatar) yang tetap di dalam area reticle stage.
 * Di Desktop (>= 900px): 4 jalur lengkap.
 * ViewBox 450x450 konsentris dengan reticle stage. Avatar (180x180) berada di (135,135)-(315,315).
 * Garis 1.5px blue-6, pad persegi 6px blue-5, titik data 5px blue-3 berjalan dengan offset-distance 4s linear infinite.
 */
const ALL_TRACES = [
    {
        id: 'trace-tl',
        d: 'M 135 135 H 95 L 65 95 H 32',
        padX: 26,
        padY: 92,
        delay: '0s',
        drawDelay: '0ms',
        mobile: true
    },
    {
        id: 'trace-tr',
        d: 'M 315 135 H 355 L 385 95 H 418',
        padX: 418,
        padY: 92,
        delay: '1s',
        drawDelay: '200ms',
        mobile: false
    },
    {
        id: 'trace-bl',
        d: 'M 135 315 H 95 L 65 355 H 32',
        padX: 26,
        padY: 352,
        delay: '2s',
        drawDelay: '400ms',
        mobile: false
    },
    {
        id: 'trace-br',
        d: 'M 315 315 H 355 L 385 355 H 418',
        padX: 418,
        padY: 352,
        delay: '3s',
        drawDelay: '600ms',
        mobile: true
    }
];

export const ReticleTraces = memo(({ isReady = true, isDesktop = true }) => {
    // Di HP hanya render 2 jalur (kiri atas & kanan bawah)
    const tracesToRender = isDesktop 
        ? ALL_TRACES 
        : ALL_TRACES.filter(t => t.mobile);

    return (
        <svg
            viewBox="0 0 450 450"
            className="hud-traces-svg"
            aria-hidden="true"
        >
            {tracesToRender.map((trace) => (
                <g key={trace.id} className="hud-trace-group">
                    {/* Jalur garis 1.5px blue-6 */}
                    <path
                        id={trace.id}
                        d={trace.d}
                        fill="none"
                        className={`hud-trace-line ${isReady ? 'drawn' : ''}`}
                        style={{
                            transitionDelay: trace.drawDelay
                        }}
                    />

                    {/* Pad terminal persegi 6px blue-5 */}
                    <rect
                        x={trace.padX}
                        y={trace.padY}
                        width="6"
                        height="6"
                        className="hud-trace-pad"
                    />

                    {/* Titik data persegi 5px blue-3 berjalan dari avatar ke pad via offset-path */}
                    <rect
                        width="5"
                        height="5"
                        className="hud-trace-data-point"
                        style={{
                            offsetPath: `path('${trace.d}')`,
                            animationDelay: trace.delay
                        }}
                    />
                </g>
            ))}
        </svg>
    );
});

export default ReticleTraces;

