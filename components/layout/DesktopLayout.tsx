import React from 'react';
import type { useGameLogic } from '../../hooks/useGameLogic';
import Panel from '../Panel';
import GameBoard from '../GameBoard';
import { InteractionUI } from '../InteractionUI';
import { QuestPanelContent, CharacterPanelContent, DongPhuPanel, InventoryPanel, ManagementPanelContent, HeThongPanel, SectPanel, SectPanelContent, StatusEffectsDisplay, DestinyLabel, ThienThuPanelContent, WorldPanel } from '../GamePanels';
import { HeartIcon, StarIcon, ZapIcon, BookOpenIcon, BackpackIcon, UserIcon, CalendarIcon, CogIcon, PencilIcon, CheckIcon, XIcon, BuildingLibraryIcon, MapIcon, RunningIcon, BrainIcon, ScrollIcon, HomeIcon } from '../Icons';
import { DESTINY_DEFINITIONS } from '../../data/effects';

interface DesktopLayoutProps {
    game: ReturnType<typeof useGameLogic>;
    activeLeftPanel: string | null;
    handleToggleLeftPanel: (panelId: string) => void;
    isEditingName: boolean;
    setIsEditingName: (isEditing: boolean) => void;
    editedName: string;
    setEditedName: (name: string) => void;
    handleNameEditConfirm: () => void;
    activeCenterTab: string;
    setActiveCenterTab: (tab: string) => void;
    setIsSimulatorOpen: (isOpen: boolean) => void;
    activeRightColumnPanel: 'heThong' | 'board' | 'sect' | null;
    // FIX: Update prop type to allow function updates for state setters.
    setActiveRightColumnPanel: React.Dispatch<React.SetStateAction<'heThong' | 'board' | 'sect' | null>>;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
    game,
    activeLeftPanel,
    handleToggleLeftPanel,
    isEditingName,
    setIsEditingName,
    editedName,
    setEditedName,
    handleNameEditConfirm,
    activeCenterTab,
    setActiveCenterTab,
    setIsSimulatorOpen,
    activeRightColumnPanel,
    setActiveRightColumnPanel,
}) => {
    return (
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
                    title="Thế giới"
                    icon={<MapIcon />}
                    className="flex-1 flex flex-col min-h-0"
                    isCollapsed={activeLeftPanel !== 'viTri'}
                    onToggle={() => handleToggleLeftPanel('viTri')}
                    contentNoOverflow
                >
                    <WorldPanel gameState={game.gameState} setCurrentMapViewId={game.setCurrentMapViewId} />
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
                    // FIX: Changed 'player' prop to 'gameState' to match the updated component definition and resolve the type error.
                    gameState={game.gameState}
                    isLoading={game.gameState.isLoading}
                    handleLeaveSect={game.handleLeaveSect}
                    handlePlayerAction={(action) => game.handlePlayerAction(action, 'suggestion')}
                    isCollapsed={activeRightColumnPanel !== 'sect'}
                    onToggleCollapse={() => setActiveRightColumnPanel(prev => prev === 'sect' ? null : 'sect')}
                />
            </div>
        </div>
    );
};