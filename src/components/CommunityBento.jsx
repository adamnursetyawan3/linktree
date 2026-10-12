import React, { useState, useEffect, memo } from 'react';
import { 
    Clock, 
    Music2, 
    Play, 
    Pause, 
    Radio, 
    Users, 
    Activity,
    Maximize2
} from 'lucide-react';
import { settings } from '../settings.js';
import WhatsAppChannelCard from './WhatsAppChannelCard.jsx';
import { playClickHaptic } from '../utils/audioHaptic.js';
import { subscribeWibClock } from '../utils/timeSource.js';

const WAVE_BARS = [0.4, 0.9, 0.6, 1.0, 0.5, 0.8];

// BLOK JAM KONSOL EDITORIAL (TANPA KOTAK KARTU)
const EditorialClockWidget = memo(() => {
    const [timeStr, setTimeStr] = useState('');
    const [dateStr, setDateStr] = useState('');

    useEffect(() => {
        const updateDate = () => {
            const now = new Date();
            setDateStr(now.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                timeZone: 'Asia/Jakarta'
            }));
        };
        updateDate();
        return subscribeWibClock((time) => {
            setTimeStr(time);
        });
    }, []);

    return (
        <div className="editorial-clock-panel">
            <div className="editorial-panel-meta-row">
                <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--blue-3)]">
                    <Clock size={12} strokeWidth={1.5} className="text-[var(--blue-4)]" />
                    <span>WAKTU SISTEM</span>
                </div>
                <span className="font-mono text-[11px] text-[var(--blue-4)]">WIB // UTC+7</span>
            </div>

            <div className="editorial-big-clock-val">{timeStr} WIB</div>
            <div className="editorial-date-val">{dateStr}</div>
            <div className="editorial-tz-meta font-mono text-[11px] text-[var(--blue-4)]">
                ZONE // ASIA/JAKARTA
            </div>
        </div>
    );
});

// BLOK AUDIO NOW PLAYING EDITORIAL
const EditorialNowPlayingWidget = memo(({ isPlaying, onTogglePlay, soundEnabled, onOpenPlayerSheet }) => {
    return (
        <div 
            className="editorial-music-panel"
            onClick={onOpenPlayerSheet}
            role="button"
            tabIndex={0}
            title="Klik untuk membuka pemutar audio penuh"
            aria-label="Buka panel pemutar musik"
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenPlayerSheet?.();
                }
            }}
        >
            <div className="editorial-panel-meta-row">
                <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--blue-3)]">
                    <Music2 size={12} strokeWidth={1.5} className="text-[var(--blue-4)]" />
                    <span>KONSOL AUDIO</span>
                </div>
                {isPlaying ? (
                    <span className="font-mono text-[10px] text-emerald-400 font-semibold tracking-wider">
                        [MEMUTAR]
                    </span>
                ) : (
                    <span className="font-mono text-[10px] text-[var(--blue-4)] tracking-wider">
                        [TERHENTI]
                    </span>
                )}
            </div>

            <div className="editorial-music-inner">
                <div className="editorial-cover-wrap">
                    <img 
                        src={settings.music.cover} 
                        alt={settings.music.title} 
                        className={`editorial-cover-img ${isPlaying ? 'rotating' : ''}`}
                    />
                </div>

                <div className="editorial-music-info">
                    <span className="editorial-music-track">{settings.music.title}</span>
                    <span className="editorial-music-artist">{settings.music.artist}</span>

                    <div className="editorial-wave-bars" aria-hidden="true">
                        {WAVE_BARS.map((scale, i) => (
                            <span 
                                key={i} 
                                className={`editorial-bar ${isPlaying ? 'animated' : ''}`}
                                style={{
                                    transform: `scaleY(${isPlaying ? scale : 0.2})`,
                                    animationDelay: `${i * 0.1}s`
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        className="editorial-audio-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            playClickHaptic(soundEnabled);
                            onTogglePlay?.();
                        }}
                        aria-label={isPlaying ? "Jeda musik" : "Putar musik"}
                    >
                        {isPlaying ? <Pause size={14} strokeWidth={1.5} /> : <Play size={14} strokeWidth={1.5} />}
                    </button>
                </div>
            </div>
        </div>
    );
});

export const CommunityBento = memo(({ 
    isPlaying, 
    onTogglePlay, 
    soundEnabled, 
    onShowToast, 
    onOpenPlayerSheet 
}) => {
    return (
        <section id="komunitas" className="editorial-section" aria-label="Komunitas dan Status">
            <div className="section-container">
                {/* HEADER SECTION EDITORIAL */}
                <header className="editorial-section-header">
                    <div className="editorial-kicker-row">
                        <span className="editorial-kicker-num">04</span>
                        <span className="editorial-kicker-slash">/</span>
                        <h2 className="editorial-kicker-title">KOMUNITAS & KONSOL REALTIME</h2>
                    </div>

                    <div className="editorial-header-actions">
                        <span className="text-xs font-mono text-[var(--blue-3)]">
                            SALURAN, DISCORD & SINKRONISASI
                        </span>
                    </div>
                </header>

                {/* EDITORIAL GRID DUA KOLOM */}
                <div className="editorial-community-grid">
                    {/* KOLOM KIRI: WIDGET TAB SALURAN / GRUP WA / DISCORD */}
                    <div className="editorial-community-main">
                        <WhatsAppChannelCard 
                            channelUrl={settings.profile.whatsappChannel}
                            groupUrl={settings.profile.whatsappGroup}
                            discordUrl={settings.profile.discordServer}
                            soundEnabled={soundEnabled}
                            onShowToast={onShowToast}
                        />
                    </div>

                    {/* KOLOM KANAN: JAM WIB BESAR & AUDIO CONTROLLER */}
                    <div className="editorial-community-side">
                        <EditorialClockWidget />
                        <EditorialNowPlayingWidget 
                            isPlaying={isPlaying}
                            onTogglePlay={onTogglePlay}
                            soundEnabled={soundEnabled}
                            onOpenPlayerSheet={onOpenPlayerSheet}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
});

export default CommunityBento;
