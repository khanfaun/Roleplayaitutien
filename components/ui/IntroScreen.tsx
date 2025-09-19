import React, { useRef, useCallback } from 'react';

interface IntroScreenProps {
    hasLocalSave: boolean;
    isLoading: boolean;
    autoSaveEnabled: boolean;
    onContinue: () => void;
    onNewGame: () => void;
    onLoadGame: (file: File) => void;
    onImageLibrary: () => void;
    onAutoSaveChange: (enabled: boolean) => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
    hasLocalSave,
    isLoading,
    autoSaveEnabled,
    onContinue,
    onNewGame,
    onLoadGame,
    onImageLibrary,
    onAutoSaveChange,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLoadClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onLoadGame(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    }, [onLoadGame]);

    return (
        <main className="h-screen w-screen p-4 text-white flex flex-col items-center justify-center gap-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
           <h1 className="text-5xl md:text-6xl text-center font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-600">Phi Thăng Bí Sử</h1>
           <p className="text-lg md:text-xl text-slate-300 text-center">Con đường tu tiên gập ghềnh, liệu ngươi có dám bước đi?</p>
           <div className="mt-8 flex flex-col gap-4 w-full max-w-sm">
               {hasLocalSave && (
                  <button 
                       onClick={onContinue}
                       disabled={isLoading}
                       className="w-full flex items-center justify-center gap-3 px-6 py-4 font-bold text-lg rounded-lg bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                   >
                       Tiếp tục cuộc phiêu lưu
                   </button>
               )}
               <button 
                   onClick={onNewGame}
                   disabled={isLoading}
                   className="w-full flex items-center justify-center gap-3 px-6 py-4 font-bold text-lg rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
               >
                   Bắt đầu cuộc phiêu lưu mới
               </button>
               <button 
                   onClick={handleLoadClick}
                   disabled={isLoading}
                   className="w-full flex items-center justify-center gap-3 px-6 py-4 font-bold text-lg rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
               >
                   Tải file lưu trữ
               </button>
                <button 
                   onClick={onImageLibrary}
                   className="w-full flex items-center justify-center gap-3 px-6 py-4 font-bold text-lg rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
               >
                   Thiên Thư Họa Quyển (Beta)
               </button>
               <input
                   type="file"
                   ref={fileInputRef}
                   onChange={handleFileChange}
                   accept=".json,application/json"
                   className="hidden"
                   aria-hidden="true"
               />
               <div className="flex items-center justify-center gap-2 text-slate-300 mt-4">
                   <input
                       type="checkbox"
                       id="autosave-checkbox"
                       className="h-4 w-4 rounded border-gray-500 bg-slate-700 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-slate-900 cursor-pointer"
                       checked={autoSaveEnabled}
                       onChange={(e) => onAutoSaveChange(e.target.checked)}
                   />
                   <label htmlFor="autosave-checkbox" className="text-sm cursor-pointer">Tự động lưu trên trình duyệt</label>
               </div>
           </div>
       </main>
    )
};
