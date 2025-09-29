import React, { useState, useRef } from 'react';
import type { GameState, Rule, JournalEntry, ScenarioStage } from '../../types';
import { PlusCircleIcon, PencilIcon, TrashIcon, CheckIcon, XIcon, BuildingLibraryIcon } from '../Icons';
import { ThienThuPanelContent } from '../GamePanels';

const EditableList = ({ title, items, onUpdate, onAdd, onDelete, itemDisplay = 'text' }: { title: string, items: any[], onUpdate: (id: string, text: string) => void, onAdd: (text: string) => void, onDelete: (id: string) => void, itemDisplay?: 'text' | 'journal' }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [newItemText, setNewItemText] = useState('');

    const handleEditStart = (item: any) => {
        setEditingId(item.id);
        setEditText(item.text);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditText('');
    };

    const handleConfirmUpdate = (id: string) => {
        if (!editText.trim()) return;
        onUpdate(id, editText);
        handleEditCancel();
    };

    const handleConfirmAdd = () => {
        if (!newItemText.trim()) return;
        onAdd(newItemText);
        setNewItemText('');
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-lg font-bold text-yellow-300 mb-2">{title} ({items.length})</h3>
            <div className="flex-1 space-y-2 overflow-y-auto styled-scrollbar pr-2 min-h-0">
                {items.map((item) => (
                    <div key={item.id} className="p-2 bg-slate-900/50 rounded-md border border-slate-700/50 flex items-start gap-2">
                        {editingId === item.id ? (
                            <div className="flex-grow flex flex-col gap-2">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full h-24 bg-slate-900 border border-slate-600 rounded-md px-2 py-1 text-sm text-white focus:outline-none ring-1 ring-yellow-500"
                                    autoFocus
                                />
                                <div className="flex items-center gap-2 self-end">
                                    <button onClick={() => handleConfirmUpdate(item.id)} className="p-1 text-green-400 hover:bg-slate-700 rounded-full"><CheckIcon className="w-5 h-5"/></button>
                                    <button onClick={handleEditCancel} className="p-1 text-gray-400 hover:bg-slate-700 rounded-full"><XIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex-grow">
                                    {itemDisplay === 'text' && <span className="text-sm">{item.text}</span>}
                                    {itemDisplay === 'journal' && <span className="text-sm"><strong className="text-yellow-300">Lượt {item.turn}:</strong> {item.text}</span>}
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-1">
                                    <button onClick={() => handleEditStart(item)} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                                    <button onClick={() => onDelete(item.id)} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="pt-2 mt-2 border-t border-slate-700/50 flex items-center gap-2">
                <input
                    type="text"
                    value={newItemText}
                    onChange={e => setNewItemText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleConfirmAdd()}
                    placeholder="Thêm mục mới..."
                    className="flex-grow bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                />
                <button onClick={handleConfirmAdd} className="p-2 text-green-400 hover:bg-slate-700 rounded-full"><PlusCircleIcon className="w-6 h-6"/></button>
            </div>
        </div>
    );
};

const EditableScenarioStageList: React.FC<{
    title: string;
    items: ScenarioStage[];
    onUpdate: (id: string, text: string) => void;
    onAdd: (text: string) => void;
    onDelete: (id: string) => void;
    onToggleComplete: (id: string, completed: boolean) => void;
}> = ({ title, items, onUpdate, onAdd, onDelete, onToggleComplete }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [newItemText, setNewItemText] = useState('');

    const handleEditStart = (item: ScenarioStage) => {
        setEditingId(item.id);
        setEditText(item.text);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditText('');
    };

    const handleConfirmUpdate = (id: string) => {
        if (!editText.trim()) return;
        onUpdate(id, editText);
        handleEditCancel();
    };

    const handleConfirmAdd = () => {
        if (!newItemText.trim()) return;
        onAdd(newItemText);
        setNewItemText('');
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-lg font-bold text-yellow-300 mb-2">{title} ({items.length})</h3>
            <div className="flex-1 space-y-2 overflow-y-auto styled-scrollbar pr-2 min-h-0">
                {items.map((item) => (
                    <div key={item.id} className="p-2 bg-slate-900/50 rounded-md border border-slate-700/50 flex items-start gap-3">
                        {editingId === item.id ? (
                            <div className="flex-grow flex flex-col gap-2">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full h-24 bg-slate-900 border border-slate-600 rounded-md px-2 py-1 text-sm text-white focus:outline-none ring-1 ring-yellow-500"
                                    autoFocus
                                />
                                <div className="flex items-center gap-2 self-end">
                                    <button onClick={() => handleConfirmUpdate(item.id)} className="p-1 text-green-400 hover:bg-slate-700 rounded-full"><CheckIcon className="w-5 h-5"/></button>
                                    <button onClick={handleEditCancel} className="p-1 text-gray-400 hover:bg-slate-700 rounded-full"><XIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={(e) => onToggleComplete(item.id, e.target.checked)}
                                    className="h-5 w-5 mt-0.5 rounded border-gray-500 bg-slate-700 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-slate-900 cursor-pointer flex-shrink-0"
                                />
                                <div className={`flex-grow ${item.completed ? 'text-slate-500 line-through' : ''}`}>
                                    <span className="text-sm">{item.text}</span>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-1">
                                    <button onClick={() => handleEditStart(item)} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                                    <button onClick={() => onDelete(item.id)} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="pt-2 mt-2 border-t border-slate-700/50 flex items-center gap-2">
                <input
                    type="text"
                    value={newItemText}
                    onChange={e => setNewItemText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleConfirmAdd()}
                    placeholder="Thêm giai đoạn mới..."
                    className="flex-grow bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                />
                <button onClick={handleConfirmAdd} className="p-2 text-green-400 hover:bg-slate-700 rounded-full"><PlusCircleIcon className="w-6 h-6"/></button>
            </div>
        </div>
    );
};


export const ManagementPanelContent: React.FC<{
    gameState: GameState;
    onRulesChange: (type: 'thienDao' | 'ai' | 'coreMemory', rules: Rule[]) => void;
    onJournalChange: (journal: JournalEntry[]) => void;
    onScenarioUpdate: (updates: { summary?: string; stages?: ScenarioStage[] }) => void;
    onScenarioStageChange: (stageId: string, completed: boolean) => void;
    handleSaveGame: () => void;
    handleLoadGame: (file: File) => void;
    handleGoHome: () => void;
    handleClearApiKey: () => void;
    thienThu: GameState['thienThu'];
    onItemImageChange: (itemType: 'vatPhamTieuHao' | 'trangBi' | 'phapBao' | 'congPhap', itemId: string, imageId: string) => void;
}> = ({
    gameState, onRulesChange, onJournalChange, onScenarioUpdate, onScenarioStageChange, handleSaveGame, handleLoadGame, handleGoHome, handleClearApiKey, thienThu, onItemImageChange
}) => {
    const [activeSubTab, setActiveSubTab] = useState('thaoTac');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleLoadGame(file);
        }
    };

    const tabs = [
        { id: 'thaoTac', label: 'Thao Tác Game' },
        { id: 'giaiDoan', label: 'Giai Đoạn' },
        { id: 'thienDao', label: 'Luật Thiên Đạo' },
        { id: 'ai', label: 'Luật AI' },
        { id: 'coreMemory', label: 'Bộ Nhớ Cốt Lõi' },
        { id: 'nhatKy', label: 'Nhật Ký' },
        { id: 'thienThu', label: 'Thiên Thư' },
    ];

    return (
        <div className="flex-grow flex flex-col styled-scrollbar min-h-0">
            <div className="flex-shrink-0 flex border-b border-slate-700 overflow-x-auto styled-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`flex-1 p-2 text-xs font-semibold transition-colors whitespace-nowrap ${activeSubTab === tab.id ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="p-4 text-sm overflow-y-auto styled-scrollbar flex-1">
                {activeSubTab === 'thaoTac' && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-yellow-300">Thao Tác Game</h3>
                            <p className="text-xs text-slate-400">Lưu tiến trình, tải file đã lưu, hoặc quay về trang chủ.</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <button onClick={handleSaveGame} className="px-3 py-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 rounded">Lưu Game</button>
                                <button onClick={handleLoadClick} className="px-3 py-1.5 text-sm font-semibold bg-cyan-600 hover:bg-cyan-700 rounded">Tải Game</button>
                                <button onClick={handleGoHome} className="px-3 py-1.5 text-sm font-semibold bg-red-800 hover:bg-red-700 rounded">Về Trang Chủ</button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json,application/json" className="hidden" />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-700">
                             <h3 className="text-lg font-bold text-yellow-300">Quản lý API Key</h3>
                             <p className="text-xs text-slate-400">Xóa API Key hiện tại để nhập lại một key mới.</p>
                             <div className="flex flex-wrap gap-2 mt-2">
                                <button onClick={handleClearApiKey} className="px-3 py-1.5 text-sm font-semibold bg-red-600 hover:bg-red-700 rounded">Xóa và Đổi API Key</button>
                             </div>
                        </div>
                    </div>
                )}
                {activeSubTab === 'giaiDoan' && (
                    <EditableScenarioStageList
                        title="Các Giai Đoạn Cốt Truyện"
                        items={gameState.scenarioStages}
                        onUpdate={(id, text) => onScenarioUpdate({ stages: gameState.scenarioStages.map(s => s.id === id ? { ...s, text } : s) })}
                        onAdd={text => onScenarioUpdate({ stages: [...gameState.scenarioStages, { id: `stage_${Date.now()}`, text, completed: false }] })}
                        onDelete={id => onScenarioUpdate({ stages: gameState.scenarioStages.filter(s => s.id !== id) })}
                        onToggleComplete={onScenarioStageChange}
                    />
                )}
                {activeSubTab === 'thienDao' && (
                     <EditableList
                        title="Luật Thiên Đạo"
                        items={gameState.thienDaoRules}
                        onUpdate={(id, text) => onRulesChange('thienDao', gameState.thienDaoRules.map(r => r.id === id ? { ...r, text } : r))}
                        onAdd={text => onRulesChange('thienDao', [...gameState.thienDaoRules, { id: `td_${Date.now()}`, text }])}
                        onDelete={id => onRulesChange('thienDao', gameState.thienDaoRules.filter(r => r.id !== id))}
                    />
                )}
                {activeSubTab === 'ai' && (
                    <EditableList
                        title="Luật AI"
                        items={gameState.aiRules}
                        onUpdate={(id, text) => onRulesChange('ai', gameState.aiRules.map(r => r.id === id ? { ...r, text } : r))}
                        onAdd={text => onRulesChange('ai', [...gameState.aiRules, { id: `ai_${Date.now()}`, text }])}
                        onDelete={id => onRulesChange('ai', gameState.aiRules.filter(r => r.id !== id))}
                    />
                )}
                {activeSubTab === 'coreMemory' && (
                    <EditableList
                        title="Bộ Nhớ Cốt Lõi"
                        items={gameState.coreMemoryRules}
                        onUpdate={(id, text) => onRulesChange('coreMemory', gameState.coreMemoryRules.map(r => r.id === id ? { ...r, text } : r))}
                        onAdd={text => onRulesChange('coreMemory', [...gameState.coreMemoryRules, { id: `cm_${Date.now()}`, text }])}
                        onDelete={id => onRulesChange('coreMemory', gameState.coreMemoryRules.filter(r => r.id !== id))}
                    />
                )}
                {activeSubTab === 'nhatKy' && (
                    <EditableList
                        title="Nhật Ký"
                        items={[...gameState.journal].reverse()}
                        itemDisplay="journal"
                        onUpdate={(id, text) => onJournalChange(gameState.journal.map(j => j.id === id ? { ...j, text } : j))}
                        onAdd={text => onJournalChange([...gameState.journal, { id: `j_${Date.now()}`, turn: gameState.turnCounter, text }])}
                        onDelete={id => onJournalChange(gameState.journal.filter(j => j.id !== id))}
                    />
                )}
                {activeSubTab === 'thienThu' && (
                    <div className="h-full">
                        <ThienThuPanelContent thienThu={thienThu} onItemImageChange={onItemImageChange} />
                    </div>
                )}
            </div>
        </div>
    );
};