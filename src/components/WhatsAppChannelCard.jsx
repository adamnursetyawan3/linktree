import React, { useState, useEffect, memo, useRef } from 'react';
import { 
    Users, 
    Copy, 
    Check, 
    CheckCircle2, 
    Radio,
    Info
} from 'lucide-react';
import { playClickHaptic } from '../utils/audioHaptic.js';
import AnimatedNumber from './AnimatedNumber.jsx';

// HELPER FETCH CEPAT DENGAN TIMEOUT
const fetchWithTimeout = async (url, timeoutMs = 4500) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return res;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
};

const TAB_INDEX_MAP = {
    channel: 0,
    group: 1,
    discord: 2
};

const WhatsAppChannelCard = memo(({ 
    channelUrl = "https://whatsapp.com/channel/0029VbCz8aUHAdNOPaBL1P3j", 
    groupUrl = "https://chat.whatsapp.com/IFVpqBdZIOGHvdcT1ngaiD",
    discordUrl = "https://discord.gg/aDmrbdKanG",
    soundEnabled = true,
    onShowToast
}) => {
    const [activeTab, setActiveTab] = useState('channel');
    const [showStatDetail, setShowStatDetail] = useState(false);
    const cardRef = useRef(null);

    // DATA DEFAULT SALURAN WHATSAPP
    const [channelData, setChannelData] = useState({
        name: "DANS HUB",
        description: "Selamat datang di saluran saya, saluran ini di fokuskan untuk sharing project gabut gw, belajar bersama tentang code dan pembuatan web static.",
        followers: "380+ Pengikut",
        channel_type: "Saluran WhatsApp",
        is_group: false,
        profile_image: "/avatar.jpg",
        verified: false
    });
    
    // DATA DEFAULT GRUP WHATSAPP
    const [groupData, setGroupData] = useState({
        name: "Homescreen",
        description: "Grup WhatsApp resmi untuk diskusi, sharing, dan komunikasi bersama.",
        followers: "Komunitas Aktif",
        channel_type: "Grup WhatsApp",
        is_group: true,
        profile_image: "/avatar.jpg",
        verified: false
    });

    // DATA DEFAULT SERVER DISCORD
    const [discordData, setDiscordData] = useState({
        name: "DANS HUB",
        description: "Komunitas Discord DANS HUB resmi untuk voice chat, diskusi coding, mabar, dan sharing project.",
        online: 27,
        members: 59,
        channel_type: "Discord Server",
        icon: "https://cdn.discordapp.com/icons/1512510285909327967/8c0fe0034c13b9fd7e686705c1e85cc2.webp?size=128",
        inviteUrl: discordUrl || "https://discord.gg/aDmrbdKanG",
        verified: false
    });
    
    const [copied, setCopied] = useState(false);
    const [imgError, setImgError] = useState(false);

    const currentUrl = activeTab === 'channel' 
        ? channelUrl 
        : (activeTab === 'group' ? groupUrl : discordUrl);

    const activeData = activeTab === 'channel' 
        ? channelData 
        : (activeTab === 'group' ? groupData : discordData);

    // PENGAMBILAN DATA DENGAN SESSION STORAGE CACHE
    const fetchWhatsAppResource = async (url, type) => {
        const cacheKey = `wa_cache_${type}`;
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.ts < 180000) {
                    if (type === 'channel') setChannelData(prev => ({ ...prev, ...parsed.data }));
                    else setGroupData(prev => ({ ...prev, ...parsed.data }));
                    return;
                }
            }
        } catch (e) {}

        try {
            const res = await fetchWithTimeout(`/api/whatsapp-info?url=${encodeURIComponent(url)}`);
            if (!res.ok) return;
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) return;
            
            const data = await res.json();
            if (data && data.success) {
                if (type === 'channel') {
                    setChannelData(prev => ({ ...prev, ...data }));
                } else {
                    setGroupData(prev => ({ ...prev, ...data }));
                }
                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
                } catch (e) {}
            }
        } catch (e) {}
    };

    const fetchDiscordLiveStats = async () => {
        const inviteCode = "aDmrbdKanG";
        const cacheKey = `dc_cache_${inviteCode}`;

        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.ts < 120000) {
                    setDiscordData(prev => ({ ...prev, ...parsed.data }));
                    return;
                }
            }
        } catch (e) {}
        
        try {
            const directRes = await fetchWithTimeout(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`);
            if (directRes.ok) {
                const data = await directRes.json();
                if (data) {
                    const guild = data.guild || {};
                    const iconUrl = guild.id && guild.icon
                        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128`
                        : null;

                    const nextData = {
                        name: guild.name || "DANS HUB",
                        description: guild.description || "Komunitas Discord DANS HUB resmi untuk voice chat, diskusi coding, mabar, dan sharing project.",
                        online: data.approximate_presence_count ?? 27,
                        members: data.approximate_member_count ?? 59,
                        icon: iconUrl || "https://cdn.discordapp.com/icons/1512510285909327967/8c0fe0034c13b9fd7e686705c1e85cc2.webp?size=128"
                    };

                    setDiscordData(prev => ({ ...prev, ...nextData }));
                    try {
                        sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: nextData }));
                    } catch (e) {}
                    return;
                }
            }
        } catch (err) {}

        try {
            const proxyRes = await fetchWithTimeout(`/api/discord-info?code=${inviteCode}`);
            if (proxyRes.ok) {
                const pData = await proxyRes.json();
                if (pData && pData.success) {
                    const nextData = {
                        name: pData.name || "DANS HUB",
                        description: pData.description || "Komunitas Discord DANS HUB resmi untuk voice chat, diskusi coding, mabar, dan sharing project.",
                        online: pData.online ?? 27,
                        members: pData.members ?? 59,
                        icon: pData.icon || "https://cdn.discordapp.com/icons/1512510285909327967/8c0fe0034c13b9fd7e686705c1e85cc2.webp?size=128"
                    };
                    setDiscordData(prev => ({ ...prev, ...nextData }));
                    try {
                        sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: nextData }));
                    } catch (e) {}
                }
            }
        } catch (e) {}
    };

    useEffect(() => {
        setImgError(false);
        const runSync = () => {
            Promise.allSettled([
                fetchWhatsAppResource(channelUrl, 'channel'),
                fetchWhatsAppResource(groupUrl, 'group'),
                fetchDiscordLiveStats()
            ]);
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            const idleId = window.requestIdleCallback(runSync, { timeout: 1000 });
            return () => window.cancelIdleCallback(idleId);
        } else {
            const timer = setTimeout(runSync, 200);
            return () => clearTimeout(timer);
        }
    }, [channelUrl, groupUrl, discordUrl]);

    const handlePointerMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--mouse-x', `${x}px`);
        cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleCopyLink = async () => {
        playClickHaptic(soundEnabled);
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopied(true);
            onShowToast?.("Tautan komunitas berhasil disalin");
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            onShowToast?.("Gagal menyalin tautan");
        }
    };

    const getAvatarSrc = () => {
        if (activeTab === 'discord') {
            return discordData.icon || '/avatar.jpg';
        }
        if (!activeData?.profile_image) return '/avatar.jpg';
        if (activeData.profile_image.startsWith('/')) return activeData.profile_image;
        return `/api/image-proxy?url=${encodeURIComponent(activeData.profile_image)}`;
    };

    const avatarSrc = getAvatarSrc();
    const tabIndex = TAB_INDEX_MAP[activeTab] || 0;

    return (
        <div 
            ref={cardRef} 
            className="community-panel-card card-interactive-glow" 
            id="wa-community-widget"
            onPointerMove={handlePointerMove}
        >
            {/* 1. SEGMENTED TABS DENGAN SLIDING PILL INDICATOR */}
            <div className="community-tabs-header">
                <div className="segmented-tabs-wrapper" role="tablist">
                    {/* SLIDING PILL ELEMENT */}
                    <div 
                        className="sliding-tab-pill" 
                        style={{
                            left: `${(tabIndex * 33.333)}%`,
                            width: '33.333%'
                        }}
                        aria-hidden="true"
                    />

                    <button 
                        role="tab"
                        aria-selected={activeTab === 'channel'}
                        className={`segmented-tab-btn ${activeTab === 'channel' ? 'active' : ''}`}
                        onClick={() => {
                            playClickHaptic(soundEnabled);
                            setImgError(false);
                            setActiveTab('channel');
                            setShowStatDetail(false);
                        }}
                    >
                        <Radio size={13} strokeWidth={1.5} />
                        <span>Saluran</span>
                    </button>
                    <button 
                        role="tab"
                        aria-selected={activeTab === 'group'}
                        className={`segmented-tab-btn ${activeTab === 'group' ? 'active' : ''}`}
                        onClick={() => {
                            playClickHaptic(soundEnabled);
                            setImgError(false);
                            setActiveTab('group');
                            setShowStatDetail(false);
                        }}
                    >
                        <Users size={13} strokeWidth={1.5} />
                        <span>Grup WA</span>
                    </button>
                    <button 
                        role="tab"
                        aria-selected={activeTab === 'discord'}
                        className={`segmented-tab-btn ${activeTab === 'discord' ? 'active' : ''}`}
                        onClick={() => {
                            playClickHaptic(soundEnabled);
                            setImgError(false);
                            setActiveTab('discord');
                            setShowStatDetail(false);
                        }}
                    >
                        <i className="fa-brands fa-discord text-[#5865F2] text-[13px]"></i>
                        <span>Discord</span>
                    </button>
                </div>
            </div>

            {/* 2. ISI DUA BAGIAN DENGAN TRANSISI HALUS (CROSSFADE + GESER TIPIS) */}
            <div key={activeTab} className="community-body-split community-tab-content-fade" role="tabpanel">
                {/* KIRI: AVATAR, NAMA, DESKRIPSI */}
                <div className="community-left-col">
                    <div className="community-identity-row">
                        <div className="community-avatar-box">
                            {avatarSrc && !imgError ? (
                                <img 
                                    src={avatarSrc} 
                                    alt={activeData?.name || "Community"} 
                                    className="community-avatar-img"
                                    loading="lazy"
                                    decoding="async"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <div className="community-avatar-fallback">
                                    {activeTab === 'discord' ? (
                                        <i className="fa-brands fa-discord text-[#5865F2] text-xl"></i>
                                    ) : (
                                        <i className="fa-brands fa-whatsapp text-[var(--blue-4)] text-xl"></i>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="community-name-meta">
                            <div className="community-title-line">
                                <h3 className="community-title-text">
                                    {activeData?.name || (activeTab === 'channel' ? 'Saluran WhatsApp' : (activeTab === 'group' ? 'Grup WhatsApp' : 'Server Discord'))}
                                </h3>
                                {activeData?.verified && (
                                    <span className="community-verified-icon" title="Verified">
                                        <CheckCircle2 size={13} strokeWidth={1.5} />
                                    </span>
                                )}
                            </div>
                            <span className="community-type-badge">
                                {activeTab === 'discord' ? 'Discord Server' : (activeTab === 'group' ? 'Grup WhatsApp' : 'Saluran WhatsApp')}
                            </span>
                        </div>
                    </div>

                    <p className="community-desc-text">
                        {activeData?.description || (activeTab === 'channel' 
                            ? 'Saluran informasi seputar teknologi, web development, dan update terbaru.' 
                            : (activeTab === 'group' 
                                ? 'Grup WhatsApp resmi untuk diskusi, sharing, dan komunikasi bersama.' 
                                : 'Komunitas Discord resmi DANS HUB untuk voice chat, diskusi coding, mabar, dan sharing project.'))}
                    </p>
                </div>

                {/* KANAN: STATISTIK INTERAKTIF (KLIK UNTUK MEMBALIK / MELIHAT DETAIL LENGKAP TANPA MENGARANG DATA) */}
                <div className="community-right-col">
                    <div 
                        className={`stat-flip-wrapper ${showStatDetail ? 'flipped' : ''}`}
                        onClick={() => {
                            playClickHaptic(soundEnabled);
                            setShowStatDetail(prev => !prev);
                        }}
                        role="button"
                        tabIndex={0}
                        title="Klik untuk melihat rincian metrik"
                        aria-label="Detail metrik komunitas"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                playClickHaptic(soundEnabled);
                                setShowStatDetail(prev => !prev);
                            }
                        }}
                    >
                        {!showStatDetail ? (
                            activeTab === 'discord' ? (
                                <div className="stat-mono-cluster">
                                    <div className="stat-mono-card">
                                        <div className="stat-mono-val stat-online-val">
                                            <span className="discord-status-dot" />
                                            <AnimatedNumber value={discordData.online} />
                                        </div>
                                        <span className="stat-mono-lbl">ONLINE</span>
                                    </div>
                                    <div className="stat-mono-card">
                                        <div className="stat-mono-val">
                                            <AnimatedNumber value={discordData.members} />
                                        </div>
                                        <span className="stat-mono-lbl">MEMBERS</span>
                                    </div>
                                    <div className="stat-hint-tag">
                                        <Info size={10} strokeWidth={1.5} />
                                        <span>Rincian</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="stat-mono-cluster single-stat">
                                    <div className="stat-mono-card">
                                        <div className="stat-mono-val">
                                            <AnimatedNumber value={activeData?.followers || (activeTab === 'channel' ? '380+' : 'Aktif')} />
                                        </div>
                                        <span className="stat-mono-lbl">
                                            {activeTab === 'channel' ? 'PENGIKUT' : 'KOMUNITAS'}
                                        </span>
                                    </div>
                                    <div className="stat-hint-tag">
                                        <Info size={10} strokeWidth={1.5} />
                                        <span>Rincian</span>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="stat-detail-expanded-panel">
                                <span className="stat-detail-heading">METRIK STATUS</span>
                                {activeTab === 'discord' ? (
                                    <div className="stat-detail-lines">
                                        <p><strong>{discordData.online}</strong> anggota sedang online</p>
                                        <p><strong>{discordData.members}</strong> total anggota server</p>
                                    </div>
                                ) : (
                                    <div className="stat-detail-lines">
                                        <p><strong>{activeData?.followers || '380+ Pengikut'}</strong></p>
                                        <p>Status: {activeTab === 'channel' ? 'Saluran Terbuka' : 'Grup Komunitas'}</p>
                                    </div>
                                )}
                                <span className="stat-detail-close-hint">Ketuk untuk kembali</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. TOMBOL AKSI: TOMBOL BUKA LEBAR PENUH + TOMBOL SALIN KOTAK */}
            <div className="community-actions-bar">
                <a 
                    href={currentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="primary-action-btn"
                    onClick={() => playClickHaptic(soundEnabled)}
                >
                    {activeTab === 'discord' ? (
                        <i className="fa-brands fa-discord btn-brand-icon text-[#5865F2]"></i>
                    ) : (
                        <i className="fa-brands fa-whatsapp btn-brand-icon"></i>
                    )}
                    <span>
                        {activeTab === 'channel' ? 'Buka Saluran' : (activeTab === 'group' ? 'Gabung Grup' : 'Gabung Discord')}
                    </span>
                </a>

                <button 
                    className="square-copy-btn" 
                    onClick={handleCopyLink}
                    title="Salin Link"
                    aria-label="Salin tautan komunitas"
                >
                    {copied ? (
                        <Check size={15} strokeWidth={1.5} className="text-[var(--status-online)]" />
                    ) : (
                        <Copy size={15} strokeWidth={1.5} />
                    )}
                </button>
            </div>
        </div>
    );
});

export default WhatsAppChannelCard;
