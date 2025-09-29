import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { InitialItem, InitialCongPhap, Item, ThienThuImageManifest } from '../../types';
import * as Icons from '../Icons';
import * as geminiService from '../../services/geminiService';
import { getImageUrl } from '../imageLibraryEditor/helpers';

export const ImageAssignmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAssign: (imageId: string) => void;
    item: InitialItem | InitialCongPhap | Item | null;
}> = ({ isOpen, onClose, onAssign, item }) => {
    const [manifest, setManifest] = useState<ThienThuImageManifest | null>(null);
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetch('/thienthu_images.json')
                .then(res => res.json())
                .then(data => setManifest(data))
                .catch(err => console.error("Failed to load image manifest", err));
        }
    }, [isOpen]);

    const handleAiSelect = async () => {
        if (!manifest || !item) return;
        setIsLoading(true);
        try {
            const category = 'techniqueType' in item 
                ? 'Công pháp' 
                : 'itemType' in item 
                    ? item.itemType 
                    : item.category;
            const imageId = await geminiService.assignSingleImage({ name: item.name, description: item.description, category }, manifest.images);
            onAssign(imageId);
        } catch (error) {
            console.error("AI image assignment failed", error);
            alert("AI gán ảnh thất bại.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !item) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 p-4 rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-yellow-300 mb-4 flex-shrink-0">Gán ảnh cho "{item.name}"</h3>
                
                <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-700">
                    <div className="flex flex-col gap-2">
                         <label className="text-sm font-semibold text-slate-300">1. Nhập URL hình ảnh</label>
                        <div className="flex gap-2">
                             <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="flex-grow bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm" />
                             <button onClick={() => { if(url) onAssign(url); }} disabled={!url.startsWith('http')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold disabled:opacity-50">Gán</button>
                        </div>
                    </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-300">2. Để AI chọn ảnh từ thư viện</label>
                        <button onClick={handleAiSelect} disabled={isLoading || !manifest} className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                            {isLoading ? 'Đang suy diễn...' : <><Icons.SparklesIcon className="w-5 h-5"/> AI Chọn Ảnh</>}
                        </button>
                     </div>
                </div>

                <div className="flex-1 min-h-0 flex flex-col">
                    <h4 className="text-lg font-semibold text-slate-300 mb-2 flex-shrink-0">3. Chọn thủ công từ thư viện</h4>
                    {!manifest ? <p>Đang tải thư viện...</p> : (
                        <div className="flex-1 overflow-y-auto styled-scrollbar grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                            {manifest.images.map(image => (
                                <button key={image.fileName} onClick={() => onAssign(image.fileName)} className="aspect-square rounded-lg overflow-hidden border-2 border-slate-600 hover:border-yellow-400 transition-colors">
                                    <img src={getImageUrl(image.fileName) || ''} alt={image.fileName} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                 <button onClick={onClose} className="flex-shrink-0 mt-4 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded transition-colors">Đóng</button>
            </div>
        </div>,
        document.body
    );
};