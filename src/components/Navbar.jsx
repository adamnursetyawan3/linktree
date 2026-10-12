import React, { useState, useEffect, useRef, memo } from 'react';
import { 
    Volume2, 
    VolumeX, 
    Share2, 
    Clock,
    Layers,
    FolderKanban,
    Users,
    Mail,
    Home,
    Search,
    Activity
} from 'lucide-react';
import { settings } from '../settings.js';
import { useScrollProgress } from '../hooks/useScrollProgress.js';
import { playClickHaptic } from '../utils/audioHaptic.js';

import { subscribeWibClock } from '../utils/timeSource.js';

// JAM WIB TERISOLASI MENGGUNAKAN SINGLE TIME SOURCE
const NavbarClock = memo(() => {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        return subscribeWibClock((time) => {
            setCurrentTime(time);
        });
    }, []);

    return (
        <div className="nav-clock-box">
            <Clock size={12} strokeWidth={1.5} className="text-[var(--blue-4)]" />
            <span>{currentTime} WIB</span>
        </div>
    );
});

const NAV_ITEMS = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'stack', label: 'Stack', icon: Layers },
    { id: 'metrik', label: 'Metrik', icon: Activity },
    { id: 'project', label: 'Project', icon: FolderKanban },
    { id: 'komunitas', label: 'Komunitas', icon: Users },
    { id: 'kontak', label: 'Kontak', icon: Mail },
];

export const Navbar = memo(({ 
    isPlaying, 
    onTogglePlay, 
    onCopySite,
    onOpenSearch 
}) => {
    const scrollProgress = useScrollProgress();
    const [activeSection, setActiveSection] = useState('beranda');
    const scrollNavRef = useRef(null);

    // OBSERVER SECTION AKTIF (SCROLL-SPY)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-35% 0px -35% 0px', threshold: 0 }
        );

        NAV_ITEMS.forEach((item) => {
            const el = document.getElementById(item.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    // AUTO SCROLL ANCHOR AKTIF KE TENGAH DI HP
    useEffect(() => {
        if (!scrollNavRef.current) return;
        const activeBtn = scrollNavRef.current.querySelector(`.nav-anchor-btn[data-id="${activeSection}"]`);
        if (activeBtn) {
            activeBtn.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    }, [activeSection]);

    // KEYBOARD SHORTCUT CTRL/CMD + K UNTUK SEARCH
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                playClickHaptic(isPlaying);
                onOpenSearch?.();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isPlaying, onOpenSearch]);

    const handleNavClick = (id) => {
        playClickHaptic(isPlaying);
        const target = document.getElementById(id);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="portfolio-navbar-sticky">
            <div className="navbar-container">
                {/* KIRI: BRAND / NAMA / HANDLE */}
                <div className="navbar-brand-left">
                    <button 
                        className="navbar-brand-btn"
                        onClick={() => handleNavClick('beranda')}
                        title={settings.profile.name}
                    >
                        <span className="brand-dot-indicator" />
                        <span className="brand-name-text">{settings.profile.name}</span>
                        <span className="brand-handle-tag">{settings.profile.handle}</span>
                    </button>
                </div>

                {/* TENGAH: NAV ANCHORS DENGAN FADE EDGE DAN SCROLL HORIZONTAL */}
                <nav className="navbar-nav-center" aria-label="Navigasi Utama">
                    <div ref={scrollNavRef} className="nav-anchors-scroll">
                        {NAV_ITEMS.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    data-id={item.id}
                                    className={`nav-anchor-btn ${isActive ? 'active' : ''}`}
                                    onClick={() => handleNavClick(item.id)}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <IconComponent size={13} strokeWidth={1.5} className="nav-anchor-icon" />
                                    <span>{item.label}</span>
                                    {isActive && <span className="nav-active-pip" />}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* KANAN: TOMBOL CARI + JAM WIB + SOUND + SHARE */}
                <div className="navbar-actions-right">
                    {/* TOMBOL CARI (COMMAND PALETTE) */}
                    <button 
                        className="nav-search-trigger-btn"
                        onClick={() => {
                            playClickHaptic(isPlaying);
                            onOpenSearch?.();
                        }}
                        title="Pencarian & Pintasan (Ctrl+K)"
                        aria-label="Buka pencarian dan pintasan"
                    >
                        <Search size={14} strokeWidth={1.5} />
                        <span className="search-btn-label">Cari</span>
                        <kbd className="search-shortcut-badge">⌘K</kbd>
                    </button>

                    <NavbarClock />

                    <button 
                        className="nav-action-icon-btn"
                        onClick={() => {
                            playClickHaptic(true);
                            onTogglePlay?.();
                        }}
                        title={isPlaying ? "Musik Berputar (Klik untuk Jeda)" : "Mulai Musik"}
                        aria-label={isPlaying ? "Matikan musik" : "Mulai musik"}
                    >
                        {isPlaying ? <Volume2 size={15} strokeWidth={1.5} /> : <VolumeX size={15} strokeWidth={1.5} />}
                    </button>

                    <button 
                        className="nav-action-icon-btn"
                        onClick={() => {
                            playClickHaptic(isPlaying);
                            onCopySite?.();
                        }}
                        title="Salin Tautan Situs"
                        aria-label="Salin tautan situs web"
                    >
                        <Share2 size={15} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* SCROLL PROGRESS BAR 2PX */}
            <div 
                className="nav-scroll-progress-bar"
                style={{
                    transform: `scaleX(${scrollProgress})`
                }}
                aria-hidden="true"
            />
        </header>
    );
});

export default Navbar;
