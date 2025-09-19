import React, { useState } from 'react';

export const AddElementChoiceModal = ({ onClose, onSelectNew, onSelectExisting }: { onClose: () => void, onSelectNew: () => void, onSelectExisting: () => void }) => {
    const [choice, setChoice] = useState('existing');

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800/95 backdrop-blur-sm border border-yellow-500 rounded-lg p-6 shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-yellow-300 mb-4">Chọn cách thêm</h2>
                <div className="space-y-4">
                    <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${choice === 'existing' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'}`}>
                        <input type="radio" name="add-choice" value="existing" checked={choice === 'existing'} onChange={() => setChoice('existing')} className="h-5 w-5 mr-4 text-yellow-500 bg-slate-600 border-slate-500 focus:ring-yellow-500 focus:ring-offset-slate-800" />
                        <div>
                            <p className="font-semibold">Thêm từ Thiên Thư</p>
                            <p className="text-sm text-slate-400">Chọn một vật phẩm đã được định nghĩa sẵn trong kho tàng Thiên Thư.</p>
                        </div>
                    </label>
                    <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${choice === 'new' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'}`}>
                        <input type="radio" name="add-choice" value="new" checked={choice === 'new'} onChange={() => setChoice('new')} className="h-5 w-5 mr-4 text-yellow-500 bg-slate-600 border-slate-500 focus:ring-yellow-500 focus:ring-offset-slate-800" />
                        <div>
                            <p className="font-semibold">Tạo mới</p>
                            <p className="text-sm text-slate-400">Tự do sáng tạo một vật phẩm, công pháp hoàn toàn mới.</p>
                        </div>
                    </label>
                </div>
                <div className="mt-6 flex gap-4">
                    <button type="button" onClick={onClose} className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded transition-colors">Hủy</button>
                    <button type="button" onClick={() => choice === 'new' ? onSelectNew() : onSelectExisting()} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-4 rounded transition-colors">Tiếp tục</button>
                </div>
            </div>
        </div>
    );
};
