import React, { useState, useEffect, useRef, useCallback } from 'react';
import { settings } from './settings.js';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import SummaryStrip from './components/SummaryStrip.jsx';
import HeroTerminal from './components/HeroTerminal.jsx';
import StackMarquee from './components/StackMarquee.jsx';
import MetricsDashboard from './components/MetricsDashboard.jsx';
import ProjectGrid from './components/ProjectGrid.jsx';
import CommunityBento from './components/CommunityBento.jsx';
import ContactEditorial from './components/ContactEditorial.jsx';
import FooterSection from './components/FooterSection.jsx';
import MusicPlayer from './MusicPlayer.jsx';
import NetworkCanvas from './components/NetworkCanvas.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import PlayerSheet from './components/PlayerSheet.jsx';
import Toast from './components/Toast.jsx';
import { playClickHaptic } from './utils/audioHaptic.js';

// URUTAN RENDER RESMI UNTUK PENOMORAN SEKSI (01 - 05) TANPA LOMPAT
const NUMBERED_SECTIONS = [
    'ringkasan',
    'metrik',
    'project',
    'komunitas',
    'kontak'
];

const getSectionNumber = (id) => {
    const idx = NUMBERED_SECTIONS.indexOf(id);
    return idx !== -1 ? String(idx + 1).padStart(2, '0') : '';
};

