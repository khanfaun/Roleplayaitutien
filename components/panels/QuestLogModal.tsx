import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import type { GameState, Quest, HeThongQuest } from '../../types';
import Panel from '../Panel';
import { XIcon, BookOpenIcon, ChevronDownIcon } from '../Icons';

const QuestLogItem: React.FC<{ quest: Quest | HeThongQuest }> = ({ quest }) => {
    const isHeThong = 'heThongPoints' in (quest.rewards || {});
    
    let questTypeLabel: string;
    let colorClass: string;

    if (isHeThong) {
        questTypeLabel = `Hệ thống - ${quest.type}`;
        colorClass = 'text-cyan-300';
    } else {
        questTypeLabel = quest.type;
        switch (quest.type) {
            case 'Cốt truyện':
                colorClass = 'text-yellow-300';
                break;
            case 'Môn phái':
                colorClass = 'text-green-300';
                break;
            case 'Phụ':
            default:
                colorClass = 'text-blue-300';
        }
    }
    
    const statusStyles = {
        'Đang tiến hành': 'border-l-cyan-400',
        'Hoàn thành': 'border-l-green-400',
        'Thất bại': 'border-l-red-400',
    }[quest.status] || 'border-l-slate-600';

    return (
        <details className={`p-3 bg-slate-800/50 rounded-md border-l-4 ${statusStyles}`}>
            <summary className="flex justify-between items-start cursor-pointer">
                <div>
                    <p className={`font-bold ${colorClass}`}>{quest.title}</p>
                    {isHeThong && <p className="text-xs text-slate-400">({questTypeLabel})</p>}
                </div>
                 <span className={`text-xs font-semibold px-2 py-1 rounded-full ${quest.status === 'Hoàn thành' ? 'bg-green-500/20 text-green-300' : quest.status === 'Thất bại' ? 'bg-red-500/20 text-red-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                    {quest.status}
                </span>
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

const QuestStatusSection: React.FC<{ title: string; quests: (Quest | HeThongQuest)[]; colorClass: string; }> = ({ title, quests, colorClass }) => {
    if (quests.length === 0) return null;
    return (
        <details className="mb-4" open>
             <summary className={`text-lg font-bold ${colorClass} mb-2 cursor-pointer flex items-center gap-2`}>
                <ChevronDownIcon className="w-5 h-5"/>
                {title} ({quests.length})
            </summary>
            <div className="space-y-2 pl-4 border-l-2 border-slate-700/50">
                {[...quests].reverse().map(q => <QuestLogItem key={q.id} quest={q} />)}
            </div>
        </details>
    );
};


export const QuestLogModal: React.FC<{ isOpen: boolean, onClose: () => void, gameState: GameState }> = ({ isOpen, onClose, gameState }) => {
    if (!isOpen) return null;

    type QuestTab = 'cotTruyen' | 'ngoaiTuyen' | 'monPhai' | 'heThong';
    const [activeTab, setActiveTab] = useState<QuestTab>('cotTruyen');
    
    const tabs: {id: QuestTab; label: string;}[] = [
        { id: 'cotTruyen', label: 'Cốt truyện' },
        { id: 'ngoaiTuyen', label: 'Ngoại tuyến' },
        { id: 'monPhai', label: 'Môn phái' },
        { id: 'heThong', label: 'Hệ thống' },
    ];

    const getQuestsForTab = (tab: QuestTab): (Quest | HeThongQuest)[] => {
        switch(tab) {
            case 'cotTruyen': return gameState.quests.filter(q => q.type === 'Cốt truyện');
            case 'ngoaiTuyen': return gameState.quests.filter(q => q.type === 'Phụ');
            case 'monPhai': return gameState.quests.filter(q => q.type === 'Môn phái');
            case 'heThong': return gameState.heThong.quests;
            default: return [];
        }
    };
    
    const currentQuests = getQuestsForTab(activeTab);
    const inProgress = currentQuests.filter(q => q.status === 'Đang tiến hành');
    const completed = currentQuests.filter(q => q.status === 'Hoàn thành');
    const failed = currentQuests.filter(q => q.status === 'Thất bại');


    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-3xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <Panel
                    title="Nhật Ký Nhiệm Vụ"
                    icon={<BookOpenIcon />}
                    className="w-full h-full flex flex-col"
                    isCollapsed={false}
                    onToggle={onClose}
                    contentNoOverflow
                    actionButton={{ icon: <XIcon />, onClick: onClose, title: "Đóng" }}
                >
                    <div className="flex flex-col h-full">
                         <div className="flex-shrink-0 flex border-b-2 border-slate-700/50">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 p-3 text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-slate-700/50 text-yellow-300' : 'text-slate-400 hover:bg-slate-700/30'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 overflow-y-auto styled-scrollbar h-full">
                            {currentQuests.length === 0 ? (
                                <p className="text-center text-slate-400 italic mt-8">Không có nhiệm vụ nào trong mục này.</p>
                            ) : (
                                <>
                                    <QuestStatusSection title="Đang Tiến Hành" quests={inProgress} colorClass="text-cyan-300" />
                                    <QuestStatusSection title="Đã Hoàn Thành" quests={completed} colorClass="text-green-400" />
                                    <QuestStatusSection title="Đã Thất Bại" quests={failed} colorClass="text-red-400" />
                                </>
                            )}
                        </div>
                    </div>
                </Panel>
            </div>
        </div>,
        document.body
    );
};