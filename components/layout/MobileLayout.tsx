import React from 'react';
import type { useGameLogic } from '../../hooks/useGameLogic';
import GameBoard from '../GameBoard';
import { InteractionUI } from '../InteractionUI';
import { QuestPanelContent, CharacterPanelContent, DongPhuPanel, InventoryPanel, HeThongPanelContent, SectPanelContent, ThienThuPanelContent, LocationPanelContent, ManagementPanelContent, WorldPanel } from '../GamePanels';
import { DiceIcon } from '../Icons';
import { MobileStatsHeader } from '../ui/MobileStatsHeader';
import { BottomNav } from '../ui/BottomNav';

interface MobileLayoutProps {
    game: ReturnType<typeof useGameLogic>;
    mobileTab: string;
    setMobileTab: (tab: string) => void;
    activeCenterTab: string;
    setActiveCenterTab: (tab: string) => void;
    setIsSimulatorOpen: (isOpen: boolean) => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
    game,
    mobileTab,
    setMobileTab,
    activeCenterTab,
    setActiveCenterTab,
    setIsSimulatorOpen,
}) => {
    return (
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
                     <div className="h-full flex flex-col">
                        <WorldPanel gameState={game.gameState} setCurrentMapViewId={game.setCurrentMapViewId} />
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
                            // FIX: Changed 'player' prop to 'gameState' to match the updated component definition and resolve the type error.
                            gameState={game.gameState} 
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
    );
};