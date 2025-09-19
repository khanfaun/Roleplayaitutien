import React, { useState, useEffect } from 'react';
import { GeminiLogoIcon, CheckIcon, SpinnerIcon } from '../Icons';

export const ApiKeyInputOverlay: React.FC<{
    onSubmit: (key: string) => void;
    isLoading: boolean;
    error: string | null;
    success: boolean;
}> = ({ onSubmit, isLoading, error, success }) => {
    const [apiKey, setApiKey] = useState('');
    const [isInitialCheck, setIsInitialCheck] = useState(true);

    useEffect(() => {
        // If isLoading becomes false after the component mounts, it means the initial check is over.
        if (isInitialCheck && !isLoading) {
            setIsInitialCheck(false);
        }
    }, [isLoading, isInitialCheck]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || success) return;
        setIsInitialCheck(false); // A manual submission is not the initial check
        onSubmit(apiKey);
    };

    const isFormDisabled = isLoading || success;
    const initialCheckInProgress = isLoading && isInitialCheck;


    return (
        <main className="h-screen w-screen p-4 text-white flex flex-col items-center justify-center gap-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
            <div className="p-8 bg-slate-800/50 border border-yellow-500/50 rounded-xl shadow-lg text-center flex flex-col items-center gap-4 max-w-lg min-h-[420px] justify-center">
                <GeminiLogoIcon className="w-16 h-16 text-yellow-400"/>
                {initialCheckInProgress ? (
                    <div className="flex flex-col items-center gap-4">
                        <h1 className="text-3xl font-bold text-yellow-400">Đang Xác Thực</h1>
                        <SpinnerIcon className="w-12 h-12 animate-spin text-yellow-400"/>
                        <p className="text-slate-300">Đang kiểm tra API Key đã lưu...</p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold text-yellow-400">Yêu Cầu API Key</h1>
                        <p className="text-slate-300">
                            Vui lòng nhập Google Gemini API Key của bạn để bắt đầu.
                        </p>
                        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Nhập API Key của bạn tại đây"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white text-center disabled:opacity-50"
                                disabled={isFormDisabled}
                            />
                            {error && !success && <p className="text-red-400 text-sm mt-2">{error}</p>}
                            {success && <p className="text-green-400 text-sm mt-2">Xác thực thành công! Đang tải thế giới tu tiên...</p>}
                            <button
                                type="submit"
                                disabled={isFormDisabled || !apiKey.trim()}
                                className={`w-full px-6 py-3 font-bold text-lg rounded-lg text-slate-900 shadow-lg transition-all transform flex items-center justify-center gap-3
                                    ${success 
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 cursor-default'
                                        : 'bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 hover:scale-105'
                                    }
                                    disabled:opacity-70 disabled:cursor-wait disabled:scale-100`
                                }
                            >
                                {success ? (
                                    <><CheckIcon className="w-7 h-7"/> <span>Thành công!</span></>
                                ) : isLoading ? (
                                    <>
                                        <SpinnerIcon className="w-7 h-7 animate-spin" />
                                        <span>Đang kiểm tra...</span>
                                    </>
                                ) : (
                                    "Lưu và Bắt Đầu"
                                )}
                            </button>
                        </form>
                        <p className="text-slate-400 text-xs mt-2">
                            Bạn có thể lấy API Key tại{' '}
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                Google AI Studio
                            </a>. Key của bạn sẽ được lưu trên trình duyệt này.
                        </p>
                    </>
                )}
            </div>
        </main>
    );
};