import React from 'react';
import { BookOpenIcon, MapIcon, SparklesIcon, CpuChipIcon, ShieldCheckIcon, BuildingLibraryIcon, ScrollIcon, UserIcon } from '../Icons';

export const BottomNav: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void; heThongActive: boolean; thienMenhBanActive: boolean; }> = ({ activeTab, setActiveTab, heThongActive, thienMenhBanActive }) => {
    const navItems = [
        { id: 'DIEN_BIEN', label: 'Diễn Biến', icon: <BookOpenIcon className="w-5 h-5 mx-auto mb-0.5" /> },
        { id: 'THE_GIOI', label: 'Thế Giới', icon: <MapIcon className="w-5 h-5 mx-auto mb-0.5" /> },
        ...(thienMenhBanActive ? [{ id: 'THIEN_MENH_BAN', label: 'Thiên Mệnh', icon: <SparklesIcon className="w-5 h-5 mx-auto mb-0.5" /> }] : []),
        ...(heThongActive ? [{ id: 'HE_THONG', label: 'Hệ Thống', icon: <CpuChipIcon className="w-5 h-5 mx-auto mb-0.5" /> }] : []),
        { id: 'MON_PHAI', label: 'Môn Phái', icon: <ShieldCheckIcon className="w-5 h-5 mx-auto mb-0.5" /> },
        { id: 'THIEN_THU', label: 'Thiên Thư', icon: <BuildingLibraryIcon className="w-5 h-5 mx-auto mb-0.5" /> },
        { id: 'NHIEM_VU', label: 'Nhiệm Vụ', icon: <ScrollIcon className="w-5 h-5 mx-auto mb-0.5" /> },
        { id: 'CA_NHAN', label: 'Cá Nhân', icon: <UserIcon className="w-5 h-5 mx-auto mb-0.5" /> },
    ];
    return (
        <nav className="flex-shrink-0 bg-slate-900/80 backdrop-blur-sm flex justify-around border-t border-slate-700/50">
            {navItems.map(item => (
                <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex-1 p-1 text-center transition-colors duration-200 ${activeTab === item.id ? 'bg-yellow-500/20 text-yellow-300' : 'text-slate-400 hover:bg-slate-700/50'}`}
                    aria-label={item.label}
                >
                    {item.icon}
                    <span className="text-[10px] font-bold">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};