export const App = () => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [needsInteraction, setNeedsInteraction] = useState(true);
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    // MODAL & SHEET INTERACTION STATES
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isPlayerSheetOpen, setIsPlayerSheetOpen] = useState(false);
    const [selectedProjectIndex, setSelectedProjectIndex] = useState(null);
    const [expandedSocialId, setExpandedSocialId] = useState(null);

    // ACCESSIBLE TOAST NOTIFICATION STATE
    const [toastMessage, setToastMessage] = useState('');
    const [toastVisible, setToastVisible] = useState(false);
    const toastTimeoutRef = useRef(null);

    const showToast = useCallback((msg) => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        setToastMessage(msg);
        setToastVisible(true);
        toastTimeoutRef.current = setTimeout(() => {
            setToastVisible(false);
        }, 3000);
    }, []);

    // INTRO OVERLAY (600MS)
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // POINTER SPOTLIGHT (DESKTOP POINTER: FINE)
    const handleMouseMove = useCallback((e) => {
        if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
            document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
        }
    }, []);

    // SINKRONISASI AUDIO HTML5 TUNGGAL & MEDIASESSION (PRELOAD NONE, TANPA AUTOPLAY)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = 0.65;
        audio.loop = true;

        if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
            try {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: settings.music.title,
                    artist: settings.music.artist,
                    album: settings.profile.name,
                    artwork: [
                        { src: settings.music.cover, sizes: '512x512', type: 'image/jpeg' }
                    ]
                });
                navigator.mediaSession.setActionHandler('play', () => {
                    audioRef.current?.play().catch(() => {});
                });
                navigator.mediaSession.setActionHandler('pause', () => {
                    audioRef.current?.pause();
                });
            } catch (e) {}
        }
    }, []);

    const togglePlay = useCallback(() => {
        playClickHaptic(true);
        const audio = audioRef.current;
        if (!audio) return;

        setNeedsInteraction(false);

        if (!audio.paused) {
            audio.pause();
        } else {
            audio.muted = false;
            audio.play().catch((err) => {
                console.warn("AUDIO PLAY BLOCKED:", err);
            });
        }
    }, []);

    const handleCopySite = useCallback(async () => {
        playClickHaptic(isPlaying);
        const siteUrl = settings.site.siteUrl || "https://karinnchans.my.id";
        try {
            await navigator.clipboard.writeText(siteUrl);
            showToast("Tautan situs web berhasil disalin");
        } catch (err) {
            showToast("Gagal menyalin tautan");
        }
    }, [isPlaying, showToast]);

    return (
        <div 
            className={`portfolio-app-root ${isPageLoaded ? 'loaded' : 'loading'}`}
            onMouseMove={handleMouseMove}
        >
            {/* 1. ELEMEN AUDIO HTML5 TUNGGAL */}
            <audio
                ref={audioRef}
                src={settings.music.audio}
                preload="none"
                loop
                onPlay={() => {
                    setIsPlaying(true);
                    setNeedsInteraction(false);
                }}
                onPause={() => {
                    setIsPlaying(false);
                }}
                onError={() => {
                    setIsPlaying(false);
                }}
            />

            {/* 2. OVERLAY INTRO 600MS SAAT LOAD */}
            <div className={`page-intro-curtain ${isPageLoaded ? 'lifted' : ''}`} aria-hidden="true" />

            {/* 3. LATAR BELAKANG VIDEO & JARINGAN TITIK CANVAS */}
            <NetworkCanvas />

            <video autoPlay muted loop playsInline preload="metadata" id="bg-video">
                <source src={settings.profile.videoBg} type="video/mp4" />
            </video>

            {/* OVERLAY SANGAT GELAP (#040C1C OPACITY 0.88) & GRID DRIFT */}
            <div className="portfolio-dark-scrim" aria-hidden="true" />
            <div className="portfolio-grid-drift" aria-hidden="true" />
            <div className="portfolio-cursor-spotlight" aria-hidden="true" />

            {/* 4. NAVBAR STICKY TIPIS DENGAN PROGRESS BAR */}
            <Navbar 
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onCopySite={handleCopySite}
                onOpenSearch={() => setIsSearchOpen(true)}
            />

            {/* 5. STRUKTUR UTAMA HALAMAN PORTOFOLIO */}
            <main className="portfolio-main-layout">
                {/* HERO SECTION */}
                <HeroSection soundEnabled={isPlaying} />

                {/* 01 / STRIP RINGKASAN SISTEM */}
                <SummaryStrip 
                    soundEnabled={isPlaying} 
                    sectionNumber={getSectionNumber('ringkasan')}
                />

                {/* TERMINAL INTERAKTIF NOIR */}
                <HeroTerminal 
                    soundEnabled={isPlaying}
                    onSelectProject={setSelectedProjectIndex}
                    onSelectSocial={(id) => {
                        setExpandedSocialId(id);
                        const el = document.getElementById('kontak');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    onShowToast={showToast}
                />

                {/* STACK MARQUEE */}
                <StackMarquee />

                {/* 02 / METRIK & ANALITIK SISTEM */}
                <MetricsDashboard 
                    soundEnabled={isPlaying} 
                    sectionNumber={getSectionNumber('metrik')}
                />

                {/* 03 / PROJECT GRID (INTI PORTOFOLIO) */}
                <ProjectGrid 
                    soundEnabled={isPlaying}
                    onShowToast={showToast}
                    selectedProjectIndex={selectedProjectIndex}
                    onSelectProject={setSelectedProjectIndex}
                    sectionNumber={getSectionNumber('project')}
                />

                {/* 04 / KOMUNITAS (BENTO DASHBOARD) */}
                <CommunityBento 
                    isPlaying={isPlaying}
                    onTogglePlay={togglePlay}
                    soundEnabled={isPlaying}
                    onShowToast={showToast}
                    onOpenPlayerSheet={() => setIsPlayerSheetOpen(true)}
                    sectionNumber={getSectionNumber('komunitas')}
                />

                {/* 05 / KONTAK / LINK EDITORIAL (KARTU SOSIAL INTERAKTIF) */}
                <ContactEditorial 
                    soundEnabled={isPlaying}
                    onShowToast={showToast}
                    expandedSocialId={expandedSocialId}
                    onToggleSocial={setExpandedSocialId}
                    sectionNumber={getSectionNumber('kontak')}
                />

                {/* FOOTER PORTOFOLIO */}
                <FooterSection soundEnabled={isPlaying} />
            </main>

            {/* 6. PEMUTAR MUSIK FIXED BOTTOM BAR */}
            <MusicPlayer 
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                needsInteraction={needsInteraction}
                onOpenSheet={() => setIsPlayerSheetOpen(true)}
            />

            {/* 7. FULL PLAYER BOTTOM SHEET MODAL */}
            <PlayerSheet 
                isOpen={isPlayerSheetOpen}
                onClose={() => setIsPlayerSheetOpen(false)}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                audioElement={audioRef.current}
                soundEnabled={isPlaying}
            />

            {/* 8. COMMAND PALETTE DIALOG (CTRL+K) */}
            <CommandPalette 
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelectProject={(idx) => {
                    setSelectedProjectIndex(idx);
                    const el = document.getElementById('project');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onSelectSocial={(id) => {
                    setExpandedSocialId(id);
                }}
                soundEnabled={isPlaying}
            />

            {/* 9. GLOBAL ACCESSIBLE TOAST NOTIFICATION */}
            <Toast 
                message={toastMessage}
                visible={toastVisible}
            />
        </div>
    );
};

export default App;
