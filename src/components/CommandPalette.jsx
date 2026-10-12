import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { 
    Search, 
    X, 
    FolderKanban, 
    Share2, 
    Compass, 
    ArrowRight,
    CornerDownLeft,
    Layers,
    Users,
    Mail,
    Home,
    Activity
} from 'lucide-react';
import { settings } from '../settings.js';
import { useScrollLock } from '../hooks/useScrollLock.js';
import { playClickHaptic } from '../utils/audioHaptic.js';
import SociaBuzzIcon from './SociaBuzzIcon.jsx';

const SECTIONS = [
    { id: 'beranda', title: 'Beranda', subtitle: 'Kembali ke atas profil & bio', icon: Home, type: 'section' },
    { id: 'stack', title: 'Tech Stack', subtitle: 'Daftar keahlian & teknologi', icon: Layers, type: 'section' },
    { id: 'metrik', title: 'Metrik & Analitik', subtitle: 'Statistik pengunjung, performa & uptime', icon: Activity, type: 'section' },
    { id: 'project', title: 'Portfolio Projects', subtitle: 'Jelajahi karya & aplikasi', icon: FolderKanban, type: 'section' },
    { id: 'komunitas', title: 'Komunitas & Hub', subtitle: 'WhatsApp channel, grup & Discord', icon: Users, type: 'section' },
    { id: 'kontak', title: 'Kontak & Tautan Terverifikasi', subtitle: 'Social media & platform profiles', icon: Mail, type: 'section' }
];

export const CommandPalette = memo(({ 
    isOpen, 
    onClose, 
    onSelectProject, 
    onSelectSocial, 
    soundEnabled 
}) => {
    useScrollLock(isOpen);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    const projects = settings.projects || [];
    const links = settings.links || [];

    // FOKUSKAN INPUT SAAT PALETTE TERBUKA
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 60);
        }
    }, [isOpen]);

    // FILTER HASIL BERDASARKAN QUERY
    const filteredItems = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            // Tampilkan section navigation + featured items jika input kosong
            return [
                ...SECTIONS,
                ...projects.slice(0, 3).map((p, idx) => ({ ...p, type: 'project', projIndex: idx })),
                ...links.slice(0, 3).map(l => ({ ...l, type: 'link' }))
            ];
        }

        const matchSections = SECTIONS.filter(s => 
            s.title.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q)
        );

        const matchProjects = projects
            .map((p, idx) => ({ ...p, type: 'project', projIndex: idx }))
            .filter(p => 
                p.title.toLowerCase().includes(q) || 
                (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
                (p.tag && p.tag.toLowerCase().includes(q))
            );

        const matchLinks = links
            .map(l => ({ ...l, type: 'link' }))
            .filter(l => 
                l.title.toLowerCase().includes(q) || 
                (l.subtitle && l.subtitle.toLowerCase().includes(q)) ||
                (l.tag && l.tag.toLowerCase().includes(q))
            );

        return [...matchSections, ...matchProjects, ...matchLinks];
    }, [query, projects, links]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // AUTO SCROLL KE ITEM TERPILIH
    useEffect(() => {
        if (listRef.current) {
            const activeEl = listRef.current.querySelector('.cmd-item.selected');
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    const executeItem = (item) => {
        playClickHaptic(soundEnabled);
        onClose();

        if (item.type === 'section') {
            const el = document.getElementById(item.id);
            if (el) {
                setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        } else if (item.type === 'project') {
            onSelectProject?.(item.projIndex);
        } else if (item.type === 'link') {
            onSelectSocial?.(item.id);
            const el = document.getElementById('kontak');
            if (el) {
                setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredItems[selectedIndex]) {
                executeItem(filteredItems[selectedIndex]);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="command-palette-backdrop"
            onClick={onClose}
            role="presentation"
        >
            <div 
                className="command-palette-dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Pencarian & Pintasan Navigasi"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                {/* SEARCH INPUT BAR */}
                <div className="command-palette-search-bar">
                    <Search size={16} strokeWidth={1.5} className="text-[var(--blue-4)] shrink-0" />
                    <input 
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari project, tautan, atau lompat ke section..."
                        className="command-palette-input"
                    />
                    {query ? (
                        <button 
                            className="cmd-clear-btn"
                            onClick={() => setQuery('')}
                            aria-label="Hapus kata kunci"
                        >
                            <X size={14} strokeWidth={1.5} />
                        </button>
                    ) : (
                        <kbd className="cmd-esc-tag">ESC</kbd>
                    )}
                </div>

                {/* RESULTS LIST */}
                <div ref={listRef} className="command-palette-list" role="listbox">
                    {filteredItems.length === 0 ? (
                        <div className="command-empty-state">
                            <span>Tidak ditemukan hasil untuk "{query}"</span>
                        </div>
                    ) : (
                        filteredItems.map((item, idx) => {
                            const isSelected = idx === selectedIndex;
                            return (
                                <div 
                                    key={`${item.type}-${item.id || idx}`}
                                    className={`cmd-item ${isSelected ? 'selected' : ''}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => executeItem(item)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                >
                                    <div className="cmd-item-icon-box">
                                        {item.type === 'section' && (
                                            <item.icon size={15} strokeWidth={1.5} />
                                        )}
                                        {item.type === 'project' && (
                                            <FolderKanban size={15} strokeWidth={1.5} />
                                        )}
                                        {item.type === 'link' && (
                                            item.icon === 'sociabuzz' ? (
                                                <SociaBuzzIcon size={15} />
                                            ) : (
                                                <i className={`${item.icon} text-sm`}></i>
                                            )
                                        )}
                                    </div>

                                    <div className="cmd-item-content">
                                        <div className="cmd-item-title-row">
                                            <span className="cmd-item-title">{item.title}</span>
                                            {item.tag && (
                                                <span className="cmd-item-tag">{item.tag}</span>
                                            )}
                                            {item.type === 'section' && (
                                                <span className="cmd-item-type-tag">Navigasi</span>
                                            )}
                                        </div>
                                        <span className="cmd-item-subtitle">{item.subtitle}</span>
                                    </div>

                                    <div className="cmd-item-action-hint">
                                        {isSelected && (
                                            <CornerDownLeft size={13} strokeWidth={1.5} className="text-[var(--blue-3)]" />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* FOOTER HINTS */}
                <div className="command-palette-footer">
                    <div className="cmd-hint-group">
                        <kbd className="cmd-kbd">↑</kbd>
                        <kbd className="cmd-kbd">↓</kbd>
                        <span>Pilih</span>
                    </div>
                    <div className="cmd-hint-group">
                        <kbd className="cmd-kbd">↵</kbd>
                        <span>Buka</span>
                    </div>
                    <div className="cmd-hint-group">
                        <kbd className="cmd-kbd">ESC</kbd>
                        <span>Tutup</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default CommandPalette;
