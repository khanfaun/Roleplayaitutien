import React from 'react';
import type { BreakthroughReport } from '../types';
import { ChevronRightIcon, SparklesIcon } from './Icons';

const StatRow: React.FC<{ label: string, before: number, after: number }> = ({ label, before, after }) => {
    const change = after - before;
    const changeColor = change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-slate-400';
    // Dấu "+" được thêm cho số dương, dấu "-" đã có sẵn cho số âm.
    const changePrefix = change > 0 ? '+' : '';

    return (
        <div className="grid grid-cols-4 items-center gap-2 text-sm py-2 px-3 bg-slate-800/60 rounded-lg">
            <span className="col-span-1 font-semibold text-slate-300">{label}</span>
            <span className="col-span-1 text-center text-slate-400">{before === -1 ? 'Bất tử' : before}</span>
            <div className="col-span-2 flex items-center justify-end gap-2">
                 <span className={`${changeColor} font-bold`}>
                    {changePrefix}{change}
                </span>
                <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-white w-12 text-right">{after === -1 ? 'Bất tử' : after}</span>
            </div>
        </div>
    );
};


export const BreakthroughModal: React.FC<{ report: BreakthroughReport, onClose: () => void }> = ({ report, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div 
                className="bg-slate-900 border-2 border-yellow-500 rounded-2xl shadow-2xl shadow-yellow-500/20 w-full max-w-md m-4 text-white transform transition-all animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b-2 border-yellow-500/30 text-center bg-gradient-to-b from-yellow-500/20 to-transparent">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                        ĐỘT PHÁ CẢNH GIỚI
                    </h2>
                    <div className="flex items-center justify-center gap-4 mt-3 text-lg">
                        <span className="font-semibold text-slate-400">{report.oldStage}</span>
                        <ChevronRightIcon className="w-8 h-8 text-yellow-400 animate-pulse" />
                        <span className="font-bold text-cyan-300">{report.newStage}</span>
                    </div>
                     {report.achievedQuality && (
                        <div className="mt-4 flex items-center justify-center gap-2 p-2 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                            <SparklesIcon className="w-5 h-5 text-yellow-300" />
                            <span className="text-sm font-semibold text-yellow-200">Đạt được phẩm chất: <strong className="text-yellow-100">{report.achievedQuality}</strong></span>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-2 max-h-[50vh] overflow-y-auto styled-scrollbar">
                     <h3 className="text-lg font-semibold text-yellow-200 mb-3 text-center">Chỉ số lột xác</h3>
                     {Object.entries(report.statChanges).map(([name, change]) => (
                        <StatRow key={name} label={name} before={change.before} after={change.after} />
                     ))}
                </div>

                <div className="p-4 bg-slate-900/50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 font-bold text-lg rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};