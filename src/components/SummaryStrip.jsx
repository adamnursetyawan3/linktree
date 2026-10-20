import React, { useState, useEffect, useRef, memo } from 'react';
import { settings } from '../settings.js';
import { githubFallbackStats } from '../data/stats.js';
import { useReveal } from '../hooks/useReveal.js';

// BADGE SUMBER DATA KECIL (PILL 11PX, BORDER 1PX BLUE-7, TEKS BLUE-3)
const DataBadge = memo(({ source }) => {
    return (
        <span className="summary-data-badge font-mono">
            {source.toUpperCase()}
        </span>
    );
});

// KOMPONEN COUNT-UP 900MS JETBRAINS MONO DENGAN FORMAT ID-ID
const CountUpValue = memo(({ value, isRevealed, duration = 900 }) => {
    const [displayVal, setDisplayVal] = useState(0);
    const hasAnimatedRef = useRef(false);

    useEffect(() => {
        if (!isRevealed) return;

        // Jika bukan angka (misal tanda hubung "-")
        if (typeof value !== 'number' || isNaN(value)) {
            setDisplayVal(value);
            return;
        }

        // Hormati prefers-reduced-motion
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setDisplayVal(value);
            hasAnimatedRef.current = true;
            return;
        }

        if (hasAnimatedRef.current) {
            setDisplayVal(value);
            return;
        }

        let startTimestamp = null;
        let animationId;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Cubic ease out
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * value);

            setDisplayVal(current);

            if (progress < 1) {
                animationId = requestAnimationFrame(step);
            } else {
                setDisplayVal(value);
                hasAnimatedRef.current = true;
            }
        };

        animationId = requestAnimationFrame(step);

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [value, isRevealed, duration]);

    if (typeof value !== 'number' || isNaN(value)) {
        return <span className="summary-val-text font-mono">{value}</span>;
    }

    const formatted = typeof displayVal === 'number' 
        ? displayVal.toLocaleString('id-ID')
        : displayVal;

    return (
        <span className="summary-val-text font-mono">
            {formatted}
        </span>
    );
});

export const SummaryStrip = memo(({ sectionNumber = "01" }) => {
    const [sectionRef, isRevealed] = useReveal();

    // a. Total Project (live dari settings.projects.length)
    const totalProjects = settings?.projects?.length || 0;

    // b. Total Platform (live dari settings.links.length)
    const totalPlatforms = settings?.links?.length || 0;

    // c. Item Stack (live dari settings.profile.stack.length)
    const stackItemsCount = settings?.profile?.stack?.length || 0;

    // d. Repo GitHub (fallback dari src/data/stats.js)
    const githubRepos = githubFallbackStats?.publicRepos ?? 18;

    // e. Anggota Komunitas (data live WhatsApp/Discord jika tersedia, atau "-")
    const [communityCount, setCommunityCount] = useState(() => {
        try {
            const dcCached = sessionStorage.getItem('dc_cache_aDmrbdKanG');
            if (dcCached) {
                const parsed = JSON.parse(dcCached);
                if (parsed?.data?.members) return parsed.data.members;
            }
        } catch (e) {}
        return '-';
    });

    useEffect(() => {
        const checkCommunityData = () => {
            try {
                const dcCached = sessionStorage.getItem('dc_cache_aDmrbdKanG');
                if (dcCached) {
                    const parsed = JSON.parse(dcCached);
                    if (parsed?.data?.members) {
                        setCommunityCount(parsed.data.members);
                        return;
                    }
                }
                const waCached = sessionStorage.getItem('wa_cache_channel');
                if (waCached) {
                    const parsed = JSON.parse(waCached);
                    const match = String(parsed?.data?.followers || '').match(/\d+/);
                    if (match) {
                        setCommunityCount(parseInt(match[0], 10));
                        return;
                    }
                }
            } catch (e) {}
        };

        checkCommunityData();
        window.addEventListener('community-data-updated', checkCommunityData);
        window.addEventListener('storage', checkCommunityData);
        const timer = setTimeout(checkCommunityData, 1200);

        return () => {
            window.removeEventListener('community-data-updated', checkCommunityData);
            window.removeEventListener('storage', checkCommunityData);
            clearTimeout(timer);
        };
    }, []);

    // f. Kunjungan di perangkat ini (dari localStorage, tambah 1 per sesi sessionStorage)
    const [deviceVisits, setDeviceVisits] = useState(1);

    useEffect(() => {
        try {
            const stored = parseInt(localStorage.getItem('device_visits_count') || '0', 10);
            const sessionMarked = sessionStorage.getItem('device_visited_session');
            if (!sessionMarked) {
                const updated = (stored > 0 ? stored : 0) + 1;
                localStorage.setItem('device_visits_count', String(updated));
                sessionStorage.setItem('device_visited_session', 'true');
                setDeviceVisits(updated);
            } else {
                setDeviceVisits(stored > 0 ? stored : 1);
            }
        } catch (e) {
            setDeviceVisits(1);
        }
    }, []);

    const metrics = [
        {
            id: 'projects',
            label: 'TOTAL PROJECT',
            value: totalProjects,
            source: 'live'
        },
        {
            id: 'platforms',
            label: 'TOTAL PLATFORM',
            value: totalPlatforms,
            source: 'live'
        },
        {
            id: 'stack',
            label: 'ITEM STACK',
            value: stackItemsCount,
            source: 'live'
        },
        {
            id: 'github',
            label: 'REPO GITHUB',
            value: githubRepos,
            source: 'statis'
        },
        {
            id: 'community',
            label: 'ANGGOTA KOMUNITAS',
            value: communityCount,
            source: 'live'
        },
        {
            id: 'visits',
            label: 'KUNJUNGAN PERANGKAT',
            value: deviceVisits,
            source: 'lokal'
        }
    ];

    return (
        <section 
            id="ringkasan" 
            ref={sectionRef} 
            className={`summary-strip-section ${isRevealed ? 'revealed' : ''}`}
            aria-label="Ringkasan Sistem"
        >
            <div className="section-container">
                {/* HEADING: 01 / RINGKASAN */}
                <div className="summary-strip-header">
                    <span className="summary-strip-num font-mono">{sectionNumber}</span>
                    <span className="summary-strip-slash" aria-hidden="true">/</span>
                    <h2 className="summary-strip-title font-mono">Ringkasan</h2>
                </div>

                {/* STRIP METRIK 6 KOLOM (HP: 2 KOLOM X 3 BARIS, DESKTOP: 6 KOLOM SEBARIS) */}
                <div className="summary-strip-grid" role="list">
                    {metrics.map((metric, index) => (
                        <div 
                            key={metric.id} 
                            className="summary-strip-item"
                            role="listitem"
                        >
                            {/* NILAI ANGKA BESAR 28PX JETBRAINS MONO */}
                            <div className="summary-val-wrap">
                                <CountUpValue 
                                    value={metric.value} 
                                    isRevealed={isRevealed} 
                                    duration={900} 
                                />
                            </div>

                            {/* LABEL 11PX BLUE-3 DENGAN DATABADGE KECIL */}
                            <div className="summary-label-row">
                                <span className="summary-label-text font-mono">
                                    {metric.label}
                                </span>
                                <DataBadge source={metric.source} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});

SummaryStrip.displayName = 'SummaryStrip';
export default SummaryStrip;
