import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState, ScenarioData, Rule, JournalEntry, ScenarioStage } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import GameBoard from './components/GameBoard';
import Panel from './components/Panel';
import { InteractionUI } from './components/InteractionUI';
import { QuestPanelContent, CharacterPanelContent, DongPhuPanel, InventoryPanel, SectPanel, ManagementPanelContent, HeThongPanel, HeThongPanelContent, SectPanelContent, StatusEffectsDisplay, DestinyLabel, ThienThuPanelContent, LocationPanelContent } from './components/GamePanels';
import { HeartIcon, StarIcon, ZapIcon, BookOpenIcon, BackpackIcon, UserIcon, SkullIcon, SparklesIcon, ShieldCheckIcon, ScrollIcon, DiceIcon, HomeIcon, RunningIcon, BrainIcon, CalendarIcon, CogIcon, PencilIcon, CheckIcon, XIcon, CpuChipIcon, BuildingLibraryIcon, MapIcon } from './components/Icons';
import { ScenarioSetup } from './components/ScenarioSetup';
import { BreakthroughModal } from './components/BreakthroughModal';
import { RealmStatsSimulator } from './components/RealmStatsSimulator';
import { DESTINY_DEFINITIONS } from './data/effects';
import { ImageLibraryEditor } from './components/ImageLibraryEditor';

const ApiKeyInputOverlay: React.FC<{
    onSubmit: (key: string) => void;
    isLoading: boolean;
    error: string | null;
    success: boolean;
}> = ({ onSubmit, isLoading, error, success }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || success) return;
        onSubmit(apiKey);
    };

    const isFormDisabled = isLoading || success;

    return (
        <main className="h-screen w-screen p-4 text-white flex flex-col items-center justify-center gap-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
            <div className="p-8 bg-slate-800/50 border border-yellow-500/50 rounded-xl shadow-lg text-center flex flex-col items-center gap-4 max-w-lg">
                <CogIcon className="w-16 h-16 text-yellow-400"/>
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
                            "Đang kiểm tra..."
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
            </div>
        </main>
    );
};

// --- MOBILE-SPECIFIC COMPONENTS ---

