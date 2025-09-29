// FIX: Added import for React to resolve JSX namespace errors.
import React, { useEffect } from 'react';
import type { InitialSect, WorldLocation } from '../../../../types';
import { getSectDisplayName } from '../shared';

// New RelationshipGrid component to handle the new UI
const RelationshipGrid: React.FC<{
    allSects: InitialSect[];
    currentSectId: string;
    formData: InitialSect;
    onRelationshipChange: (newRelationships: InitialSect['relationships']) => void;
}> = ({ allSects, currentSectId, formData, onRelationshipChange }) => {
    
    const otherSects = allSects.filter(s => s.id !== currentSectId);
    const relationships = formData.relationships || {};

    const relationshipTypes: { key: keyof Required<InitialSect>['relationships'], label: string, colorClass: string }[] = [
        { key: 'allied', label: 'Đồng minh', colorClass: 'accent-blue-500' },
        { key: 'friendly', label: 'Thân thiện', colorClass: 'accent-green-500' },
        { key: 'neutral', label: 'Trung lập', colorClass: 'accent-slate-300' },
        { key: 'rival', label: 'Cạnh tranh', colorClass: 'accent-yellow-500' },
        { key: 'hostile', label: 'Thù địch', colorClass: 'accent-red-500' },
    ];

    const handleRelationshipChangeForSect = (otherSectId: string, newType: keyof Required<InitialSect>['relationships']) => {
        const newRelationships = JSON.parse(JSON.stringify(formData.relationships || {}));
        const currentRel = getCurrentRelationship(otherSectId);

        // Remove from all existing lists
        relationshipTypes.forEach(({ key }) => {
            if (newRelationships[key]) {
                newRelationships[key] = newRelationships[key].filter((id: string) => id !== otherSectId);
            }
        });

        // If the clicked radio button was not already selected, add it to the new list.
        // If it was already selected, this effectively "clears" the selection for that sect.
        if (currentRel !== newType) {
            if (!newRelationships[newType]) {
                newRelationships[newType] = [];
            }
            newRelationships[newType].push(otherSectId);
        }

        onRelationshipChange(newRelationships);
    };

    const getCurrentRelationship = (otherSectId: string): keyof Required<InitialSect>['relationships'] | null => {
        for (const { key } of relationshipTypes) {
            if (relationships[key]?.includes(otherSectId)) {
                return key;
            }
        }
        return null;
    };
    
    return (
        <div>
            <div className="grid grid-cols-7 gap-2 text-xs font-bold text-slate-400 mb-2 px-2 text-center items-center" style={{ minHeight: '2.5rem' }}>
                <div className="col-span-2 text-left">Thế lực</div>
                {relationshipTypes.map(({ label }) => <div key={label} className="whitespace-normal break-words leading-tight" title={label}>{label}</div>)}
            </div>
            <div className="max-h-48 overflow-y-auto styled-scrollbar space-y-1 p-2 bg-slate-800 border border-slate-600 rounded-lg">
                {otherSects.length === 0 && <p className="text-xs text-slate-400 italic">Không có thế lực nào khác để chọn.</p>}
                {otherSects.map(sect => {
                    const currentRel = getCurrentRelationship(sect.id);
                    return (
                        <div key={sect.id} className="grid grid-cols-7 gap-2 items-center p-1 rounded hover:bg-slate-700/50">
                            <div className="col-span-2 text-sm" title={getSectDisplayName(sect, allSects)}>
                                <span className="truncate">{getSectDisplayName(sect, allSects)}</span>
                            </div>
                            {relationshipTypes.map(({ key, colorClass }) => (
                                <div key={key} className="flex justify-center">
                                    <input
                                        type="radio"
                                        name={`rel-${sect.id}`}
                                        checked={currentRel === key}
                                        onChange={() => handleRelationshipChangeForSect(sect.id, key)}
                                        className={`h-4 w-4 rounded-full border-slate-500 bg-slate-700 focus:ring-yellow-500 cursor-pointer ${colorClass}`}
                                    />
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


interface SectFormProps {
    formData: any;
    handleChange: (field: string, value: any) => void;
    allSects: InitialSect[];
    renderField: (id: string, label: string, type: 'text' | 'textarea' | 'select' | 'select-tree' | 'number' | 'checkbox', options?: any, placeholder?: string, disabled?: boolean) => JSX.Element;
    allWorldLocations: WorldLocation[];
}

export const SectForm: React.FC<SectFormProps> = ({ formData, handleChange, allSects, renderField, allWorldLocations }) => {
    const isSubSect = formData.parentSectId !== null && formData.parentSectId !== undefined && formData.parentSectId !== '';

    useEffect(() => {
        if (isSubSect && formData.parentSectId) {
            const parentSect = allSects.find(s => s.id === formData.parentSectId);
            if (parentSect) {
                const location = allWorldLocations.find(l => l.id === formData.locationId);
                const newName = location ? `${location.name} Phân Đà` : "Phân đà (chưa chọn địa điểm)";
                const newDescription = `${parentSect.description}\n\nĐây là phân đà của ${parentSect.name} tại ${location?.name || 'khu vực chưa xác định'}.`;
                
                if (formData.name !== newName) handleChange('name', newName);
                if (formData