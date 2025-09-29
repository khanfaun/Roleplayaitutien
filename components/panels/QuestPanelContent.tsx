import React from 'react';
import type { Quest, HeThongQuest, GameState } from '../../types';

const QuestDisplay: React.FC<{ quest: Quest | HeThongQuest }> = ({ quest }) => {
    const isHeThong = 'heThongPoints' in (quest.rewards || {});
    
    let questTypeLabel, colorClass, borderClass;

    if (isHeThong) {
        questTypeLabel = `Hệ thống - ${quest.type}`;
        colorClass = 'text-cyan-300';
        borderClass = 'border-cyan-700/50 bg-cyan-900/40';
    } else {
        questTypeLabel = quest.type;
        switch (quest.type) {
            case 'Cốt truyện':
                colorClass = 'text-yellow-300';
                borderClass = 'border-yellow-700/50 bg-yellow-900/40';
                break;
            case 'Môn phái':
                colorClass = 'text-green-300';
                borderClass = 'border-green-700/50 bg-green-900/40';
                break;
            case 'Phụ':
            default:
                colorClass = 'text-cyan-300';
                borderClass = 'border-cyan-700/50 bg-cyan-900/40';
        }
    }

    return (
        <details key={quest.id} className={`p-3 rounded-md border ${borderClass}`}>
            <summary className="flex justify-between items-start cursor-pointer">
                <div>
                    <p className={`font-bold ${colorClass}`}>{quest.title}</p>
                    {isHeThong && <p className="text-xs text-slate-400">({questTypeLabel})</p>}
                </div>
            </summary>
            <div className="mt-2 pt-2 border-t border-slate-700/50 space-y-2">
                <p className="italic text-slate-300 text-sm">{quest.description}</p>
                {'hiddenObjective' in quest && quest.hiddenObjective && !quest.hiddenObjective.completed && (
                    <p className="text-xs text-purple-300 bg-purple-900/30 p-1 rounded-sm">Mục tiêu ẩn: ???</p>
                )}
                {'hiddenObjective' in quest && quest.hiddenObjective && quest.hiddenObjective.completed && (
                    <p className="text-xs text-green-300 bg-green-900/30 p-1 rounded-sm">Đã hoàn thành mục tiêu ẩn!</p>
                )}
                <div className="text-xs text-slate-400">
                    <p>Thời hạn: {quest.timeLimit != null ? `Còn ${quest.timeLimit} lượt` : 'Vĩnh viễn'}</p>
                    {'progress' in quest && quest.progress !== undefined && quest.target !== undefined && <p>Tiến độ: {quest.progress || 0}/{quest.target}</p>}
                </div>
                {quest.rewards && (
                    <div className="text-xs text-green-300 pt-1 border-t border-slate-700/30">
                        <strong>Thưởng:</strong> {quest.rewards.description}
                    </div>
                )}
                {quest.penalties && (
                    <div className="text-xs text-red-300">
                        <strong>Phạt:</strong> {quest.penalties.description}
                    </div>
                )}
            </div>
        </details>
    );
};

export const QuestPanelContent: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    const { quests, heThong } = gameState;
    const mainQuests = quests.filter(q => q.type === 'Cốt truyện' && q.status === 'Đang tiến hành');
    const sideQuests = quests.filter(q => q.type === 'Phụ' && q.status === 'Đang tiến hành');
    const sectQuests = quests.filter(q => q.type === 'Môn phái' && q.status === 'Đang tiến hành');
    const heThongQuests = heThong.quests.filter(q => q.status === 'Đang tiến hành');

    const renderCategory = (title: string, color: string, quests: (Quest | HeThongQuest)[]) => (
        <div>
            <h4 className={`text-lg font-bold ${color} mb-2`}>{title}</h4>
            {quests.length > 0 ? (
                <div className="space-y-2">
                    {quests.map(q => <QuestDisplay key={q.id} quest={q} />)}
                </div>
            ) : (
                <p className="text-sm text-slate-400 italic">Không có nhiệm vụ nào.</p>
            )}
        </div>
    );
    
    return (
         <div className="flex-grow p-2 sm:p-4 space-y-4 text-sm styled-scrollbar overflow-y-auto min-h-0">
            {renderCategory('Cốt Truyện', 'text-yellow-200', mainQuests)}
            {renderCategory('Nhiệm Vụ Môn Phái', 'text-green-200', sectQuests)}
            {renderCategory('Nhiệm Vụ Phụ', 'text-cyan-200', sideQuests)}
            {gameState.player.heThongStatus !== 'disabled' && renderCategory('Nhiệm Vụ Hệ Thống', 'text-cyan-100', heThongQuests)}
        </div>
    );
};