import React, { useState, useMemo } from 'react';
import type { useGameLogic } from '../../hooks/useGameLogic';
import Panel from '../Panel';
import { InteractionUI } from '../InteractionUI';
import { QuestPanelContent, CharacterPanelContent, DongPhuPanel, InventoryPanel, ManagementPanelContent, HeThongPanel, SectPanelContent, StatusEffectsDisplay, DestinyLabel, ThienThuPanelContent, WorldPanel, NpcPanelContent, QuestLogModal } from '../GamePanels';
import { HeartIcon, StarIcon, ZapIcon, BookOpenIcon, BackpackIcon, UserIcon, CalendarIcon, CogIcon, PencilIcon, CheckIcon, XIcon, BuildingLibraryIcon, MapIcon, RunningIcon, BrainIcon, ScrollIcon, HomeIcon, UsersIcon, ShieldCheckIcon, CpuChipIcon, SearchIcon } from '../Icons';
import { DESTINY_DEFINITIONS } from '../../data/effects';

interface DesktopLayoutProps {
    game: ReturnType<typeof useGameLogic>;
    isEditingName: boolean;
    setIsEditingName: (isEditing: boolean) => void;
    editedName: string;
    setEditedName: (name: string) => void;
    handleNameEditConfirm: () => void;
    activeCenterTab: string;
    setActiveCenterTab: (tab: string) => void;
    setIsSimulatorOpen: (isOpen: boolean) => void;
    onOpenHeThongModal: () => void;
    onOpenInventoryModal: () => void;
    heThongIconRef: React.RefObject<HTMLButtonElement>;
    isHeThongTutorialActive: boolean;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
    game,
    isEditingName,
    setIsEditingName,
    editedName,
    setEditedName,
    handleNameEditConfirm,
    activeCenterTab,
    setActiveCenterTab,
    setIsSimulatorOpen,
    onOpenHeThongModal,
    onOpenInventoryModal,
    heThongIconRef,
    isHeThongTutorialActive
}) => {
    const [activeLeftPanelTab, setActiveLeftPanelTab] = useState<'quanHe' | 'theGioi' | 'nhiemVu'>('quanHe');
    const [isNpcGraphModalOpen, setIsNpcGraphModalOpen] = useState(false);
    const [isWorldMapModalOpen, setIsWorldMapModalOpen] = useState(false);
    const [isQuestLogModalOpen, setIsQuestLogModalOpen] = useState(false);

    const leftPanelTabs = [
        { id: 'quanHe', label: 'Quan Hệ', icon: <UsersIcon className="w-5 h-5"/> },
        { id: 'theGioi', label: 'Thế Giới', icon: <MapIcon className="w-5 h-5"/> },
        { id: 'nhiemVu', label: 'Nhiệm Vụ', icon: <ScrollIcon className="w-5 h-5"/> },
    ];

    const infoPanelActionButton = useMemo(() => {
        if (activeLeftPanelTab === 'quanHe') {
            return {
                icon: <SearchIcon />,
                onClick: () => setIsNpcGraphModalOpen(true),
                title: "Xem Thiên Cơ Đồ"
            };
        }
        if (activeLeftPanelTab === 'theGioi') {
            return {
                icon: <SearchIcon />,
                onClick: () => setIsWorldMapModalOpen(true),
                title: "Xem Sơn Hà Đồ"
            };
        }
        if (activeLeftPanelTab === 'nhiemVu') {
            return {
                icon: <SearchIcon />,
                onClick: () => setIsQuestLogModalOpen(true),
                title: "Xem Nhật Ký Nhiệm Vụ"
            };
        }
        return undefined;
    }, [activeLeftPanelTab]);

    return (
        <div className="hidden md:flex flex-row w-full h-full gap-4">
            {isNpcGraphModalOpen && (
                <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" onClick={() => setIsNpcGraphModalOpen(false)}>
                    <div className="w-full max-w-4xl h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <Panel 
                            title="Thiên Cơ Đồ" 
                            icon={<UsersIcon />} 
                            className="w-full h-full flex flex-col" 
                            isCollapsed={false} 
                            onToggle={() => {}}
                            actionButton={{
                                icon: <XIcon />,
                                onClick: () => setIsNpcGraphModalOpen(false),
                                title: "Đóng"
                            }}
                            contentNoOverflow
                        >
                            <NpcPanelContent gameState={game.gameState} view={'graph'} />
                        </Panel>
                    </div>
                </div>
            )}
             <QuestLogModal 
                isOpen={isQuestLogModalOpen}
                onClose={() => setIsQuestLogModalOpen(false)}
                gameState={game.gameState}
            />

            {isWorldMapModalOpen && (
                <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" onClick={() => setIsWorldMapModalOpen(false)}>
                    <div className="w-full max-w-5xl h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                         <Panel 
                            title="Sơn Hà Đồ" 
                            icon={<MapIcon />} 
                            className="w-full h-full flex flex-col" 
                            isCollapsed={false} 
                            onToggle={() => {}}
                            actionButton={{
                                icon: <XIcon />,
                                onClick: () => setIsWorldMapModalOpen(false),
                                title: "Đóng"
                            }}
                            contentNoOverflow
                        >
                            <WorldPanel gameState={game.gameState} setCurrentMapViewId={game.setCurrentMapViewId} view={'map'} />
                        </Panel>
                    </div>
                </div>
            )}

            {/* --- LEFT COLUMN --- */}
             <div className="flex-shrink-0 flex flex-col w-[380px] gap-4 min-h-0">
                <Panel
                    title="Đạo Hữu"
                    icon={<UserIcon />}
                    isCollapsed={false}
                    onToggle={() => {}}
                    actionButton={{
                        icon: <BackpackIcon />,
                        onClick: onOpenInventoryModal,
                        title: "Mở Túi Đồ"
                    }}
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
                                     {game.gameState.player.heThongStatus === 'active' && (
                                        <button
                                            ref={heThongIconRef}
                                            onClick={onOpenHeThongModal}
                                            className={`p-1 bg-slate-800/70 rounded-full hover:bg-slate-700 transition-colors relative ${isHeThongTutorialActive ? 'z-[60]' : ''} ${game.gameState.player.heThongStatus === 'active' ? 'animate-pulse' : ''}`}
                                            title="Mở Bảng Hệ Thống"
                                        >
                                            <CpuChipIcon className="w-5 h-5 text-cyan-300" />
                                        </button>
                                    )}
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

                        <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4">
                            <div>
                                <h4 className="text-base font-bold text-yellow-300 mb-2">Trạng Thái</h4>
                                <StatusEffectsDisplay effects={game.gameState.player.statusEffects} player={game.gameState.player} />
                            </div>
                            {game.gameState.player.selectedDestinyIds && game.gameState.player.selectedDestinyIds.length > 0 && (
                                <div className="pt-3 border-t border-slate-700/50">
                                    <h4 className="text-base font-bold text-yellow-300 mb-2">Tiên Thiên Khí Vận</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {game.gameState.player.selectedDestinyIds.map(id => {
                                            const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
                                            if (!destiny) return null;
                                            return <DestinyLabel key={id} destiny={destiny} />;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Panel>
                
                <Panel
                    title="Thông Tin"
                    icon={<BookOpenIcon />}
                    className="flex-1 flex flex-col min-h-0"
                    isCollapsed={false}
                    onToggle={() => {}}
                    actionButton={infoPanelActionButton}
                    contentNoOverflow
                >
                    <div className="flex flex-col h-full">
                        <div className="flex-shrink-0 flex border-b-2 border-slate-700/50">
                            {leftPanelTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveLeftPanelTab(tab.id as any)}
                                    className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeLeftPanelTab === tab.id ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 min-h-0 relative overflow-y-auto styled-scrollbar">
                            {activeLeftPanelTab === 'quanHe' && <NpcPanelContent gameState={game.gameState} view={'list'} />}
                            {activeLeftPanelTab === 'theGioi' && <WorldPanel gameState={game.gameState} setCurrentMapViewId={game.setCurrentMapViewId} view={'tree'} />}
                            {activeLeftPanelTab === 'nhiemVu' && <QuestPanelContent gameState={game.gameState} />}
                        </div>
                    </div>
                </Panel>
            </div>
            
            {/* --- CENTER COLUMN --- */}
            <div className="flex-grow flex flex-col gap-4 min-w-0 min-h-0">
                <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-md border-2 border-slate-700/50 shadow-2xl shadow-black/30 rounded-xl min-h-0 relative">
                    <div className="flex-shrink-0 flex border-b-2 border-slate-700/50">
                        <button onClick={() => setActiveCenterTab('event')} className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeCenterTab === 'event' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                            <BookOpenIcon className="w-5 h-5"/> Diễn Biến
                        </button>
                        <button onClick={() => setActiveCenterTab('character')} className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeCenterTab === 'character' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                            <UserIcon className="w-5 h-5"/> Nhân Vật
                        </button>
                        <button onClick={() => setActiveCenterTab('sect')} className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeCenterTab === 'sect' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                            <ShieldCheckIcon className="w-5 h-5"/> Môn Phái
                        </button>
                        <button onClick={() => setActiveCenterTab('dongPhu')} className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeCenterTab === 'dongPhu' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                            <HomeIcon className="w-5 h-5"/> Động Phủ
                        </button>
                         <button onClick={() => setActiveCenterTab('management')} className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeCenterTab === 'management' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                            <CogIcon className="w-5 h-5"/> Quản Lý
                        </button>
                    </div>

                    {activeCenterTab === 'event' && <InteractionUI gameState={game.gameState} isLoading={game.gameState.isLoading} isRolling={game.isRolling} playerInput={game.playerInput} setPlayerInput={game.setPlayerInput} handlePlayerAction={game.handlePlayerAction} isAtBottleneck={game.gameState.isAtBottleneck} triggerManualBreakthrough={game.triggerManualBreakthrough} />}
                    {activeCenterTab === 'dongPhu' && <DongPhuPanel dongPhu={game.gameState.dongPhu} inventoryCounts={game.inventoryCounts} isLoading={game.gameState.isLoading} handleUpgradeBuilding={game.handleUpgradeBuilding} handlePlayerAction={(action) => game.handlePlayerAction(action, 'suggestion')}/>}
                    {activeCenterTab === 'character' && <CharacterPanelContent gameState={game.gameState} onOpenSimulator={() => setIsSimulatorOpen(true)} />}
                    {activeCenterTab === 'sect' && <SectPanelContent gameState={game.gameState} isLoading={game.gameState.isLoading} handleLeaveSect={game.handleLeaveSect} handlePlayerAction={game.handlePlayerAction} />}
                    {activeCenterTab === 'management' && <ManagementPanelContent 
                        gameState={game.gameState} 
                        onRulesChange={(type, rules) => game.handleRulesChange(type, rules)} 
                        onJournalChange={(journal) => game.handleJournalEntriesChange(journal)} 
                        onScenarioUpdate={(updates) => game.handleScenarioUpdate(updates)}
                        handleSaveGame={() => game.handleSaveGame()} 
                        handleLoadGame={(file) => game.handleLoadGame(file)} 
                        handleGoHome={() => game.goHome()} 
                        handleClearApiKey={() => game.clearApiKey()}
                        thienThu={game.gameState.thienThu}
                        onItemImageChange={game.handleThienThuItemImageChange}
                    />}
                </div>
            </div>
        </div>
    );
};
