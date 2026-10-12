import React, { useState, useEffect, memo } from 'react';
import { 
    Play, 
    Pause, 
    X, 
    Music2, 
    Volume2,
    Disc
} from 'lucide-react';
import { settings } from '../settings.js';
import { useScrollLock } from '../hooks/useScrollLock.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { playClickHaptic } from '../utils/audioHaptic.js';

const BIG_WAVE_BARS = [0.3, 0.7, 0.45, 0.9, 0.6, 1.0, 0.5, 0.85, 0.4, 0.65, 0.95, 0.55];

const formatTime = (secs) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const PlayerSheet = memo(({ 
    isOpen, 
    onClose, 
    isPlaying, 
    onTogglePlay, 
    audioElement, 
    soundEnabled 
}) => {
    useScrollLock(isOpen);
    const sheetRef = useFocusTrap(isOpen, onClose);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [touchStartY, setTouchStartY] = useState(null);
    const [touchDeltaY, setTouchDeltaY] = useState(0);

    // PASANG LISTENER TIMEUPDATE READ-ONLY PADA ELEMEN AUDIO YANG SUDAH ADA
    useEffect(() => {
        if (!audioElement) return;

        const updateProgress = () => {
            setCurrentTime(audioElement.currentTime || 0);
            if (audioElement.duration && !isNaN(audioElement.duration)) {
                setDuration(audioElement.duration);
            }
        };

        audioElement.addEventListener('timeupdate', updateProgress);
        audioElement.addEventListener('loadedmetadata', updateProgress);

        updateProgress();

        return () => {
            audioElement.removeEventListener('timeupdate', updateProgress);
            audioElement.removeEventListener('loadedmetadata', updateProgress);
        };
    }, [audioElement]);

    if (!isOpen) return null;

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleTouchStart = (e) => {
        setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        if (touchStartY === null) return;
        const currentY = e.touches[0].clientY;
        const delta = currentY - touchStartY;
        if (delta > 0) {
            setTouchDeltaY(delta);
        }
    };

    const handleTouchEnd = () => {
        if (touchDeltaY > 100) {
            playClickHaptic(soundEnabled);
            onClose();
        }
        setTouchStartY(null);
        setTouchDeltaY(0);
    };

    return (
        <div 
            className="player-sheet-backdrop"
            onClick={onClose}
            role="presentation"
        >
            <div 
                ref={sheetRef}
                className="player-sheet-container"
                role="dialog"
                aria-modal="true"
                aria-labelledby="player-sheet-title"
                style={{
                    transform: touchDeltaY > 0 ? `translateY(${touchDeltaY}px)` : undefined,
                    transition: touchStartY ? 'none' : 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)'
                }}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* DRAG HANDLE FOR MOBILE */}
                <div className="sheet-drag-handle" aria-hidden="true">
                    <span className="sheet-drag-pill" />
                </div>

                {/* HEADER SHEET */}
                <div className="player-sheet-header">
                    <div className="player-sheet-meta-tag">
                        <Disc size={13} strokeWidth={1.5} className="text-[var(--blue-4)]" />
                        <span>AUDIO PLAYER // CONSOLE NOIR</span>
                    </div>

                    <button 
                        className="modal-close-icon-btn"
                        onClick={() => {
                            playClickHaptic(soundEnabled);
                            onClose();
                        }}
                        title="Tutup Pemutar (Esc)"
                        aria-label="Tutup panel pemutar musik"
                    >
                        <X size={17} strokeWidth={1.5} />
                    </button>
                </div>

                {/* COVER ALBUM BESAR */}
                <div className="player-sheet-cover-stage">
                    <div className={`player-sheet-cover-wrapper ${isPlaying ? 'rotating-slow' : ''}`}>
                        <img 
                            src={settings.music.cover} 
                            alt={settings.music.title} 
                            className="player-sheet-cover-img"
                        />
                        <div className="player-sheet-cover-vignette" />
                    </div>
                </div>

                {/* TRACK INFO */}
                <div className="player-sheet-track-info">
                    <h2 id="player-sheet-title" className="player-sheet-title">
                        {settings.music.title}
                    </h2>
                    <p className="player-sheet-artist">
                        {settings.music.artist}
                    </p>
                </div>

                {/* WAVE VISUALIZER BAR BESAR */}
                <div className="player-sheet-wave-strip" aria-hidden="true">
                    {BIG_WAVE_BARS.map((barH, idx) => (
                        <span 
                            key={idx}
                            className={`big-wave-stick ${isPlaying ? 'animated' : ''}`}
                            style={{
                                transform: `scaleY(${isPlaying ? barH : 0.2})`,
                                animationDelay: `${idx * 0.08}s`
                            }}
                        />
                    ))}
                </div>

                {/* PROGRESS BAR READ-ONLY */}
                <div className="player-sheet-progress-box">
                    <div className="player-progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
                        <div 
                            className="player-progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="player-time-labels">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* KONTROL UTAMA: PLAY / PAUSE BESAR */}
                <div className="player-sheet-controls">
                    <button 
                        className="player-sheet-main-toggle"
                        onClick={() => {
                            playClickHaptic(true);
                            onTogglePlay?.();
                        }}
                        title={isPlaying ? "Jeda Audio" : "Putar Audio"}
                        aria-label={isPlaying ? "Jeda audio" : "Putar audio"}
                    >
                        {isPlaying ? (
                            <Pause size={24} strokeWidth={2} />
                        ) : (
                            <Play size={24} strokeWidth={2} className="ml-1" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default PlayerSheet;
