import React, { useState, useRef, useEffect } from 'react';
import { XIcon } from '../Icons';
import { DESTINY_DEFINITIONS, STATUS_EFFECT_DEFINITIONS } from '../../data/effects';

export const Selector: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & {label: string}> = ({label, children, ...props}) => (
    <div>
        <label className="block text-xs font-medium text-yellow-300 mb-1">{label}</label>
        <select {...props} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:opacity-50 disabled:bg-slate-800 disabled:cursor-not-allowed">
            {children}
        </select>
    </div>
);

export const DestinySelector: React.FC<{selectedIds: string[], onChange: (ids: string[]) => void, disabled?: boolean}> = ({ selectedIds, onChange, disabled = false }) => {
    const MAX_POINTS = 100;
    const destinies = Object.values(DESTINY_DEFINITIONS);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const spentPoints = selectedIds.reduce((total, id) => total + (DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS]?.cost || 0), 0);
    const remainingPoints = MAX_POINTS - spentPoints;

    const handleSelect = (id: string, cost: number) => {
        if (selectedIds.length < 3 && spentPoints + cost <= MAX_POINTS) {
            onChange([...selectedIds, id]);
        }
    };
    
    const handleRemove = (id: string) => {
        onChange(selectedIds.filter(i => i !== id));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [wrapperRef]);
    
    const selectedDestinies = selectedIds.map(id => DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS]).filter(Boolean);
    const availableDestinies = destinies.filter(d => !selectedIds.includes(d.id));

    return (
        <div>
            <label className="block text-xs font-medium text-yellow-300 mb-1">Tiên Thiên Khí Vận ({remainingPoints} điểm)</label>
            <div ref={wrapperRef} className="relative">
                <div className={`w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-sm text-white flex flex-wrap gap-1 min-h-[38px] ${disabled ? 'cursor-not-allowed bg-slate-800' : 'cursor-pointer'}`} onClick={() => !disabled && setIsOpen(!isOpen)}>
                    {selectedDestinies.map(d => (
                        <div key={d.id} className="flex items-center gap-1 bg-purple-700/80 text-xs font-semibold px-2 py-0.5 rounded">
                            <span>{d.name}</span>
                            {!disabled && <button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(d.id); }} className="text-purple-200 hover:text-white"><XIcon className="w-3 h-3"/></button>}
                        </div>
                    ))}
                    {selectedDestinies.length === 0 && <span className="text-slate-400">Không có</span>}
                </div>
                {isOpen && !disabled && (
                    <div className="absolute z-30 top-full mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-lg p-2 max-h-48 overflow-y-auto styled-scrollbar">
                        {availableDestinies.map(d => {
                            const canAfford = remainingPoints >= d.cost && selectedIds.length < 3;
                            return <button key={d.id} type="button" disabled={!canAfford} onClick={() => handleSelect(d.id, d.cost)} className="w-full text-left text-xs p-1 rounded hover:bg-slate-700 disabled:opacity-50">{d.name} ({d.cost}đ)</button>
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export const StatusEffectSelector: React.FC<{selectedIds: string[], onChange: (ids: string[]) => void, disabled?: boolean}> = ({ selectedIds, onChange, disabled = false }) => {
    const allEffects = Object.values(STATUS_EFFECT_DEFINITIONS);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    
    const toggleSelection = (id: string) => {
        const newSelection = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id];
        onChange(newSelection);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [wrapperRef]);

    return (
        <div>
            <label className="block text-xs font-medium text-yellow-300 mb-1">Trạng thái nhân vật</label>
            <div ref={wrapperRef} className="relative">
                <div onClick={() => !disabled && setIsOpen(!isOpen)} className={`w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-sm text-white flex flex-wrap gap-1 min-h-[38px] ${disabled ? 'cursor-not-allowed bg-slate-800' : 'cursor-pointer'}`}>
                    {selectedIds.length > 0 ? selectedIds.map(id => <span key={id} className="text-xs bg-slate-600 px-2 py-0.5 rounded">{STATUS_EFFECT_DEFINITIONS[id]?.name || id}</span>) : <span className="text-slate-400">Không có</span>}
                </div>
                {isOpen && !disabled && (
                    <div className="absolute z-30 top-full mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-lg p-2 max-h-48 overflow-y-auto styled-scrollbar">
                        {allEffects.map(effect => (
                            <label key={effect.id} className="flex items-center gap-2 p-1 text-xs rounded hover:bg-slate-700">
                                <input type="checkbox" checked={selectedIds.includes(effect.id)} onChange={() => toggleSelection(effect.id)} disabled={disabled} className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-400"/>
                                <span>{effect.name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
