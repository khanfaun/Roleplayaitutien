import React, { useState } from 'react';
import type { ScenarioStage, Rule } from '../../types';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, PlusCircleIcon, ChevronDownIcon, ChevronUpIcon } from '../Icons';

const EditableList = ({ title, items, onUpdate, onAdd, onDelete, isCustomScenario = true }: { title: string, items: {id: string, text: string}[], onUpdate: (id: string, text: string) => void, onAdd: (text: string) => void, onDelete: (id: string) => void, isCustomScenario?: boolean }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [newItemText, setNewItemText] = useState('');

    const DEMO_STAGES = [
        { id: 'demo_1', text: 'Giai đoạn Sơ Nhập: Nhân vật chính bước chân vào con đường tu tiên, đối mặt với những thử thách đầu tiên.' },
        { id: 'demo_2', text: 'Giai đoạn Trưởng Thành: Tu vi tăng tiến, bắt đầu có danh tiếng, gặp gỡ những đồng đạo và kẻ địch quan trọng.' },
        { id: 'demo_3', text: 'Giai đoạn Biến Cố: Gặp phải một sự kiện lớn làm thay đổi vận mệnh, có thể là kỳ ngộ hoặc đại nạn.' },
        { id: 'demo_4', text: 'Giai đoạn Đỉnh Cao: Trở thành cường giả một phương, tham gia vào những cuộc chiến kinh thiên động địa.' },
        { id: 'demo_5', text: 'Giai đoạn Siêu Thoát: Chạm đến ngưỡng cửa của cảnh giới cao hơn, đối mặt với thiên kiếp và tìm kiếm con đường phi thăng.' }
    ];
    
    const showDemoStages = isCustomScenario && items.length === 0;
    
    const handleEditStart = (item: {id: string, text: string}) => {
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
        <div className="flex flex-col flex-1 min-h-0">
            <h3 className="font-bold text-yellow-300 mb-2">{title}</h3>
            <div className="flex-1 space-y-2 overflow-y-auto styled-scrollbar pr-2 min-h-0">
                {showDemoStages && DEMO_STAGES.map((item, index) => (
                    <div key={item.id} className="p-2 bg-slate-800/50 rounded-md border border-slate-700/50 flex items-start gap-2 text-slate-400 italic">
                        <div className="flex-grow">
                            <span className="font-bold text-yellow-400/70 mr-2">Giai đoạn Mẫu {index + 1}:</span>
                            <span className="text-sm">{item.text}</span>
                        </div>
                    </div>
                ))}
                {!showDemoStages && items.map((item, index) => (
                     <div key={item.id} className="p-2 bg-slate-800/50 rounded-md border border-slate-700/50 flex items-start gap-2">
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
                                     <span className="font-bold text-yellow-300 mr-2">Giai đoạn {index + 1}:</span>
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
                     placeholder="Nội dung sẽ là những cột mốc trưởng thành của nhân vật chính..."
                     className="flex-grow bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none ring-1 focus:ring-yellow-500"
                 />
                 <button onClick={handleConfirmAdd} className="p-2 text-green-400 hover:bg-slate-700 rounded-full"><PlusCircleIcon className="w-6 h-6"/></button>
             </div>
        </div>
    );
};

const RulesEditor = ({ title, rules, onUpdate, onAdd, onDelete }: { title: string; rules: Rule[]; onUpdate: (id: string, text: string) => void; onAdd: (text: string) => void; onDelete: (id: string) => void; }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [newItemText, setNewItemText] = useState('');

    const handleEditStart = (item: Rule) => {
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
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
            <h4 onClick={() => setIsCollapsed(!isCollapsed)} className="text-lg font-bold text-yellow-200 mb-2 cursor-pointer flex justify-between items-center">
                {title}
                {isCollapsed ? <ChevronDownIcon className="w-5 h-5"/> : <ChevronUpIcon className="w-5 h-5"/>}
            </h4>
            {!isCollapsed && (
                <div className="flex flex-col flex-1 min-h-0 mt-2 pt-2 border-t border-slate-700/50">
                    <div className="flex-1 space-y-2 overflow-y-auto styled-scrollbar pr-2 min-h-0 max-h-60">
                        {rules.map((rule) => (
                            <div key={rule.id} className="p-2 bg-slate-800/50 rounded-md border border-slate-700/50 flex items-start gap-2">
                                {editingId === rule.id ? (
                                    <div className="flex-grow flex flex-col gap-2">
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full h-24 bg-slate-900 border border-slate-600 rounded-md px-2 py-1 text-sm text-white focus:outline-none ring-1 ring-yellow-500"
                                            autoFocus
                                        />
                                        <div className="flex items-center gap-2 self-end">
                                            <button onClick={() => handleConfirmUpdate(rule.id)} className="p-1 text-green-400 hover:bg-slate-700 rounded-full"><CheckIcon className="w-5 h-5"/></button>
                                            <button onClick={handleEditCancel} className="p-1 text-gray-400 hover:bg-slate-700 rounded-full"><XIcon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm flex-grow">{rule.text}</p>
                                        <div className="flex-shrink-0 flex items-center gap-1">
                                            <button onClick={() => handleEditStart(rule)} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => onDelete(rule.id)} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><TrashIcon className="w-4 h-4"/></button>
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
                            placeholder="Thêm luật mới..."
                            className="flex-grow bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none ring-1 focus:ring-yellow-500"
                        />
                        <button onClick={handleConfirmAdd} className="p-2 text-green-400 hover:bg-slate-700 rounded-full"><PlusCircleIcon className="w-6 h-6"/></button>
                    </div>
                </div>
            )}
        </div>
    );
};


interface ScenarioTabProps {
    scenarioName: string;
    setScenarioName: (value: string) => void;
    scenarioSummary: string;
    setScenarioSummary: (value: string) => void;
    scenarioStages: ScenarioStage[];
    setScenarioStages: React.Dispatch<React.SetStateAction<ScenarioStage[]>>;
    thienDaoRules: Rule[];
    setThienDaoRules: React.Dispatch<React.SetStateAction<Rule[]>>;
    coreMemoryRules: Rule[];
    setCoreMemoryRules: React.Dispatch<React.SetStateAction<Rule[]>>;
    isCustomScenario: boolean;
}

export const ScenarioTab: React.FC<ScenarioTabProps> = ({
    scenarioName, setScenarioName,
    scenarioSummary, setScenarioSummary,
    scenarioStages, setScenarioStages,
    thienDaoRules, setThienDaoRules,
    coreMemoryRules, setCoreMemoryRules,
    isCustomScenario
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 h-full">
            <div className="w-full md:w-1/2 space-y-4 flex flex-col">
                <div>
                    <label htmlFor="scenario-name" className="block text-sm font-medium text-yellow-300 mb-1">Tên Kịch Bản</label>
                    <input id="scenario-name" type="text" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} placeholder="Ví dụ: Phàm Nhân Tu Tiên Ký..." className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
                </div>
                <div>
                    <label htmlFor="scenario-summary" className="block text-sm font-medium text-yellow-300 mb-1">Tóm Tắt Kịch Bản</label>
                    <textarea id="scenario-summary" value={scenarioSummary} onChange={(e) => setScenarioSummary(e.target.value)} rows={5} placeholder="Mô tả bối cảnh chung, những xung đột chính, và chủ đề của câu chuyện..." className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 styled-scrollbar" />
                </div>
                <div className="space-y-2">
                    <RulesEditor
                        title="Luật Thiên Đạo"
                        rules={thienDaoRules}
                        onUpdate={(id, text) => setThienDaoRules(rules => rules.map(r => r.id === id ? { ...r, text } : r))}
                        onAdd={text => setThienDaoRules(rules => [...rules, { id: `td_${Date.now()}`, text }])}
                        onDelete={id => setThienDaoRules(rules => rules.filter(r => r.id !== id))}
                    />
                    <RulesEditor
                        title="Bộ Nhớ Cốt Lõi"
                        rules={coreMemoryRules}
                        onUpdate={(id, text) => setCoreMemoryRules(rules => rules.map(r => r.id === id ? { ...r, text } : r))}
                        onAdd={text => setCoreMemoryRules(rules => [...rules, { id: `cm_${Date.now()}`, text }])}
                        onDelete={id => setCoreMemoryRules(rules => rules.filter(r => r.id !== id))}
                    />
                </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col min-h-0">
                <EditableList
                    title="Các Giai Đoạn Cốt Truyện"
                    items={scenarioStages}
                    onUpdate={(id, text) => setScenarioStages(stages => stages.map(s => s.id === id ? { ...s, text } : s))}
                    onAdd={text => setScenarioStages(stages => [...stages, { id: `stage_${Date.now()}`, text }])}
                    onDelete={id => setScenarioStages(stages => stages.filter(s => s.id !== id))}
                    isCustomScenario={isCustomScenario}
                />
            </div>
        </div>
    );
};
