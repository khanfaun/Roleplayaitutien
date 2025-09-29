
import React from 'react';
import type { ThienThuImage, ThienThuImageManifest } from '../../types';
import * as Icons from '../Icons';
import { getImageUrl } from '../GamePanels';

interface ImageGalleryPanelProps {
    manifest: ThienThuImageManifest;
    imageSearchTerm: string;
    setImageSearchTerm: (value: string) => void;
    expandedCategory: string | null;
    handleCategoryToggle: (catKey: string) => void;
    imageUrl: string;
    setImageUrl: (value: string) => void;
    handleAddUrlImage: () => void;
    selectedImage: ThienThuImage | null;
    setSelectedImage: (image: ThienThuImage) => void;
}

const FIXED_CATEGORIES = {
    tieu_hao: { name: "Tiêu hao" },
    trang_bi: { name: "Trang bị" },
    phap_bao: { name: "Pháp bảo" },
    cong_phap: { name: "Công pháp" },
    npc: { name: "NPC" }
};

export const ImageGalleryPanel: React.FC<ImageGalleryPanelProps> = ({
    manifest,
    imageSearchTerm,
    setImageSearchTerm,
    expandedCategory,
    handleCategoryToggle,
    imageUrl,
    setImageUrl,
    handleAddUrlImage,
    selectedImage,
    setSelectedImage
}) => {
    return (
        <div className="w-full md:w-[25%] p-4 border-b md:border-b-0 md:border-r border-slate-700/50 flex flex-col h-[50%] md:h-auto">
            <h2 className="text-xl font-bold text-yellow-300 mb-2 flex-shrink-0">Thư Viện Ảnh</h2>
            <input type="text" placeholder="Tìm tên ảnh..." value={imageSearchTerm} onChange={e => setImageSearchTerm(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm mb-2 flex-shrink-0" />
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-2 -mr-4 space-y-2">
                 {Object.entries(FIXED_CATEGORIES).map(([catKey, category]) => (
                    <details key={catKey} className="bg-slate-800/50 rounded-lg border border-slate-700" open={expandedCategory === catKey || !expandedCategory}>
                        <summary className="p-2 flex items-center justify-between cursor-pointer" onClick={(e) => { e.preventDefault(); handleCategoryToggle(catKey); }}>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-yellow-200">{category.name}</span>
                            </div>
                            {expandedCategory === catKey ? <Icons.ChevronUpIcon className="w-5 h-5 text-slate-400"/> : <Icons.ChevronDownIcon className="w-5 h-5 text-slate-400"/>}
                        </summary>
                        {expandedCategory === catKey && (
                            <div className="p-2 border-t border-slate-700 space-y-2 max-h-64 overflow-y-auto styled-scrollbar">
                                 <div className="flex-shrink-0 flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Thêm ảnh bằng URL..." 
                                        value={imageUrl} 
                                        onChange={e => setImageUrl(e.target.value)} 
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
                                    />
                                    <button 
                                        onClick={() => handleAddUrlImage()}
                                        disabled={!imageUrl.startsWith('http')}
                                        className="p-2 bg-green-600 rounded-lg disabled:opacity-50"
                                    >
                                        <Icons.PlusCircleIcon className="w-6 h-6"/>
                                    </button>
                                </div>
                                {manifest.images.filter(img => img.category === catKey && img.fileName.toLowerCase().includes(imageSearchTerm.toLowerCase())).map(image => (
                                    <div key={image.fileName} onClick={() => setSelectedImage(image)} className={`w-full p-2 rounded-lg flex items-start gap-3 text-left transition-all cursor-pointer ${selectedImage?.fileName === image.fileName ? 'bg-yellow-500/10 border-yellow-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'} border`}>
                                        <img src={getImageUrl(image.fileName) || ''} alt={image.fileName} className="w-12 h-12 object-cover rounded-md flex-shrink-0"/>
                                        <div className="flex-grow min-w-0">
                                            {image.fileName.startsWith('http') ? (
                                                <a href={image.fileName} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs font-semibold text-cyan-400 hover:underline">
                                                    Ảnh tự thêm
                                                </a>
                                            ) : (
                                                <h4 className="text-xs font-semibold break-all">{image.fileName.split('/').pop()}</h4>
                                            )}
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {image.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </details>
                ))}
            </div>
        </div>
    );
};
