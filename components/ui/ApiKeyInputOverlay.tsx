import React, { useState, useEffect } from 'react';
import { GeminiLogoIcon, CheckIcon, SpinnerIcon } from '../Icons';

export const ApiKeyInputOverlay: React.FC<{
    onSubmit: (key: string) => void;
    onStartDemo: () => void;
    isLoading: boolean; // For initial stored key check
    isRePrompt: boolean;
}> = ({ onSubmit, onStartDemo, isLoading, isRePrompt }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim()) return;
        onSubmit(apiKey);
    };

    if (isLoading) {
        return (
            <main className="h-screen w-screen p-4 text-white flex flex-col items-center justify-center gap-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
                <div className="p-8 bg-slate-800/50 border border-yellow-500/50 rounded-xl shadow-lg text-center flex flex-col items-center gap-4 max-w-lg min-h-[420px] justify-center">
                     <GeminiLogoIcon className="w-16 h-16 text-yellow-400"/>
                     <div className="flex flex-col items-center gap-4">
                        <h1 className="text-3xl font-bold text-yellow-400">Đang Xác Thực</h1>
                        <SpinnerIcon className="w-12 h-12 animate-spin text-yellow-400"/>
                        <p className="text-slate-300">Đang kiểm tra API Key đã lưu...</p>
                    </div>
                </div>
            </main>
        );
    }


    return (
        <main className="h-screen w-screen p-4 text-white flex flex-col items-center justify-center gap-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
            <div className="p-8 bg-slate-800/50 border border-yellow-500/50 rounded-xl shadow-lg text-center flex flex-col items-center gap-4 max-w-lg min-h-[420px] justify-center">
                <GeminiLogoIcon className="w-16 h-16 text-yellow-400"/>
                <h1 className="text-3xl font-bold text-yellow-400">
                    {isRePrompt ? "API Key Không Hợp Lệ" : "Yêu Cầu API Key"}
                </h1>
                <p className="text-slate-300">
                    {isRePrompt 
                        ? "API Key bạn cung cấp không hợp lệ hoặc đã hết hạn. Vui lòng nhập lại một key mới để tiếp tục."
                        : "Vui lòng nhập Google Gemini API Key của bạn để bắt đầu, hoặc chọn chơi thử."
                    }
                </p>
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Nhập API Key của bạn tại đây"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white text-center"
                    />
                    <button
                        type="submit"
                        disabled={!apiKey.trim()}
                        className="w-full px-6 py-3 font-bold text-lg rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                       Lưu và Tiếp Tục
                    </button>
                </form>

                {!isRePrompt && (
                    <>
                        <div className="flex items-center w-full gap-2">
                            <div className="flex-grow h-px bg-slate-600"></div>
                            <span className="text-slate-400 text-xs">hoặc</span>
                            <div className="flex-grow h-px bg-slate-600"></div>
                        </div>

                        <button
                            onClick={onStartDemo}
                            className="w-full px-6 py-3 font-bold text-lg rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105"
                        >
                            Chơi thử (Không cần API)
                        </button>
                    </>
                )}
                
                <p className="text-slate-400 text-xs mt-2">
                    Bạn có thể lấy API Key tại{' '}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                        Google AI Studio
                    </a>. Key của bạn sẽ được lưu trên trình duyệt này.
                </p>
            </div>
        </main>
    );
};