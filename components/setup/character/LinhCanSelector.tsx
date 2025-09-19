import React from 'react';
import type { LinhCanQuality } from '../../../types';

const linhCanOptions: {
    value: LinhCanQuality;
    label: string;
    orbClass: string;
    glowClass: string;
}[] = [
    { value: 'Thiên Linh Căn', label: 'Thiên', orbClass: 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white', glowClass: 'shadow-yellow-400/50' },
    { value: 'Địa Linh Căn', label: 'Địa', orbClass: 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white', glowClass: 'shadow-purple-500/50' },
    { value: 'Huyền Linh Căn', label: 'Huyền', orbClass: 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white', glowClass: 'shadow-cyan-400/50' },
    { value: 'Phàm Linh Căn', label: 'Phàm', orbClass: 'bg-gradient-to-br from-emerald-400 to-green-600 text-white', glowClass: 'shadow-emerald-400/50' },
    { value: 'Ngụy Linh Căn', label: 'Ngụy', orbClass: 'bg-gradient-to-br from-slate-500 to-gray-700 text-white', glowClass: 'shadow-slate-500/50' },
];

export const LinhCanSelector = ({ value, onChange, displayOnly = false }: { value: LinhCanQuality, onChange: (newValue: LinhCanQuality) => void, displayOnly?: boolean }) => {
    const optionsToShow = displayOnly ? linhCanOptions.filter(option => option.value === value) : linhCanOptions;
    
    return (
        <div>
            <label className="block text-sm font-medium text-yellow-300 mb-2">Phẩm Chất Linh Căn</label>
            <div className={`flex ${displayOnly ? 'justify-center' : 'justify-around'} items-center gap-2 p-2 bg-slate-900/50 rounded-lg`}>
                {optionsToShow.map(option => {
                    const isSelected = displayOnly || value === option.value;
                    
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => !displayOnly && onChange(option.value)}
                            className={`relative w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform ${
                                isSelected
                                    ? 'scale-110 opacity-100' 
                                    : 'scale-90 opacity-60 hover:opacity-100 hover:scale-100'
                            }`}
                            title={option.value}
                            disabled={displayOnly}
                        >
                            <div className={`absolute inset-0 rounded-full ${option.orbClass} ${ isSelected ? `shadow-lg ${option.glowClass}` : ''} transition-all`}></div>
                            <span className="relative text-lg font-semibold">{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};