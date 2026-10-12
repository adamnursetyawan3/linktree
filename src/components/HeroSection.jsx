import React, { useState, useEffect, useRef, memo } from 'react';
import { 
    MapPin, 
    ArrowDownRight, 
    ChevronDown, 
    FolderKanban, 
    Mail,
    Activity
} from 'lucide-react';
import { settings } from '../settings.js';
import TypewriterText from './TypewriterText.jsx';
import { playClickHaptic } from '../utils/audioHaptic.js';
import ReticleStackRing from './ReticleStackRing.jsx';
import ReticleTelemetry from './ReticleTelemetry.jsx';
import ReticleTraces from './ReticleTraces.jsx';

export const HeroSection = memo(({ soundEnabled }) => {
    const heroSectionRef = useRef(null);
    const reticleRef = useRef(null);
    const avatarCoreRef = useRef(null);
    const frameOuterRef = useRef(null);
    const frameMidRef = useRef(null);
    const frameInnerRef = useRef(null);
    const stackRingRef = useRef(null);
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
    const [isHeroPaused, setIsHeroPaused] = useState(false);

    // PENGECEKAN KONSENTRISITAS VISUAL (DI DEV): PUSAT SEMUA LAYER HARUS SAMA <= 1PX TOLERANSI
    useEffect(() => {
        const verifyConcentricity = () => {
            const getCenter = (el) => {
                if (!el) return null;
                const r = el.getBoundingClientRect();
                return {
                    x: r.left + r.width * 0.5,
                    y: r.top + r.height * 0.5,
                    w: r.width,
                    h: r.height
                };
            };

            const stage = getCenter(reticleRef.current);
            const avatar = getCenter(avatarCoreRef.current);
            const outer = getCenter(frameOuterRef.current);
            const mid = getCenter(frameMidRef.current);
            const inner = getCenter(frameInnerRef.current);
            const ring = getCenter(stackRingRef.current);

            if (stage && avatar) {
                const targets = [
                    { name: 'avatar', center: avatar },
                    outer && { name: 'outer-frame', center: outer },
                    mid && { name: 'mid-frame', center: mid },
                    inner && { name: 'inner-frame', center: inner },
                    ring && { name: 'stack-ring', center: ring }
                ].filter(Boolean);

                const report = targets.map(t => {
                    const dx = Math.abs(t.center.x - stage.x);
                    const dy = Math.abs(t.center.y - stage.y);
                    return {
                        layer: t.name,
                        dx: Number(dx.toFixed(2)),
                        dy: Number(dy.toFixed(2)),
                        aligned: dx <= 1.0 && dy <= 1.0
                    };
                });

                if (import.meta.env?.DEV) {
                    console.info('[RETICLE CONCENTRIC CHECK]', {
                        stageCenter: { x: Number(stage.x.toFixed(1)), y: Number(stage.y.toFixed(1)) },
                        stageSize: { w: Number(stage.w.toFixed(1)), h: Number(stage.h.toFixed(1)) },
                        allLayersAligned: report.every(r => r.aligned),
                        layers: report
                    });
                }
            }
        };

        const timer = setTimeout(verifyConcentricity, 600);
        window.addEventListener('resize', verifyConcentricity);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', verifyConcentricity);
        };
    }, []);

    // CEK UKURAN LAYAR (>= 900PX UNTUK MODE DESKTOP)
    const [isDesktop, setIsDesktop] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 900;
        }
        return true;
    });

    useEffect(() => {
        const mql = window.matchMedia('(min-width: 900px)');
        const onChange = (e) => setIsDesktop(e.matches);
        setIsDesktop(mql.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    // URUTAN MASUK (TAMBAHAN ~1.5 DETIK SEKALI PER KUNJUNGAN DENGAN SESSIONSTORAGE)
    const [entranceStage, setEntranceStage] = useState(() => {
        try {
            if (sessionStorage.getItem('hero_entered_v2') === 'true') {
                return { traces: true, stackRing: true, telemetry: true };
            }
        } catch (e) {}
        return { traces: false, stackRing: false, telemetry: false };
    });

    useEffect(() => {
        const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let hasEntered = false;
        try {
            hasEntered = sessionStorage.getItem('hero_entered_v2') === 'true';
        } catch (e) {}

        if (hasEntered || isReducedMotion) {
            setEntranceStage({ traces: true, stackRing: true, telemetry: true });
            return;
        }

        // Stagger urutan masuk:
        // 1. Sirkuit tergambar (300ms)
        const t1 = setTimeout(() => {
            setEntranceStage(prev => ({ ...prev, traces: true }));
        }, 300);

        // 2. Cincin teks fade-in (700ms)
        const t2 = setTimeout(() => {
            setEntranceStage(prev => ({ ...prev, stackRing: true }));
        }, 700);

        // 3. Telemetri fade-in & selesai (1200ms)
        const t3 = setTimeout(() => {
            setEntranceStage(prev => ({ ...prev, telemetry: true }));
            try {
                sessionStorage.setItem('hero_entered_v2', 'true');
            } catch (e) {}
        }, 1200);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    // SATU INTERSECTION OBSERVER BERSAMA UNTUK PAUSE ANIMASI HERO KETIKA TIDAK TERLIHAT
    useEffect(() => {
        const el = heroSectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsHeroPaused(!entry.isIntersecting);
            },
            { threshold: [0, 0.05] }
        );
        observer.observe(el);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsHeroPaused(true);
            } else if (el) {
                const rect = el.getBoundingClientRect();
                const visible = rect.bottom > 0 && rect.top < window.innerHeight;
                setIsHeroPaused(!visible);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // PARALLAX HALUS MENGIKUTI POINTER (DESKTOP)
    const handleMouseMove = (e) => {
        if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 16;
            const y = (e.clientY / innerHeight - 0.5) * 16;
            setMouseOffset({ x, y });
        }
    };

    const scrollTo = (id) => {
        playClickHaptic(soundEnabled);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // PISAH NAMA JADI DUA BARIS UNTUK MASK REVEAL ELEGAN
    const nameWords = settings.profile.name.split(' ');
    const line1 = nameWords.slice(0, 2).join(' '); // "Adam Nur"
    const line2 = nameWords.slice(2).join(' '); // "Setyawan"

    return (
        <section 
            id="beranda" 
            ref={heroSectionRef}
            className={`portfolio-hero-section ${isHeroPaused ? 'hero-paused' : ''}`}
            onMouseMove={handleMouseMove}
        >
            <div className="hero-content-wrapper">
                {/* 1. DUA PILL SEJAJAR: STATUS DAN LOKASI */}
                <div className="hero-meta-strip">
                    <div className="hero-status-pill">
                        <span className="hero-pulse-dot" aria-hidden="true" />
                        <span className="hero-status-text">{settings.profile.status}</span>
                    </div>
                    <div className="hero-location-pill">
                        <MapPin size={11} strokeWidth={1.75} className="hero-pin-icon" aria-hidden="true" />
                        <span className="hero-location-text">{settings.profile.location}</span>
                    </div>
                </div>

                {/* 2. GRID DUA KOLOM HERO: TEKS KIRI, AVATAR DENGAN RETICLE KANAN (HP: SATU KOLOM) */}
                <div className="hero-main-grid">
                    {/* KIRI (DESKTOP) / ATAS (HP): TEKS DISPLAY BESAR DENGAN MASK REVEAL */}
                    <div className="hero-text-col">
                        <div className="hero-headline-mask-group">
                            <div className="mask-reveal-row">
                                <h1 className="display-name-fluid">
                                    <span className="mask-inner-text line-1">{line1}</span>
                                </h1>
                            </div>
                            {line2 && (
                                <div className="mask-reveal-row">
                                    <h1 className="display-name-fluid">
                                        <span className="mask-inner-text line-2">{line2}</span>
                                    </h1>
                                </div>
                            )}
                        </div>

                        <div className="hero-title-row">
                            <span className="font-mono text-xs text-[var(--blue-4)] tracking-wider">
                                {settings.profile.title}
                            </span>
                            <span className="text-[var(--blue-7)]" aria-hidden="true">·</span>
                            <span className="font-mono text-xs text-[var(--blue-3)]">
                                {settings.profile.handle}
                            </span>
                        </div>

                        {/* BIO DENGAN EFEK KETIK TERMINAL */}
                        <div className="hero-bio-container">
                            <TypewriterText text={settings.profile.bio} speed={20} />
                        </div>

                        {/* TIGA TOMBOL AKSI UTAMA DENGAN GAYA EDITORIAL */}
                        <div className="hero-actions-row">
                            <button 
                                className="hero-primary-btn"
                                onClick={() => scrollTo('project')}
                            >
                                <FolderKanban size={15} strokeWidth={1.5} />
                                <span>Lihat Project</span>
                                <ArrowDownRight size={14} strokeWidth={1.5} className="btn-arrow" />
                            </button>

                            <button 
                                className="hero-secondary-btn"
                                onClick={() => scrollTo('metrik')}
                            >
                                <Activity size={15} strokeWidth={1.5} />
                                <span>Metrik</span>
                            </button>

                            <button 
                                className="hero-secondary-btn"
                                onClick={() => scrollTo('kontak')}
                            >
                                <Mail size={15} strokeWidth={1.5} />
                                <span>Kontak</span>
                            </button>
                        </div>
                    </div>

                    {/* KANAN (DESKTOP) / BAWAH (HP): AVATAR DENGAN RETICLE HUD DAN ENAM LAPISAN KONSENTRIS */}
                    <div className="hero-avatar-col">
                        <div 
                            ref={reticleRef}
                            className="reticle-stage"
                            style={{
                                transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`
                            }}
                        >
                            {/* LAPISAN 1: JALUR SIRKUIT PCB (HP: 2 JALUR, DESKTOP: 4 JALUR) */}
                            <div className="reticle-concentric-layer traces-layer">
                                <ReticleTraces isReady={entranceStage.traces} isDesktop={isDesktop} />
                            </div>

                            {/* LAPISAN 2: BINGKAI 3 (TERLUAR): 1PX GARIS, BERPUTAR CW DENGAN TITIK DATA SATELIT */}
                            <div className="reticle-concentric-layer frame-outer-layer">
                                <div ref={frameOuterRef} className="hud-frame hud-frame-outer" aria-hidden="true">
                                    <span className="hud-corner tl" />
                                    <span className="hud-corner tr" />
                                    <span className="hud-corner bl" />
                                    <span className="hud-corner br" />
                                    <span className="hud-axis-tick tick-n" />
                                    <span className="hud-axis-tick tick-s" />
                                    <span className="hud-axis-tick tick-e" />
                                    <span className="hud-axis-tick tick-w" />
                                    <div className="hud-data-point" />
                                </div>
                            </div>

                            {/* LAPISAN 3: CINCIN TEKS STACK (TEGAK LURUS, TEKS BERJALAN SEARAH JARUM JAM) */}
                            <div className={`reticle-concentric-layer stack-ring-layer ${entranceStage.stackRing ? 'ready' : ''}`}>
                                <ReticleStackRing ref={stackRingRef} isHeroPaused={isHeroPaused} />
                            </div>

                            {/* LAPISAN 4: BINGKAI 2 (TENGAH): 1.5PX GARIS PUTUS-PUTUS BLUE-5, BERPUTAR CCW */}
                            <div className="reticle-concentric-layer frame-mid-layer">
                                <div ref={frameMidRef} className="hud-frame hud-frame-mid" aria-hidden="true">
                                    <span className="hud-corner tl" />
                                    <span className="hud-corner tr" />
                                    <span className="hud-corner bl" />
                                    <span className="hud-corner br" />
                                </div>
                            </div>

                            {/* LAPISAN 5: BINGKAI 1 (TERDALAM): 1.5PX GARIS BLUE-4, BERPUTAR CW */}
                            <div className="reticle-concentric-layer frame-inner-layer">
                                <div ref={frameInnerRef} className="hud-frame hud-frame-inner" aria-hidden="true">
                                    <span className="hud-corner tl" />
                                    <span className="hud-corner tr" />
                                    <span className="hud-corner bl" />
                                    <span className="hud-corner br" />
                                </div>
                            </div>

                            {/* LAPISAN 6: AVATAR INTI (BERADA TEPAT DI PUSAT SAMA) DENGAN CORNER BRACKET PERJELAS */}
                            <div className="reticle-concentric-layer avatar-layer">
                                <div ref={avatarCoreRef} className="hero-avatar-core">
                                    <span className="avatar-corner-bracket tl" />
                                    <span className="avatar-corner-bracket tr" />
                                    <span className="avatar-corner-bracket bl" />
                                    <span className="avatar-corner-bracket br" />

                                    <div className="hero-avatar-inner">
                                        <img 
                                            src={settings.profile.avatar} 
                                            alt={settings.profile.name} 
                                            className="hero-avatar-img"
                                            loading="eager"
                                            decoding="async"
                                        />
                                    </div>

                                    <div className="avatar-footer-tag">
                                        <span>{settings.profile.handle}</span>
                                    </div>
                                </div>
                            </div>

                            {/* LAPISAN 7: TELEMETRI HUD (4 SUDUT MENEMPEL PADA RETICLE STAGE, JARAK 8PX) */}
                            <div className={`hud-telemetry-wrapper ${entranceStage.telemetry ? 'ready' : ''}`}>
                                <ReticleTelemetry 
                                    reticleRef={reticleRef} 
                                    avatarRef={avatarCoreRef}
                                    heroContainerRef={heroSectionRef} 
                                    isDesktop={isDesktop}
                                />
                            </div>
                        </div>

                        {/* INDIKATOR SCROLL TEPAT DI BAWAH RETICLE (JARAK 16PX) */}
                        <div className="hero-scroll-hint" onClick={() => scrollTo('ringkasan')}>
                            <span className="scroll-hint-text font-mono text-xs">Scroll</span>
                            <ChevronDown size={14} strokeWidth={1.5} className="scroll-hint-icon" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});

export default HeroSection;
