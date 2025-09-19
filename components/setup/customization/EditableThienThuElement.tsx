import React from 'react';
import type { InitialItem, InitialCongPhap, NguHanhType } from '../../../types';
import * as Icons from '../../Icons';
import { PencilIcon, TrashIcon } from '../../Icons';
import { EffectSelector } from '../elements/ElementHelpers';
import { getImageUrl, getRankColor, NGU_HANH_DISPLAY } from './helpers';

export const EditableThienThuElement: React.FC<{
    item: any;
    typeLabel: string;
    children: React.ReactNode;
    onEdit: () => void;
    onDelete: () => void;
    nameColorClass?: string;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onOpenImageModal: () => void;
    onUnassignImage: () => void;
}> = ({ item, typeLabel, children, onEdit, onDelete, nameColorClass, isSelected, onToggleSelect, onOpenImageModal, onUnassignImage }) => (
    <details className="bg-slate-800/50 rounded-md border border-slate-700/50 overflow-hidden">
        <summary className="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-700/30">
            <div className="flex-grow flex items-center gap-3">
                 <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(item.id)}
                    onClick={e => e.stopPropagation()}
                    className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-500 flex-shrink-0"
                />
                <div className="w-14 h-14 flex-shrink-0 bg-slate-700 rounded-md overflow-hidden relative group">
                    {(() => {
                        const imageUrl = getImageUrl(item.imageId);
                        return imageUrl ? (
                            <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                               <Icons.QuestionMarkCircleIcon className="w-8 h-8"/>
                            </div>
                        );
                    })()}
                    {item.imageId && (
                        <button onClick={(e) => { e.stopPropagation(); onUnassignImage(); }} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10" title="Gỡ ảnh">
                             <Icons.XIcon className="w-3 h-3"/>
                        </button>
                    )}
                     <button
                        onClick={(e) => { e.stopPropagation(); onOpenImageModal(); }}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Đổi hình ảnh"
                     >
                        <Icons.PencilIcon className="w-6 h-6 text-white"/>
                    </button>
                </div>
                <div className="flex flex-col">
                    <div>
                        <span className={`font-semibold ${nameColorClass || getRankColor(item.rank)}`}>{item.name}</span>
                        <span className="text-xs text-slate-400 ml-2">({typeLabel})</span>
                    </div>
                     {item.nguHanhAttribute && NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType] && (
                        <span className={`mt-1 px-2 py-0.5 text-xs font-bold rounded flex items-center gap-1 self-start ${NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType].colors}`}>
                            <span>{NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType].icon}</span>
                            <span>{NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType].name}</span>
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><TrashIcon className="w-4 h-4"/></button>
            </div>
        </summary>
        <div className="p-3 border-t border-slate-700/50 bg-slate-900/30 text-xs space-y-2">
            {children}
            {(item as (InitialItem | InitialCongPhap)).effectIds && (item as (InitialItem | InitialCongPhap)).effectIds!.length > 0 && (
                <div>
                    <strong className="text-slate-400">Hiệu ứng:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {(item as (InitialItem | InitialCongPhap)).effectIds!.map(id => <EffectSelector key={id} selectedIds={[id]} onChange={() => {}} itemType="display" />)}
                    </div>
                </div>
            )}
        </div>
    </details>
);
