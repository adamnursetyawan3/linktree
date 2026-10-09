import React, { useState, useEffect, memo } from 'react';
import { 
    Users, 
    Copy, 
    Check, 
    CheckCircle2, 
    MessageCircle,
    Radio
} from 'lucide-react';
import { playClickHaptic } from '../utils/audioHaptic.js';

// HELPER FETCH CEPAT DENGAN BATAS TIMEOUT AGAR TIDAK PERNAH MENGGANTUNG JARINGAN
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

const WhatsAppChannelCard = memo(({ 
    channelUrl = "https://whatsapp.com/channel/0029VbCz8aUHAdNOPaBL1P3j", 
    groupUrl = "https://chat.whatsapp.com/IFVpqBdZIOGHvdcT1ngaiD",
    discordUrl = "https://discord.gg/aDmrbdKanG",
    soundEnabled = true
}) => {
    // TAB AKTIF: CHANNEL, GROUP, ATAU DISCORD
    const [activeTab, setActiveTab] = useState('channel');

    // DATA DEFAULT SALURAN WHATSAPP (DANS HUB)
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

    // DATA DEFAULT SERVER DISCORD (LANGSUNG TAMPIL DENGAN STATISTIK REALTIME)
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

    // PENGAMBILAN DATA WHATSAPP DENGAN SESSION CACHE AGAR INSTAN
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

    // PENGAMBILAN DATA LANGSUNG DARI DISCORD DENGAN SESSION CACHE
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
        
        // 1. PERCOBAAN LANGSUNG KE DISCORD PUBLIC API (FULL CORS SUPPORT)
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

        // 2. FALLBACK PROXY BACKEND JIKA BROWSER MEMBLOKIR DIRECT REQUEST
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

    // SINKRONISASI DATA WHATSAPP & DISCORD DI LATAR BELAKANG SAAT IDLE (TANPA LAG)
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

    const handleCopyLink = async () => {
        playClickHaptic(soundEnabled);
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {}
    };

    // LOGIKA PENENTUAN SUMBER GAMBAR AVATAR
    const getAvatarSrc = () => {
        if (activeTab === 'discord') {
            return discordData.icon || '/avatar.jpg';
        }
        if (!activeData?.profile_image) return '/avatar.jpg';
        if (activeData.profile_image.startsWith('/')) return activeData.profile_image;
        return `/api/image-proxy?url=${encodeURIComponent(activeData.profile_image)}`;
    };

    const avatarSrc = getAvatarSrc();

    return (
        <div className="wa-channel-card" id="wa-community-widget">
            {/* SWITCHER TAB ATAS: SALURAN, GRUP WHATSAPP, DAN DISCORD */}
            <div className="wa-card-top-controls">
                <div className="wa-tabs-switcher">
                    <button 
                        className={`wa-tab-btn ${activeTab === 'channel' ? 'active' : ''}`}
                        onClick={() => {
                            playClickHaptic(soundEnabled);
                            setImgError(false);
                            setActiveTab('channel');
                        }}
                    >
                        <Radio size={12} />
                        <span>Saluran</span>
                    </button>
                    <button 
                        className={`wa-tab-btn ${activeTab === 'group' ? 'active' : ''}`}
                        onClick={() => {
                            playClickHaptic(soundEnabled);
                            setImgError(false);
                            setActiveTab('group');
                        }}
                    >
                        <Users size={12} />
                        <span>Grup WA</span>
                    </button>
                    <button 
                        className={`wa-tab-btn ${activeTab === 'discord' ? 'active' : ''}`}
                        onClick={() => {
                            playClickHaptic(soundEnabled);
                            setImgError(false);
                            setActiveTab('discord');
                        }}
                    >
                        <i className="fa-brands fa-discord text-[12px]"></i>
                        <span>Discord</span>
                    </button>
                </div>

                <div className="wa-top-tag">
                    <span>Komunitas</span>
                </div>
            </div>

            <div key={activeTab} className="wa-tab-panel">
                <div className="wa-channel-content">
                    {/* AVATAR / ICON KOMUNITAS */}
                    <div className="wa-avatar-container">
                        {avatarSrc && !imgError ? (
                            <img 
                                src={avatarSrc} 
                                alt={activeData?.name || "Community"} 
                                className="wa-avatar-img"
                                loading="lazy"
                                decoding="async"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="wa-avatar-fallback">
                                {activeTab === 'discord' ? (
                                    <i className="fa-brands fa-discord text-[#5865F2] text-2xl"></i>
                                ) : (
                                    <MessageCircle size={24} className="text-[#00B8DB]" />
                                )}
                            </div>
                        )}
                    </div>

                    {/* KOLOM INFORMASI KOMUNITAS */}
                    <div className="wa-info-col">
                        <div className="wa-title-row">
                            <h3 className="wa-channel-name">
                                {activeData?.name || (activeTab === 'channel' ? 'Saluran WhatsApp' : (activeTab === 'group' ? 'Grup WhatsApp' : 'Server Discord'))}
                            </h3>
                            {activeData?.verified && (
                                <span className="wa-verified-badge" title="Verified">
                                    <CheckCircle2 size={15} />
                                </span>
                            )}
                        </div>

                        {/* META ROW DENGAN LIVE STALK STATS */}
                        <div className="wa-meta-row">
                            {activeTab === 'discord' ? (
                                <>
                                    {/* INDIKATOR STATUS ONLINE DENGAN TITIK HIJAU PULSING */}
                                    <span className="wa-meta-pill discord-online-pill" title="Pengguna Online Saat Ini">
                                        <span className="discord-pulse-dot" />
                                        <strong>{discordData.online} Online</strong>
                                    </span>

                                    {/* JUMLAH ANGGOTA SERVER */}
                                    <span className="wa-meta-pill discord-members-pill" title="Total Anggota Server">
                                        <Users size={12} />
                                        <strong>{discordData.members} Member</strong>
                                    </span>

                                    <span className="wa-meta-pill discord-tag-pill">
                                        <strong>Server</strong>
                                    </span>
                                </>
                            ) : (
                                <span className="wa-meta-pill wa-followers-pill">
                                    <Users size={12} />
                                    <strong>{activeData?.followers || (activeTab === 'channel' ? 'Saluran Resmi' : 'Komunitas Aktif')}</strong>
                                </span>
                            )}
                        </div>

                        <p className="wa-description-text">
                            {activeData?.description || (activeTab === 'channel' 
                                ? 'Saluran informasi seputar teknologi, web development, dan update terbaru.' 
                                : (activeTab === 'group' 
                                    ? 'Grup WhatsApp resmi untuk diskusi, sharing, dan komunikasi bersama.' 
                                    : 'Komunitas Discord resmi DANS HUB untuk voice chat, diskusi coding, mabar, dan sharing project.'))}
                        </p>
                    </div>
                </div>

                {/* TOMBOL AKSI KOMUNITAS */}
                <div className="wa-actions-row">
                    <a 
                        href={currentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`wa-join-btn ${activeTab === 'discord' ? 'discord-join-btn' : ''}`}
                        onClick={() => playClickHaptic(soundEnabled)}
                    >
                        <i className={`${activeTab === 'discord' ? 'fa-brands fa-discord' : 'fa-brands fa-whatsapp'} wa-btn-icon`}></i>
                        <span>
                            {activeTab === 'channel' ? 'Buka Saluran' : (activeTab === 'group' ? 'Gabung Grup' : 'Gabung Discord')}
                        </span>
                    </a>

                    <button 
                        className="wa-copy-btn" 
                        onClick={handleCopyLink}
                        title="Salin Link"
                        aria-label="Salin tautan komunitas"
                    >
                        {copied ? <Check size={14} className="text-[#34D399]" /> : <Copy size={14} />}
                        <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
});

export default WhatsAppChannelCard;
