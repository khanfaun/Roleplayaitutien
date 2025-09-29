import type { NguHanhType } from '../../types';

export const getRankColor = (rank?: number) => {
    switch (rank) {
        case 1: return 'text-slate-300';
        case 2: return 'text-green-400';
        case 3: return 'text-blue-400';
        case 4: return 'text-purple-400';
        case 5: return 'text-orange-400';
        case 6: return 'text-red-500';
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