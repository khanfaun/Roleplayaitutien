import React from 'react';
import { SkullIcon } from '../Icons';

interface DeathScreenProps {
    onRestart: () => void;
}

export const DeathScreen: React.FC<DeathScreenProps> = ({ onRestart }) => (
    <main className="h-screen w-screen p-4 text-white flex flex-col items-center justify-center gap-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/50 via-slate-900 to-black">
        <SkullIcon className="w-24 h-24 text-red-500 animate-pulse" />
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-600">Đạo đồ đã tận</h1>
        <p className="text-lg max-w-md text-center text-slate-300">Tiếc thay, tiên lộ mênh mông, đạo hữu đã không thể đi đến cuối con đường. Linh hồn đã tiêu tán trong trời đất.</p>
        <button 
            onClick={onRestart}
            className="mt-4 flex items-center justify-center gap-3 px-6 py-3 font-bold text-lg rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
        >
            Chuyển Thế Trùng Tu
        </button>
    </main>
);
