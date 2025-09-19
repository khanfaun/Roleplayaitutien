import React from 'react';
import type { GameState } from '../../types';
import { HeartIcon, StarIcon, ZapIcon, RunningIcon, BrainIcon } from '../Icons';

const StatBar: React.FC<{icon: React.ReactNode, value: number, max: number, colorClass: string, title: string}> = ({icon, value, max, colorClass, title}) => (
    <div className="flex flex-col gap-1 items-center" title={title}>
        <div className="flex items-center gap-1.5 w-full justify-center">
            {icon}
            <span className="font-mono text-slate-200 text-xs whitespace-nowrap">{value}/{max}</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${Math.max(0, (value / max) * 100)}%` }}></div>
        </div>
    </div>
);

export const MobileStatsHeader: React.FC<{ player: GameState['player'] }> = ({ player }) => (
    <div className="flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-2 grid grid-cols-5 gap-2 text-xs border-b border-slate-700/50">
        <StatBar icon={<HeartIcon className="w-4 h-4 text-red-400"/>} value={player.hp} max={player.maxHp} colorClass="bg-gradient-to-r from-red-500 to-orange-500" title="Sinh Lực" />
        <StatBar icon={<ZapIcon className="w-4 h-4 text-blue-400"/>} value={player.spiritPower} max={player.maxSpiritPower} colorClass="bg-gradient-to-r from-blue-500 to-cyan-400" title="Linh Lực" />
        <StatBar icon={<RunningIcon className="w-4 h-4 text-green-400"/>} value={player.stamina} max={player.maxStamina} colorClass="bg-gradient-to-r from-green-500 to-emerald-500" title="Thể Lực" />
        <StatBar icon={<BrainIcon className="w-4 h-4 text-purple-400"/>} value={player.mentalState} max={player.maxMentalState} colorClass="bg-gradient-to-r from-purple-500 to-violet-500" title="Tâm Cảnh" />
        <StatBar icon={<StarIcon className="w-4 h-4 text-yellow-400"/>} value={player.exp} max={player.maxExp} colorClass="bg-gradient-to-r from-amber-400 to-yellow-500" title="Kinh Nghiệm" />
    </div>
);
