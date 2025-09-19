import React from 'react';

interface EditorHeaderProps {
    handleBackClick: () => void;
    handleImportClick: () => void;
    handleSave: () => void;
    handleUpdate: () => void;
    isLoading: boolean;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ handleBackClick, handleImportClick, handleSave, handleUpdate, isLoading }) => {
    return (
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-600 text-center sm:text-left">Thiên Thư Họa Quyển</h1>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center">
                <button onClick={handleBackClick} className="flex-1 sm:flex-none px-4 py-2 font-bold text-base rounded-lg bg-slate-600 hover:bg-slate-700 text-white transition-colors">Quay Lại</button>
                <button onClick={handleImportClick} disabled={isLoading} className="flex-1 sm:flex-none px-4 py-2 font-bold text-base rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition-colors">Nhập JSON</button>
                <button onClick={handleSave} disabled={isLoading} className="flex-1 sm:flex-none px-4 py-2 font-bold text-base rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">Xuất JSON</button>
                <button onClick={handleUpdate} disabled={isLoading} className="flex-1 sm:flex-none px-4 py-2 font-bold text-base rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50">Cập nhật</button>
            </div>
        </div>
    );
};
