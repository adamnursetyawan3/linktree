import React, { memo } from 'react';
import { 
    Play, 
    Pause, 
    Music2, 
    Maximize2 
} from 'lucide-react';
import { settings } from './settings.js';

const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(12);
    }
};

const WAVE_BARS = [0.35, 0.80, 0.55, 0.95, 0.45];

export const MusicPlayer = memo(({ 
    isPlaying = false, 
    onTogglePlay, 
    needsInteraction = false,
    onOpenSheet
}) => {
    const handlePlayClick = (e) => {
        e?.stopPropagation?.();
        triggerHaptic();
        onTogglePlay?.();
    };

    const handleBarClick = () => {
        triggerHaptic();
        onOpenSheet?.();
    };

    return (
        <div 
            className="bottom-player-bar" 
            id="bottom-player-bar"
            onClick={handleBarClick}
            role="button"
            tabIndex={0}
            title="Klik untuk membuka panel pemutar audio penuh"
            aria-label="Panel pemutar musik"
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBarClick();
                }
            }}
        >
            <div className="player-bar-container">
                {/* KIRI: COVER ALBUM */}
                <div className="player-cover-box">
                    <img 
                        src={settings.music.cover} 
                        alt={settings.music.title} 
                        className={`player-cover-img ${isPlaying ? 'playing' : ''}`}
                        loading="lazy"
                        decoding="async"
                    />
                </div>

                {/* TENGAH: JUDUL DAN ARTIS */}
                <div className="player-info-col">
                    <span className="player-track-title">
                        {settings.music.title}
                    </span>
                    <span className="player-artist-name">
                        {isPlaying 
                            ? settings.music.artist 
                            : (needsInteraction ? "ketuk untuk memutar musik" : `${settings.music.artist} • dijeda`)}
                    </span>
                </div>

                {/* VISUALISASI WAVE BARS ANIMATIF */}
                <div className="player-wave-group" aria-hidden="true">
                    {WAVE_BARS.map((barScale, idx) => (
                        <span 
                            key={idx} 
                            className={`player-wave-stick ${isPlaying ? 'animated' : ''}`}
                            style={{
                                transform: `scaleY(${isPlaying ? barScale : 0.22})`,
                                animationDelay: `${idx * 0.12}s`
                            }}
                        />
                    ))}
                </div>

                {/* EXPAND ICON HINT */}
                <div className="player-expand-hint" aria-hidden="true">
                    <Maximize2 size={13} strokeWidth={1.5} className="text-[var(--blue-4)]" />
                </div>

                {/* KANAN: TOMBOL PLAY/PAUSE UTAMA */}
                <button 
                    className="player-action-toggle"
                    onClick={handlePlayClick}
                    id="player-action-toggle"
                    aria-label={isPlaying ? "Jeda audio" : "Putar audio"}
                >
                    {isPlaying ? (
                        <Pause size={14} strokeWidth={1.5} />
                    ) : (
                        <Play size={14} strokeWidth={1.5} />
                    )}
                </button>
            </div>
        </div>
    );
});

export default MusicPlayer;
