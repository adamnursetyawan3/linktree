import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { 
    Share2, 
    Volume2, 
    VolumeX, 
    MapPin, 
    ArrowUpRight, 
    Clock 
} from 'lucide-react';
import { settings } from './settings.js';
import WhatsAppChannelCard from './components/WhatsAppChannelCard.jsx';
import SociaBuzzIcon from './components/SociaBuzzIcon.jsx';
import MusicPlayer from './MusicPlayer.jsx';
import { playClickHaptic } from './utils/audioHaptic.js';

// KOMPONEN JAM TERISOLASI AGAR TIDAK MEMICU RE-RENDER SELURUH HALAMAN SETIAP DETIK
const HudClock = memo(() => {
    const [currentTime, setCurrentTime] = useState(() => {
        return new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Jakarta'
        });
    });

    useEffect(() => {
        const updateClock = () => {
            setCurrentTime(new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'Asia/Jakarta'
            }));
        };
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="hud-clock-pill">
            <Clock size={12} className="hud-clock-icon" />
            <span>{currentTime} WIB</span>
        </div>
    );
});

const App = () => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [needsInteraction, setNeedsInteraction] = useState(true);

    // KONFIGURASI AWAL AUDIO & MEDIASESSION (TANPA AUTOPLAY / TANPA GESTURE GLOBAL)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = 0.65;
        audio.loop = true;

        // INTEGRASI MEDIASESSION BROWSER DAN PERANGKAT MOBILE
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

    // FUNGSI UTAMA MEMULAI DAN MEMATIKAN MUSIK (HANYA AKTIF SAAT KLIK PLAY ATAU TOMBOL SUARA)
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
        } catch (err) {}
    }, [isPlaying]);

    return (
        <div className="app-wrapper">
            {/* ELEMEN AUDIO HTML5 TUNGGAL TERPUSAT (PRELOAD NONE AGAR NOL BANDWIDTH AWAL) */}
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

            {/* LATAR BELAKANG VIDEO */}
            <video autoPlay muted loop playsInline preload="metadata" id="bg-video">
                <source src={settings.profile.videoBg} type="video/mp4" />
            </video>

            {/* OVERLAY GRID CYBER INDUSTRI */}
            <div className="cyber-grid-overlay" />

            {/* BAR TINDAKAN HUD ATAS */}
            <header className="top-hud-bar">
                <HudClock />

                <div className="hud-actions-group">
                    {/* TOMBOL TOGGLE SUARA & MUSIK: SINKRON 100% DENGAN DOCK PEMUTAR MUSIK */}
                    <button 
                        className="hud-circle-btn"
                        onClick={togglePlay}
                        title={isPlaying ? "Musik Berputar (Klik untuk Mematikan / Menjeda)" : "Musik Mati (Klik untuk Memulai Musik)"}
                        aria-label={isPlaying ? "Matikan musik" : "Mulai musik"}
                    >
                        {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>

                    <button 
                        className="hud-circle-btn" 
                        onClick={handleCopySite}
                        title="Salin Situs Web (https://karinnchans.my.id)"
                        aria-label="Salin tautan situs web"
                    >
                        <Share2 size={16} />
                    </button>
                </div>
            </header>

            {/* AREA KONTEN UTAMA */}
            <main className="main-content-area">
                <div className="profile-container">
                    {/* HERO PROFIL */}
                    <div className="profile-hero">
                        <div className="avatar-frame-outer">
                            <span className="corner-bracket top-left" />
                            <span className="corner-bracket top-right" />
                            <span className="corner-bracket bottom-left" />
                            <span className="corner-bracket bottom-right" />
                            <div className="avatar-wrapper">
                                <img 
                                    src={settings.profile.avatar} 
                                    alt={settings.profile.name} 
                                    className="avatar-image" 
                                    loading="eager"
                                    decoding="async"
                                />
                            </div>
                        </div>

                        <h1 className="display-name">{settings.profile.name}</h1>
                        <p className="handle-text">{settings.profile.handle}</p>

                        <div className="role-headline">
                            <span>{settings.profile.title}</span>
                            <span className="headline-divider">•</span>
                            <span className="location-tag">
                                <MapPin size={12} />
                                {settings.profile.location}
                            </span>
                        </div>

                        <p className="profile-bio-text">
                            {settings.profile.bio}
                        </p>
                    </div>

                    {/* WIDGET KOMUNITAS: SALURAN, GRUP WHATSAPP, & DISCORD */}
                    <WhatsAppChannelCard 
                        channelUrl={settings.profile.whatsappChannel || "https://whatsapp.com/channel/0029VbCz8aUHAdNOPaBL1P3j"}
                        groupUrl={settings.profile.whatsappGroup || "https://chat.whatsapp.com/IFVpqBdZIOGHvdcT1ngaiD"}
                        discordUrl={settings.profile.discordServer || "https://discord.gg/aDmrbdKanG"}
                        soundEnabled={isPlaying}
                    />

                    {/* DAFTAR TAUTAN LINKTREE BERSIH & SIMETRIS */}
                    <div className="simple-links-list">
                        {settings.links.map((link) => (
                            <a 
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="linktree-btn"
                                onClick={() => playClickHaptic(isPlaying)}
                            >
                                <div className="linktree-icon-box">
                                    {link.icon === 'sociabuzz' ? (
                                        <SociaBuzzIcon size={19} />
                                    ) : (
                                        <i className={link.icon}></i>
                                    )}
                                </div>

                                <div className="linktree-text-col">
                                    <span className="linktree-title">{link.title}</span>
                                    <span className="linktree-subtitle">{link.subtitle}</span>
                                </div>

                                <div className="linktree-arrow">
                                    <ArrowUpRight size={17} />
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* PEMISAH BAGIAN: TULISAN PROJECT DI TENGAH-TENGAH */}
                    <div className="section-divider-center">
                        <span className="section-divider-line" />
                        <span className="section-divider-label">PROJECT</span>
                        <span className="section-divider-line" />
                    </div>

                    {/* DAFTAR TOMBOL PROYEK DENGAN LOGO INTERNET BULAT */}
                    <div className="simple-links-list">
                        {settings.projects.map((proj) => (
                            <a 
                                key={proj.id}
                                href={proj.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="linktree-btn"
                                onClick={() => playClickHaptic(isPlaying)}
                            >
                                <div className="linktree-icon-box">
                                    <i className={proj.icon}></i>
                                </div>

                                <div className="linktree-text-col">
                                    <span className="linktree-title">{proj.title}</span>
                                    <span className="linktree-subtitle">{proj.subtitle}</span>
                                </div>

                                <div className="linktree-arrow">
                                    <ArrowUpRight size={17} />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* FOOTER KREDIT SIMETRIS DI TENGAH */}
                <footer className="footer-credits">
                    <p className="footer-text">
                        © {new Date().getFullYear()} <strong>{settings.profile.name}</strong> • {settings.profile.handle}
                    </p>
                    <div className="footer-indicator">
                        <span>Official Links</span>
                    </div>
                </footer>
            </main>

            {/* KAPSUL PEMUTAR MUSIK DI BAGIAN BAWAH */}
            <MusicPlayer 
                isPlaying={isPlaying} 
                onTogglePlay={togglePlay}
                needsInteraction={needsInteraction}
            />
        </div>
    );
};

export default App;
