import React, { useState, memo } from 'react';
import { 
    Play, 
    Pause, 
    Music2,
    X
} from 'lucide-react';
import { settings } from './settings.js';

// HAPTIC RINGAN PERANGKAT MOBILE
const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(12);
    }
};

const WAVE_BARS = [0.35, 0.80, 0.55, 0.95, 0.45];

const MusicPlayer = memo(({ 
    isPlaying = false, 
    onTogglePlay, 
    needsInteraction = false 
}) => {
    const [coverError, setCoverError] = useState(false);
    const [showCoverModal, setShowCoverModal] = useState(false);

    const handlePlayClick = (e) => {
        e?.stopPropagation?.();
        triggerHaptic();
        onTogglePlay?.();
    };

    // TAMPILKAN PRATINJAU COVER LENGKAP KETIKA COVER DIKLIK (TANPA MENGGANGGU PLAY/PAUSE)
    const handleCoverClick = (e) => {
        e?.stopPropagation?.();
        triggerHaptic();
        setShowCoverModal(true);
    };

    return (
        <>
            {/* DOCK KAPSUL CYBER INDUSTRIAL */}
            <div 
                className="ios-pill-dock"
                id="ios-pill-dock"
            >
                <div 
                    className="ios-island-capsule"
                    onClick={handlePlayClick}
                    id="ios-island-capsule"
                    role="button"
                    tabIndex={0}
                    aria-label={isPlaying ? "Jeda Audio" : "Putar Audio"}
                >
                    {/* KIRI: SAMPUL ALBUM MUSIK */}
                    <div 
                        className="ios-capsule-art"
                        onClick={handleCoverClick}
                        title="Klik untuk melihat sampul album penuh"
                        role="button"
                        tabIndex={0}
                        aria-label="Lihat sampul album penuh"
                    >
                        {!coverError ? (
                            <img 
                                src={settings.music.cover} 
                                alt={settings.music.title} 
                                className={`ios-capsule-cover ${isPlaying ? 'playing' : ''}`}
                                loading="lazy"
                                decoding="async"
                                onError={() => setCoverError(true)}
                            />
                        ) : (
                            <div className="ios-capsule-fallback">
                                <Music2 size={16} className="text-[#00B8DB]" />
                            </div>
                        )}
                    </div>

                    {/* TENGAH: JUDUL LAGU & NAMA ARTIS */}
                    <div className="ios-capsule-meta">
                        <span className="ios-capsule-title">
                            {settings.music.title}
                        </span>
                        <span className="ios-capsule-artist">
                            {isPlaying 
                                ? settings.music.artist 
                                : (needsInteraction ? "ketuk untuk memutar musik" : `${settings.music.artist} • dijeda`)}
                        </span>
                    </div>

                    {/* KANAN: VISUALISASI GELOMBANG SUARA ANIMATIF (GPU ACCELERATED) */}
                    <div className="ios-capsule-soundwave" aria-hidden="true">
                        {WAVE_BARS.map((barScale, idx) => (
                            <span 
                                key={idx} 
                                className={`ios-wave-bar ${isPlaying ? 'animated' : ''}`}
                                style={{
                                    transform: `scaleY(${isPlaying ? barScale : 0.24})`,
                                    animationDelay: `${idx * 0.12}s`
                                }}
                            />
                        ))}
                    </div>

                    {/* TOMBOL PINTAS PUTAR / JEDA */}
                    <button 
                        className="ios-capsule-play-btn"
                        onClick={handlePlayClick}
                        id="ios-capsule-play-btn"
                        aria-label={isPlaying ? "Jeda audio" : "Putar audio"}
                    >
                        {isPlaying ? (
                            <Pause size={14} className="fill-current" />
                        ) : (
                            <Play size={14} className="fill-current" />
                        )}
                    </button>
                </div>
            </div>

            {/* MODAL PRATINJAU COVER PENUH KETIKA COVER DIKLIK */}
            {showCoverModal && (
                <div 
                    className="cover-lightbox-backdrop"
                    onClick={() => setShowCoverModal(false)}
                >
                    <div 
                        className="cover-lightbox-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="cover-lightbox-header">
                            <div className="cover-lightbox-meta">
                                <span className="cover-lightbox-title">{settings.music.title}</span>
                                <span className="cover-lightbox-artist">{settings.music.artist}</span>
                            </div>
                            <button 
                                className="cover-lightbox-close"
                                onClick={() => setShowCoverModal(false)}
                                title="Tutup Pratinjau Sampul"
                                aria-label="Tutup pratinjau sampul"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="cover-lightbox-img-box">
                            <img 
                                src={settings.music.cover} 
                                alt={settings.music.title} 
                                className="cover-lightbox-img"
                                decoding="async"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

export default MusicPlayer;
