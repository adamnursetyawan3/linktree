import React, { memo } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { playClickHaptic } from '../utils/audioHaptic.js';

export const ViewToggle = memo(({ viewMode = 'grid', onChangeView, soundEnabled }) => {
    return (
        <div className="view-toggle-capsule" role="group" aria-label="Tata Letak Tampilan">
            <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => {
                    if (viewMode !== 'grid') {
                        playClickHaptic(soundEnabled);
                        onChangeView('grid');
                    }
                }}
                aria-pressed={viewMode === 'grid'}
                title="Tampilan Grid"
                aria-label="Tampilan Grid"
            >
                <LayoutGrid size={13} strokeWidth={1.5} />
                <span className="view-toggle-label">Grid</span>
            </button>

            <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => {
                    if (viewMode !== 'list') {
                        playClickHaptic(soundEnabled);
                        onChangeView('list');
                    }
                }}
                aria-pressed={viewMode === 'list'}
                title="Tampilan Daftar"
                aria-label="Tampilan Daftar"
            >
                <List size={13} strokeWidth={1.5} />
                <span className="view-toggle-label">Daftar</span>
            </button>
        </div>
    );
});

export default ViewToggle;
