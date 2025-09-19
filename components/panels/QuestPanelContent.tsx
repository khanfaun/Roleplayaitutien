import React from 'react';
import type { Quest } from '../../types';

export const QuestPanelContent: React.FC<{ quests: Quest[] }> = ({ quests }) => {
    const mainQuests = quests.filter(q => q.type === 'Cốt truyện' && q.status === 'Đang tiến hành');
    const sideQuests = quests.filter(q => q.type === 'Phụ' && q.status === 'Đang tiến hành');
    const sectQuests = quests.filter(q => q.type === 'Môn phái' && q.status === 'Đang tiến hành');

    const renderQuest = (q: Quest) => (
        <div key={q.id} className="p-3 bg-slate-800/50 rounded-md mb-2 border border-slate-700/50">
            <p className={`font-bold ${
                q.type === 'Cốt truyện' ? 'text-yellow-300' :
                q.type === 'Phụ' ? 'text-cyan-300' :
                'text-green-300'
            }`}>{q.title} <span className="text-xs font-normal">({q.type})</span></p>
            <p className="italic text-slate-300 text-sm mt-1">{q.description}</p>
            <div className="text-xs text-slate-400 mt-2">
                <p>Thời hạn: {q.timeLimit != null ? `Còn ${q.timeLimit} lượt` : '∞'}</p>
                {(q.progress !== undefined && q.target !== undefined) && <p>Tiến độ: {q.progress || 0}/{q.target}</p>}
            </div>
            {q.rewards && (
                <div className="text-xs text-green-300 mt-2 pt-2 border-t border-slate-700/50">
                    <strong>Thưởng:</strong> {q.rewards.description}
                </div>
            )}
            {q.penalties && (
                <div className="text-xs text-red-300 mt-1">
                    <strong>Phạt:</strong> {q.penalties.description}
                </div>
            )}
        </div>
    );

    return (
         <div className="flex-grow p-2 sm:p-4 space-y-4 text-sm styled-scrollbar overflow-y-auto min-h-0">
            <div>
                <h4 className="text-lg font-bold text-yellow-200 mb-2">Cốt Truyện</h4>
                {mainQuests.length > 0 ? mainQuests.map(renderQuest) : <p className="text-sm text-slate-400 italic">Không có nhiệm vụ cốt truyện nào.</p>}
            </div>
            <div className="mt-3">
                <h4 className="text-lg font-bold text-cyan-200 mb-2">Nhiệm Vụ Phụ</h4>
                {sideQuests.length > 0 ? sideQuests.map(renderQuest) : <p className="text-sm text-slate-400 italic">Không có nhiệm vụ phụ nào.</p>}
            </div>
             <div className="mt-3">
                <h4 className="text-lg font-bold text-green-200 mb-2">Nhiệm Vụ Môn Phái</h4>
                {sectQuests.length > 0 ? sectQuests.map(renderQuest) : <p className="text-sm text-slate-400 italic">Không có nhiệm vụ môn phái nào.</p>}
            </div>
        </div>
    );
};