// New stat bar component for mobile header
const StatBar: React.FC<{icon: React.ReactNode, value: number, max: number, colorClass: string, title: string}> = ({icon, value, max, colorClass, title}) => (
    <div className="flex flex-col gap-1 items-center" title={title}>
        <div className="flex items-center gap-1.5 w-full justify-center">
            {icon}
            <span className="font-mono text-slate-200 text-xs whitespace-nowrap">{value}/{max}</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${Math.max(0, (value / max) * 100)}%` }}></div>
        </div>
    </div>
);

const MobileStatsHeader: React.FC<{ player: GameState['player'] }> = ({ player }) => (
    <div className="flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-2 grid grid-cols-5 gap-2 text-xs border-b border-slate-700/50">
        <StatBar icon={<HeartIcon className="w-4 h-4 text-red-400"/>} value={player.hp} max={player.maxHp} colorClass="bg-gradient-to-r from-red-500 to-orange-500" title="Sinh Lực" />
        <StatBar icon={<ZapIcon className="w-4 h-4 text-blue-400"/>} value={player.spiritPower} max={player.maxSpiritPower} colorClass="bg-gradient-to-r from-blue-500 to-cyan-400" title="Linh Lực" />
        <StatBar icon={<RunningIcon className="w-4 h-4 text-green-400"/>} value={player.stamina} max={player.maxStamina} colorClass="bg-gradient-to-r from-green-500 to-emerald-500" title="Thể Lực" />
        <StatBar icon={<BrainIcon className="w-4 h-4 text-purple-400"/>} value={player.mentalState} max={player.maxMentalState} colorClass="bg-gradient-to-r from-purple-500 to-violet-500" title="Tâm Cảnh" />
        <StatBar icon={<StarIcon className="w-4 h-4 text-yellow-400"/>} value={player.exp} max={player.maxExp} colorClass="bg-gradient-to-r from-amber-400 to-yellow-500" title="Kinh Nghiệm" />
    </div>
);

const BottomNav: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void; heThongActive: boolean; thienMenhBanActive: boolean; }> = ({ activeTab, setActiveTab, heThongActive, thienMenhBanActive }) => {
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


const App: React.FC = () => {
    const [view, setView] = useState<'intro' | 'setup' | 'game' | 'imageLibrary'>('intro');
    const [activeCenterTab, setActiveCenterTab] = useState('event');
    const [mobileTab, setMobileTab] = useState('DIEN_BIEN');
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
    const [activeRightColumnPanel, setActiveRightColumnPanel] = useState<'heThong' | 'board' | 'sect' | null>('sect');
    const [activeLeftPanel, setActiveLeftPanel] = useState<string | null>('daoHuu');
    
    const game = useGameLogic();
    const prevHeThongStatusRef = useRef<string | undefined>(undefined);
    const prevIsThienMenhBanActiveRef = useRef<boolean | undefined>(undefined);

    const handleToggleLeftPanel = (panelId: string) => {
        setActiveLeftPanel(prev => (prev === panelId ? null : panelId));
    };

    useEffect(() => {
        // When game is initialized, switch to game view
        if (game.isInitialized && game.isApiReady) {
            setView('game');
        } else if (view === 'game' && (!game.isInitialized || !game.isApiReady)) {
            // If game is no longer initialized or API key is cleared, switch to intro
            setView('intro');
        }
    }, [game.isInitialized, game.isApiReady, view]);

    useEffect(() => {
        if (view !== 'game') return;
        // Automatically switch to the event tab when a new action starts loading,
        // but not during a dice roll animation.
        if (game.gameState.isLoading && !game.isRolling) {
             const isMobile = window.innerWidth < 768;
             if (isMobile) {
                if (mobileTab !== 'DIEN_BIEN') {
                    setMobileTab('DIEN_BIEN');
                }
             } else {
                if (activeCenterTab !== 'event') {
                    setActiveCenterTab('event');
                }
             }
        }
    }, [game.gameState.isLoading, game.isRolling, mobileTab, activeCenterTab, view]);

    useEffect(() => {
        // This effect runs after the component renders, so prevHeThongStatusRef.current holds the value from the *previous* render.
        if (prevHeThongStatusRef.current === 'inactive' && game.gameState.player.heThongStatus === 'active') {
            // He Thong was just activated, open its panel
            setActiveRightColumnPanel('heThong');
            
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            if (isMobile) {
                setMobileTab('HE_THONG');
            }
        }
        // Update the ref for the next render.
        prevHeThongStatusRef.current = game.gameState.player.heThongStatus;
    }, [game.gameState.player.heThongStatus]);

    useEffect(() => {
        if (prevIsThienMenhBanActiveRef.current === false && game.gameState.isThienMenhBanActive === true) {
            // Thien Menh Ban was just activated, open its panel on desktop
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            if (!isMobile) {
                setActiveRightColumnPanel('board');
            } else {
                setMobileTab('THIEN_MENH_BAN');
            }
        }
        prevIsThienMenhBanActiveRef.current = game.gameState.isThienMenhBanActive;
    }, [game.gameState.isThienMenhBanActive]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(game.gameState.player.name);

    useEffect(() => {
        if (!isEditingName) {
            setEditedName(game.gameState.player.name);
        }
    }, [game.gameState.player.name, isEditingName]);

    const handleNameEditConfirm = useCallback(() => {
        if (editedName.trim()) {
            game.handlePlayerNameChange(editedName.trim());
            setIsEditingName(false);
        }
    }, [editedName, game]);

    useEffect(() => {
        if (view !== 'game') return;
        // When switching to the management tab on mobile, always default to the character panel.
        if (mobileTab === 'CA_NHAN' && !['character', 'inventory', 'dongPhu', 'management'].includes(activeCenterTab)) {
            setActiveCenterTab('character');
        }
    }, [mobileTab, activeCenterTab, view]);


    const handleLoadClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            game.handleLoadGame(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    }, [game]);

    if (!game.isApiReady) {
        return <ApiKeyInputOverlay onSubmit={game.handleApiKeySubmit} isLoading={game.isVerifyingApiKey} success={game.apiValidationSuccess} error={game.apiValidationError} />;
    }

    if (view === 'intro') {
         return (
             <main className="h-screen w-screen p-4 text-white flex flex-col items-center justify-center gap-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
                <h1 className="text-5xl md:text-6xl text-center font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-600">Tiên Lộ Mênh Mông</h1>
                <p className="text-lg md:text-xl text-slate-300 text-center">Con đường tu tiên gập ghềnh, liệu ngươi có dám bước đi?</p>
                <div className="mt-8 flex flex-col gap-4 w-full max-w-sm">
                    {game.hasLocalSave && (
                       <button 
                            onClick={() => game.continueGame()}
                            disabled={game.gameState.isLoading}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 font-bold text-lg rounded-lg bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                        >
                            Tiếp tục cuộc phiêu lưu
                        </button>
                    )}
                    <button 
                        onClick={() => setView('setup')}
                        disabled={game.gameState.isLoading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 font-bold text-lg rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                    >
                        Bắt đầu cuộc phiêu lưu mới
                    </button>
                    <button 
                        onClick={handleLoadClick}
                        disabled={game.gameState.isLoading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 font-bold text-lg rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                    >
                        Tải file lưu trữ
                    </button>
                     <button 
                        onClick={() => setView('imageLibrary')}
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
                            checked={game.autoSaveEnabled}
                            onChange={(e) => game.setAutoSave(e.target.checked)}
                        />
                        <label htmlFor="autosave-checkbox" className="text-sm cursor-pointer">Tự động lưu trên trình duyệt</label>
                    </div>
                </div>
            </main>
         )
    }
    
    if (view === 'setup') {
        return (
            <ScenarioSetup
                onStartGame={(setupData: ScenarioData) => game.initializeGame({ setupData })}
                onBack={() => setView('intro')}
                isLoading={game.gameState.isLoading}
            />
        )
    }

    if (view === 'imageLibrary') {
        return <ImageLibraryEditor onBack={() => setView('intro')} />;
    }


    if (game.gameState.isDead) {
        return (
            <main className="h-screen w-screen p-4 text-white flex flex-col items-center justify-center gap-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/50 via-slate-900 to-black">
                <SkullIcon className="w-24 h-24 text-red-500 animate-pulse" />
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-600">Đạo đồ đã tận</h1>
                <p className="text-lg max-w-md text-center text-slate-300">Tiếc thay, tiên lộ mênh mông, đạo hữu đã không thể đi đến cuối con đường. Linh hồn đã tiêu tán trong trời đất.</p>
                <button 
                    onClick={() => game.initializeGame({ isRestart: true })}
                    className="mt-4 flex items-center justify-center gap-3 px-6 py-3 font-bold text-lg rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
                >
                    Chuyển Thế Trùng Tu
                </button>
            </main>
        );
    }
    
    return (
        <main className="h-dvh w-screen md:p-4 flex flex-col md:flex-row gap-2 md:gap-4 text-white bg-transparent">
             {game.gameState.breakthroughReport && (
                <BreakthroughModal 
                    report={game.gameState.breakthroughReport}
                    onClose={game.clearBreakthroughReport}
                />
            )}
            <RealmStatsSimulator
                isOpen={isSimulatorOpen}
                onClose={() => setIsSimulatorOpen(false)}
                cultivationSystem={game.gameState.cultivationSystem}
                currentPlayer={game.gameState.player}
            />
            {/* --- DESKTOP LAYOUT --- */}
             <div className="hidden md:flex flex-row w-full h-full gap-4">
                {/* --- LEFT COLUMN --- */}
                 <div className="flex-shrink-0 flex flex-col w-[300px] gap-4 min-h-0">
                    <Panel
                        title="Đạo Hữu"
                        icon={<UserIcon />}
                        isCollapsed={activeLeftPanel !== 'daoHuu'}
                        onToggle={() => handleToggleLeftPanel('daoHuu')}
                    >
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                {isEditingName ? (
                                    <div className="flex items-center gap-2 flex-grow">
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleNameEditConfirm()}
                                            className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xl font-bold text-yellow-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                            autoFocus
                                        />
                                        <button onClick={handleNameEditConfirm} className="p-1 text-green-400 hover:bg-slate-700 rounded-full"><CheckIcon className="w-5 h-5"/></button>
                                        <button onClick={() => setIsEditingName(false)} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><XIcon className="w-5 h-5"/></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">{game.gameState.player.name}</h1>
                                        <button onClick={() => { setIsEditingName(true); }} className="text-slate-400 hover:text-yellow-300 transition-colors">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <span className="text-sm font-semibold text-yellow-300 flex-shrink-0">Cấp {game.gameState.player.level}</span>
                            </div>
                            <div className="space-y-1 text-xs">
                                <p className="font-medium text-cyan-300">{game.gameState.player.cultivationStage}</p>
                                <p className="text-slate-400">Tuổi: {game.gameState.player.age} / {game.gameState.player.lifespan}</p>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <CalendarIcon className="w-4 h-4 text-gray-400"/>
                                    <span>Năm {game.gameState.player.year}, Tháng {game.gameState.player.month}, Ngày {game.gameState.player.day}</span>
                                </div>
                            </div>
                            <div className="mt-3 space-y-2 text-xs">
                                <div title="Sinh Lực">
                                    <div className="flex items-center gap-2">
                                        <HeartIcon className="w-4 h-4 text-red-400 flex-shrink-0"/>
                                        <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                                            <div className="h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${Math.max(0, (game.gameState.player.hp / game.gameState.player.maxHp) * 100)}%` }}></div>
                                        </div>
                                        <span className="text-xs font-mono w-24 text-right">{`${game.gameState.player.hp} / ${game.gameState.player.maxHp}`}</span>
                                    </div>
                                </div>
                                <div title="Linh Lực">
                                    <div className="flex items-center gap-2">
                                        <ZapIcon className="w-4 h-4 text-blue-400 flex-shrink-0"/>
                                        <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                                            <div className="h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${Math.max(0, (game.gameState.player.spiritPower / game.gameState.player.maxSpiritPower) * 100)}%` }}></div>
                                        </div>
                                        <span className="text-xs font-mono w-24 text-right">{`${game.gameState.player.spiritPower} / ${game.gameState.player.maxSpiritPower}`}</span>
                                    </div>
                                </div>
                                <div title="Thể Lực">
                                    <div className="flex items-center gap-2">
                                        <RunningIcon className="w-4 h-4 text-green-400 flex-shrink-0"/>
                                        <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                                            <div className="h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${Math.max(0, (game.gameState.player.stamina / game.gameState.player.maxStamina) * 100)}%` }}></div>
                                        </div>
                                        <span className="text-xs font-mono w-24 text-right">{`${game.gameState.player.stamina} / ${game.gameState.player.maxStamina}`}</span>
                                    </div>
                                </div>
                                <div title="Tâm Cảnh">
                                    <div className="flex items-center gap-2">
                                        <BrainIcon className="w-4 h-4 text-purple-400 flex-shrink-0"/>
                                        <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                                            <div className="h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-violet-500" style={{ width: `${Math.max(0, (game.gameState.player.mentalState / game.gameState.player.maxMentalState) * 100)}%` }}></div>
                                        </div>
                                        <span className="text-xs font-mono w-24 text-right">{`${game.gameState.player.mentalState} / ${game.gameState.player.maxMentalState}`}</span>
                                    </div>
                                </div>
                                <div title="Kinh Nghiệm">
                                    <div className="flex items-center gap-2">
                                        <StarIcon className="w-4 h-4 text-yellow-400 flex-shrink-0"/>
                                        <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                                            <div className={`h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r from-amber-400 to-yellow-500 ${game.gameState.isAtBottleneck ? 'animate-pulse' : ''}`} style={{ width: `${Math.max(0, (game.gameState.player.exp / game.gameState.player.maxExp) * 100)}%` }}></div>
                                        </div>
                                        <span className="text-xs font-mono w-24 text-right">{`${game.gameState.player.exp} / ${game.gameState.player.maxExp}`}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Panel>
                    <Panel
                        title="Vị Trí"
                        icon={<MapIcon />}
                        className="flex-1 flex flex-col min-h-0"
                        isCollapsed={activeLeftPanel !== 'viTri'}
                        onToggle={() => handleToggleLeftPanel('viTri')}
                    >
                        <LocationPanelContent gameState={game.gameState} />
                    </Panel>
                    <Panel
                        title="Trạng Thái & Khí Vận"
                        icon={<ZapIcon />}
                        className="flex-1 flex flex-col min-h-0"
                        isCollapsed={activeLeftPanel !== 'trangThai'}
                        onToggle={() => handleToggleLeftPanel('trangThai')}
                    >
                         <StatusEffectsDisplay effects={game.gameState.player.statusEffects} player={game.gameState.player} />
                         {game.gameState.player.selectedDestinyIds && game.gameState.player.selectedDestinyIds.length > 0 && (
                             <div className="pt-2 mt-2 border-t border-slate-700/50">
                                <h4 className="text-sm font-bold text-yellow-300 px-2 pb-1">Tiên Thiên Khí Vận</h4>
                                 <div className="flex flex-wrap gap-2 p-2">
                                    {game.gameState.player.selectedDestinyIds.map(id => {
                                        const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
                                        if (!destiny) return null;
                                        return <DestinyLabel key={id} destiny={destiny} />;
                                    })}
                                </div>
                             </div>
                         )}
                    </Panel>
                    <Panel
                        title="Nhiệm Vụ"
                        icon={<ScrollIcon />}
                        className="flex-1 flex flex-col min-h-0"
                        startCollapsed={true}
                        isCollapsed={activeLeftPanel !== 'nhiemVu'}
                        onToggle={() => handleToggleLeftPanel('nhiemVu')}
                    >
                        <QuestPanelContent quests={game.gameState.quests} />
                    </Panel>
                </div>
                
                {/* --- CENTER COLUMN --- */}
                <div className="flex-grow flex flex-col gap-4 min-w-0 min-h-0">
                    <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-md border-2 border-slate-700/50 shadow-2xl shadow-black/30 rounded-xl min-h-0">
                        <div className="flex-shrink-0 flex border-b-2 border-slate-700/50">
                            <button onClick={() => setActiveCenterTab('event')} className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeCenterTab === 'event' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                <BookOpenIcon className="w-5 h-5"/> Diễn Biến
                            </button>
                            <button onClick={() => setActiveCenterTab('dongPhu')} className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeCenterTab === 'dongPhu' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                <HomeIcon className="w-5 h-5"/> Động Phủ
                            </button>
                            <button onClick={() => setActiveCenterTab('inventory')} className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeCenterTab === 'inventory' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                <BackpackIcon className="w-5 h-5"/> Túi Đồ
                            </button>
                            <button onClick={() => setActiveCenterTab('character')} className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeCenterTab === 'character' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                <UserIcon className="w-5 h-5"/> Nhân Vật
                            </button>
                             <button onClick={() => setActiveCenterTab('thienThu')} className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeCenterTab === 'thienThu' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                <BuildingLibraryIcon className="w-5 h-5"/> Thiên Thư
                            </button>
                             <button onClick={() => setActiveCenterTab('management')} className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeCenterTab === 'management' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                <CogIcon className="w-5 h-5"/> Quản Lý
                            </button>
                        </div>

                        {activeCenterTab === 'event' && <InteractionUI gameState={game.gameState} isLoading={game.gameState.isLoading} isRolling={game.isRolling} playerInput={game.playerInput} setPlayerInput={game.setPlayerInput} handlePlayerAction={game.handlePlayerAction} isAtBottleneck={game.gameState.isAtBottleneck} triggerManualBreakthrough={game.triggerManualBreakthrough} />}
                        {activeCenterTab === 'dongPhu' && <DongPhuPanel dongPhu={game.gameState.dongPhu} inventoryCounts={game.inventoryCounts} isLoading={game.gameState.isLoading} handleUpgradeBuilding={game.handleUpgradeBuilding} handlePlayerAction={(action) => game.handlePlayerAction(action, 'suggestion')}/>}
                        {activeCenterTab === 'inventory' && <InventoryPanel gameState={game.gameState} inventoryCounts={game.inventoryCounts} groupedConsumableItems={game.groupedConsumableItems} equipmentItems={game.equipmentItems} techniqueItems={game.techniqueItems} handleEquipItem={game.handleEquipItem} handleCraftItem={game.handleCraftItem} handleUseItem={game.handleUseItem} handlePlayerAction={(action) => game.handlePlayerAction(action, 'suggestion')} handleItemImageChange={game.handleItemImageChange} />}
                        {activeCenterTab === 'character' && <CharacterPanelContent gameState={game.gameState} onOpenSimulator={() => setIsSimulatorOpen(true)} />}
                        {activeCenterTab === 'management' && <ManagementPanelContent 
                            gameState={game.gameState} 
                            onRulesChange={(type, rules) => game.handleRulesChange(type, rules)} 
                            onJournalChange={(journal) => game.handleJournalEntriesChange(journal)} 
                            onScenarioUpdate={(updates) => game.handleScenarioUpdate(updates)}
                            handleSaveGame={() => game.handleSaveGame()} 
                            handleLoadGame={(file) => game.handleLoadGame(file)} 
                            handleGoHome={() => game.goHome()} 
                            handleClearApiKey={() => game.clearApiKey()}
                        />}
                        {activeCenterTab === 'thienThu' && <ThienThuPanelContent thienThu={game.gameState.thienThu} onItemImageChange={game.handleThienThuItemImageChange} />}
                    </div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="flex-shrink-0 flex flex-col w-[500px] gap-4 min-h-0">
                     <HeThongPanel
                        gameState={game.gameState}
                        isLoading={game.gameState.isLoading}
                        handlePlayerAction={(action) => game.handlePlayerAction(action, 'suggestion')}
                        isCollapsed={activeRightColumnPanel !== 'heThong'}
                        onToggleCollapse={() => setActiveRightColumnPanel(prev => prev === 'heThong' ? null : 'heThong')}
                    />
                    {game.gameState.isThienMenhBanActive && (
                        <GameBoard
                            board={game.gameState.board}
                            playerPosition={game.gameState.player.position}
                            worldPhase={game.gameState.worldPhase}
                            isCollapsed={activeRightColumnPanel !== 'board'}
                            onToggleCollapse={() => setActiveRightColumnPanel(prev => prev === 'board' ? null : 'board')}
                            diceRolls={game.gameState.diceRolls}
                            handleDiceRoll={game.handleDiceRoll}
                            isLoading={game.gameState.isLoading}
                            isRolling={game.isRolling}
                            diceFace={game.diceFace}
                            isInTribulation={!!game.gameState.tribulationEvent}
                        />
                    )}
                    <SectPanel
                        player={game.gameState.player}
                        isLoading={game.gameState.isLoading}
                        handleLeaveSect={game.handleLeaveSect}
                        handlePlayerAction={(action) => game.handlePlayerAction(action, 'suggestion')}
                        isCollapsed={activeRightColumnPanel !== 'sect'}
                        onToggleCollapse={() => setActiveRightColumnPanel(prev => prev === 'sect' ? null : 'sect')}
                    />
                </div>
            </div>


            {/* --- MOBILE LAYOUT --- */}
            <div className="flex md:hidden flex-col w-full h-full">
                <MobileStatsHeader player={game.gameState.player} />

                {/* Main Content */}
                <div className="flex-1 min-h-0 bg-slate-900/50">
                    {mobileTab === 'DIEN_BIEN' && (
                        <div className="h-full flex flex-col">
                           <InteractionUI 
                                gameState={game.gameState}
                                isLoading={game.gameState.isLoading}
                                isRolling={game.isRolling}
                                playerInput={game.playerInput}
                                setPlayerInput={game.setPlayerInput}
                                handlePlayerAction={game.handlePlayerAction}
                                isAtBottleneck={game.gameState.isAtBottleneck}
                                triggerManualBreakthrough={game.triggerManualBreakthrough}
                            />
                        </div>
                    )}
                    {mobileTab === 'THE_GIOI' && (
                         <div className="h-full styled-scrollbar overflow-y-auto p-4">
                            <LocationPanelContent gameState={game.gameState} />
                         </div>
                    )}
                    {mobileTab === 'THIEN_MENH_BAN' && (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 min-h-0 relative z-10" >
                                 <GameBoard 
                                    board={game.gameState.board} 
                                    playerPosition={game.gameState.player.position} 
                                    worldPhase={game.gameState.worldPhase}
                                    isCollapsed={false} // Always expanded on mobile view
                                    onToggleCollapse={() => {}} // No-op on mobile
                                    diceRolls={game.gameState.diceRolls}
                                    handleDiceRoll={game.handleDiceRoll}
                                    isLoading={game.gameState.isLoading}
                                    isRolling={game.isRolling}
                                    diceFace={game.diceFace}
                                    isInTribulation={!!game.gameState.tribulationEvent}
                                 />
                            </div>
                            <div className="flex-shrink-0 p-4 bg-slate-900/80 backdrop-blur-sm border-t-2 border-slate-700/50">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-base font-bold text-yellow-300">Điều Khiển</h3>
                                    <span className="text-xs text-gray-400">Cứ 20 lượt sẽ được 1 lần lắc</span>
                                </div>
                                <button onClick={() => game.handleDiceRoll()} disabled={game.gameState.isLoading || game.gameState.diceRolls <= 0 || game.isRolling || !!game.gameState.tribulationEvent} className="w-full flex items-center justify-center gap-3 px-6 py-3 font-bold text-lg rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed disabled:scale-100">
                                    <DiceIcon className={`w-7 h-7 ${game.isRolling ? 'animate-dice-roll' : ''}`} face={game.diceFace} />
                                    <span>Lắc Xúc Xắc ({game.gameState.diceRolls})</span>
                                </button>
                            </div>
                        </div>
                    )}
                    {mobileTab === 'HE_THONG' && game.gameState.player.heThongStatus === 'active' && (
                         <div className="h-full flex flex-col">
                            <HeThongPanelContent gameState={game.gameState} isLoading={game.gameState.isLoading} handlePlayerAction={(action) => game.handlePlayerAction(action, 'suggestion')} />
                        </div>
                    )}
                     {mobileTab === 'MON_PHAI' && (
                        <div className="h-full flex flex-col">
                           <SectPanelContent 
                                player={game.gameState.player} 
                                isLoading={game.gameState.isLoading}
                                handleLeaveSect={game.handleLeaveSect}
                                handlePlayerAction={(action) => game.handlePlayerAction(action, 'suggestion')}
                           />
                        </div>
                    )}
                    {mobileTab === 'THIEN_THU' && (
                        <div className="h-full flex flex-col">
                            <ThienThuPanelContent thienThu={game.gameState.thienThu} onItemImageChange={game.handleThienThuItemImageChange} />
                        </div>
                    )}
                    {mobileTab === 'NHIEM_VU' && (
                        <div className="h-full flex flex-col">
                            <QuestPanelContent quests={game.gameState.quests} />
                        </div>
                    )}
                    {mobileTab === 'CA_NHAN' && (
                        <div className="h-full flex flex-col bg-slate-800/50">
                             <div className="flex-shrink-0 flex border-b border-slate-700">
                                <button onClick={() => setActiveCenterTab('character')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeCenterTab === 'character' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Nhân Vật</button>
                                <button onClick={() => setActiveCenterTab('inventory')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeCenterTab === 'inventory' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Túi Đồ</button>
                                <button onClick={() => setActiveCenterTab('dongPhu')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeCenterTab === 'dongPhu' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Động Phủ</button>
                                <button onClick={() => setActiveCenterTab('management')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeCenterTab === 'management' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Quản Lý</button>
                            </div>
                            <div className="flex-1 min-h-0 flex flex-col">
                                {activeCenterTab === 'character' && <CharacterPanelContent gameState={game.gameState} onOpenSimulator={() => setIsSimulatorOpen(true)} />}
                                {activeCenterTab === 'inventory' && <InventoryPanel gameState={game.gameState} inventoryCounts={game.inventoryCounts} groupedConsumableItems={game.groupedConsumableItems} equipmentItems={game.equipmentItems} techniqueItems={game.techniqueItems} handleEquipItem={game.handleEquipItem} handleCraftItem={game.handleCraftItem} handleUseItem={game.handleUseItem} handlePlayerAction={(action) => game.handlePlayerAction(action, 'suggestion')} handleItemImageChange={game.handleItemImageChange}/>}
                                {activeCenterTab === 'dongPhu' && <DongPhuPanel dongPhu={game.gameState.dongPhu} inventoryCounts={game.inventoryCounts} isLoading={game.gameState.isLoading} handleUpgradeBuilding={game.handleUpgradeBuilding} handlePlayerAction={(action) => game.handlePlayerAction(action, 'suggestion')}/>}
                                {activeCenterTab === 'management' && <ManagementPanelContent 
                                    gameState={game.gameState} 
                                    onRulesChange={(type, rules) => game.handleRulesChange(type, rules)} 
                                    onJournalChange={(journal) => game.handleJournalEntriesChange(journal)} 
                                    onScenarioUpdate={(updates) => game.handleScenarioUpdate(updates)}
                                    handleSaveGame={() => game.handleSaveGame()} 
                                    handleLoadGame={(file) => game.handleLoadGame(file)} 
                                    handleGoHome={() => game.goHome()}
                                    handleClearApiKey={() => game.clearApiKey()}
                                />}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <BottomNav 
                    activeTab={mobileTab} 
                    setActiveTab={setMobileTab} 
                    heThongActive={game.gameState.player.heThongStatus === 'active'} 
                    thienMenhBanActive={game.gameState.isThienMenhBanActive}
                />
            </div>
        </main>
    );
};

export default App;