import React from 'react';

export const ComparisonStatRow: React.FC<{ label: string; valueLeft: number; valueRight: number; isPercent?: boolean; }> = ({ label, valueLeft, valueRight, isPercent }) => {
    const change = valueRight - valueLeft;
    const changeColor = change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-slate-400';
    const valLeftStr = valueLeft === -1 ? 'Bất tử' : `${valueLeft}${isPercent ? '%' : ''}`;
    const valRightStr = valueRight === -1 ? 'Bất tử' : `${valueRight}${isPercent ? '%' : ''}`;
    const changePrefix = change > 0 ? '+' : '';
    const changeStr = change !== 0 ? `→ ${changePrefix}${change} →` : `→`;

    return (
        <div className="grid grid-cols-2 items-center gap-2 text-sm py-1 px-3">
            <span className="font-semibold text-slate-300">{label}</span>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 text-center items-center">
                <span className="font-bold text-white">{valLeftStr}</span>
                <span className={`font-mono text-xs ${changeColor}`}>{changeStr}</span>
                <span className={`font-bold ${valueRight > valueLeft ? 'text-green-400' : 'text-white'}`}>{valRightStr}</span>
            </div>
        </div>
    );
};
