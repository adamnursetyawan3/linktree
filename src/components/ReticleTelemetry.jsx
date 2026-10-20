import React, { useEffect, useRef, memo } from 'react';
import { subscribeWibClock } from '../utils/timeSource.js';

/**
 * ReticleTelemetry - Lapisan telemetri HUD mikro di 4 sudut reticle
 * Di HP (< 900px): Hanya 2 label (kiri atas jam WIB, kanan bawah FRAME WxH), tanpa pointermove listener.
 * Di Desktop (>= 900px): 4 label lengkap.
 * Ditulis langsung ke DOM via ref tanpa setState untuk nol re-render.
 */
export const ReticleTelemetry = memo(({ reticleRef, avatarRef, heroContainerRef, isDesktop }) => {
    const clockRef = useRef(null);
    const coordsRef = useRef(null);
    const scrollRef = useRef(null);
    const frameDimRef = useRef(null);
    const avtDimRef = useRef(null);

    // 1. KIRI ATAS: JAM WIB DARI SINGLE TIME SOURCE (HP & DESKTOP)
    useEffect(() => {
        return subscribeWibClock((time) => {
            if (clockRef.current) {
                clockRef.current.textContent = `WIB ${time}`;
            }
        });
    }, []);

    // 2. KANAN ATAS: POSISI POINTER (HANYA DESKTOP >= 900PX)
    useEffect(() => {
        if (!isDesktop) return;

        let rafId = null;
        let lastCoords = { x: 0, y: 0 };

        const formatCoord = (val) => {
            const sign = val >= 0 ? '+' : '-';
            const abs = Math.min(999, Math.abs(val)).toString().padStart(3, '0');
            return `${sign}${abs}`;
        };

        const handlePointerMove = (e) => {
            if (!reticleRef?.current) return;
            const rect = reticleRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width * 0.5;
            const centerY = rect.top + rect.height * 0.5;

            const diffX = Math.round(e.clientX - centerX);
            const diffY = Math.round(e.clientY - centerY);

            lastCoords = { x: diffX, y: diffY };

            if (!rafId) {
                rafId = requestAnimationFrame(() => {
                    if (coordsRef.current) {
                        coordsRef.current.style.opacity = '1';
                        coordsRef.current.textContent = `X ${formatCoord(lastCoords.x)} Y ${formatCoord(lastCoords.y)}`;
                    }
                    rafId = null;
                });
            }
        };

        const handlePointerLeave = () => {
            if (coordsRef.current) {
                coordsRef.current.style.opacity = '0.5';
            }
        };

        const target = heroContainerRef?.current || window;
        target.addEventListener('pointermove', handlePointerMove, { passive: true });
        target.addEventListener('pointerleave', handlePointerLeave, { passive: true });

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            target.removeEventListener('pointermove', handlePointerMove);
            target.removeEventListener('pointerleave', handlePointerLeave);
        };
    }, [isDesktop, reticleRef, heroContainerRef]);

    // 3. KIRI BAWAH: PERSEN SCROLL (HANYA DESKTOP >= 900PX)
    useEffect(() => {
        if (!isDesktop) return;

        let scrollRaf = null;

        const updateScroll = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
            const pct = Math.round(progress * 100).toString().padStart(3, '0');
            if (scrollRef.current) {
                scrollRef.current.textContent = `SCROLL ${pct}%`;
            }
            scrollRaf = null;
        };

        const onScroll = () => {
            if (!scrollRaf) {
                scrollRaf = requestAnimationFrame(updateScroll);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        updateScroll();

        return () => {
            if (scrollRaf) cancelAnimationFrame(scrollRaf);
            window.removeEventListener('scroll', onScroll);
        };
    }, [isDesktop]);

    // 4. KANAN BAWAH: UKURAN BINGKAI TERLUAR & AVATAR VIA RESIZEOBSERVER (HP & DESKTOP)
    useEffect(() => {
        if (typeof ResizeObserver === 'undefined') return;

        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (entry.target === reticleRef?.current && frameDimRef.current) {
                    const w = Math.round(width / 1.42) || (isDesktop ? 316 : 280);
                    frameDimRef.current.textContent = `FRAME ${w}x${w}`;
                } else if (entry.target === avatarRef?.current && avtDimRef.current) {
                    const w = Math.round(width) || 180;
                    const h = Math.round(height) || 180;
                    avtDimRef.current.textContent = `AVT ${w}x${h}`;
                }
            }
        });

        if (reticleRef?.current) ro.observe(reticleRef.current);
        if (avatarRef?.current) ro.observe(avatarRef.current);

        return () => ro.disconnect();
    }, [isDesktop, reticleRef, avatarRef]);

    return (
        <div className={`hud-telemetry-layer ${isDesktop ? 'desktop-mode' : 'mobile-mode'}`} aria-hidden="true">
            {/* KIRI ATAS: JAM WIB (HP & DESKTOP) */}
            <div className="hud-telemetry-item top-left">
                <span ref={clockRef} className="telemetry-val">WIB 00:00:00</span>
            </div>

            {/* KANAN ATAS: POINTER OFFSET X/Y (HANYA DESKTOP) */}
            {isDesktop && (
                <div className="hud-telemetry-item top-right">
                    <span ref={coordsRef} className="telemetry-val">X +000 Y -000</span>
                </div>
            )}

            {/* KIRI BAWAH: PERSEN SCROLL (HANYA DESKTOP) */}
            {isDesktop && (
                <div className="hud-telemetry-item bottom-left">
                    <span ref={scrollRef} className="telemetry-val">SCROLL 000%</span>
                </div>
            )}

            {/* KANAN BAWAH: DIMENSI FRAME RESIZEOBSERVER (HP & DESKTOP) */}
            <div className="hud-telemetry-item bottom-right">
                <div ref={frameDimRef} className="telemetry-val">
                    FRAME {isDesktop ? '316x316' : '280x280'}
                </div>
                {isDesktop && (
                    <div ref={avtDimRef} className="telemetry-val telemetry-sub">
                        AVT 180x180
                    </div>
                )}
            </div>
        </div>
    );
});

export default ReticleTelemetry;
