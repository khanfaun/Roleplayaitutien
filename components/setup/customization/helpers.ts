// FIX: Added import for React to resolve JSX namespace errors.
import React from 'react';
import type { PlayerAttributes, StatusEffect, NguHanhType } from '../../../types';
import { PLAYER_ATTRIBUTE_NAMES } from '../../../constants';

export const getImageUrl = (imageId: string | undefined) => {
    if (!imageId) return null;
    if (imageId.startsWith('http')) return imageId;
    return `/assets/thienthu/${imageId}`;
};

export const rankMap: Record<number, string> = { 1: 'Phàm Phẩm', 2: 'Hạ Phẩm', 3: 'Trung Phẩm', 4: 'Thượng Phẩm', 5: 'Cực Phẩm', 6: 'Chí Tôn' };

// FIX: Rewrote function to use React.createElement instead of JSX.
// This is necessary because this is a .ts file, not a .tsx file,
// and the build environment seems to not be configured to parse JSX in .ts files,
// which caused a cascade of parsing errors.
export const renderAttributes = (attributes: Partial<PlayerAttributes> | undefined): React.ReactNode => {
    if (!attributes || Object.keys(attributes).length === 0) return null;
    return React.createElement(
        'div',
        null,
        React.createElement('strong', { className: "text-slate-400" }, 'Thuộc tính:'),
        React.createElement(
            'ul',
            { className: "list-disc list-inside pl-2" },
            ...Object.entries(attributes).map(([key, value]) =>
                React.createElement(
                    'li',
                    { key: key },
                    `${PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes]}: `,
                    React.createElement('span', { className: "text-green-300 font-semibold" }, `+${value as number}`)
                )
            )
        )
    );
};

export const getRankColor = (rank?: number) => {
    switch (rank) {
        case 1: return 'text-slate-300'; case 2: return 'text-green-400';
        case 3: return 'text-blue-400';  case 4: return 'text-purple-400';
        case 5: return 'text-orange-400';case 6: return 'text-red-500';
        default: return 'text-white';
    }
};

export const getStatusTypeColor = (type: StatusEffect['type']) => {
    switch (type) {
        case 'buff': return 'text-green-400';
        case 'debuff': return 'text-red-400';
        case 'neutral': return 'text-slate-300';
        default: return 'text-white';
    }
};

export const NGU_HANH_DISPLAY: Record<NguHanhType, { icon: string; name: string; colors: string }> = {
    kim: { icon: '⚙️', name: 'Kim', colors: 'bg-gray-400 text-black' },
    moc: { icon: '🌳', name: 'Mộc', colors: 'bg-green-500 text-white' },
    thuy: { icon: '💧', name: 'Thủy', colors: 'bg-blue-500 text-white' },
    hoa: { icon: '🔥', name: 'Hỏa', colors: 'bg-red-500 text-white' },
    tho: { icon: '⛰️', name: 'Thổ', colors: 'bg-yellow-600 text-black' }
};