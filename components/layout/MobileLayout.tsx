import React from 'react';
import type { useGameLogic } from '../../hooks/useGameLogic';
import GameBoard from '../GameBoard';
import { InteractionUI } from '../InteractionUI';
import { QuestPanelContent, CharacterPanelContent, DongPhuPanel, InventoryPanel, HeThongPanel, SectPanelContent, ThienThuPanelContent, LocationPanelContent, ManagementPanelContent, WorldPanel, NpcPanelContent } from '../GamePanels';
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
                 {mobileTab === 'NPC' && (
                    <div className="h-full flex flex-col">
                        <NpcPanelContent gameState={game.gameState} view={'list'} />
                    </div>
                )}
                {mobileTab === 'THE_GIOI' && (
                     <div className="h-full flex flex-col">
                        <WorldPanel gameState={game.gameState} setCurrentMapViewId={game.setCurrentMapViewId} view={'map'} />
                     </div>
                )}
                 {mobileTab === 'HE_THONG' && (
                    <div className="h-full flex flex-col">
                       <HeThongPanel game={game} isCollapsed={false} onToggleCollapse={() => {}} />
                    </div>
                 )}
                 {mobileTab === 'MON_PHAI' && (
                     <div className="h-full flex flex-col">
                        <SectPanelContent gameState={game.gameState} isLoading={game.gameState.isLoading} handleLeaveSect={game.handleLeaveSect} handlePlayerAction={(action) => game.handlePlayerAction(action, 'suggestion')} />
                    </div>
                 )}
                {mobileTab === 'NHIEM_VU' && (
                    <div className="h-full flex flex-col">
                        <QuestPanelContent gameState={game.gameState} />
                    </div>
                )}
                {mobileTab === 'THIEN_THU' && (
                    <div className="h-full flex flex-col">
                        <ThienThuPanelContent thienThu={game.gameState.thienThu} onItemImageChange={game.handleThienThuItemImageChange}/>
                    </div>
                )}
                {mobileTab === 'CA_NHAN' && (
                     <div className="flex-1 flex flex-col bg-slate-900/50 min-h-0">
                        <div className="flex-shrink-0 flex border-b-2 border-slate-700/50">
                            <button onClick={() => setActiveCenterTab('character')} className={`flex-1 p-2 text-xs font-bold ${activeCenterTab === 'character' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300'}`}>Nhân vật</button>
                            <button onClick={() => setActiveCenterTab('inventory')} className={`flex-1 p-2 text-xs font-bold ${activeCenterTab === 'inventory' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300'}`}>Túi đồ</button>
                            <button onClick={() => setActiveCenterTab('dongPhu')} className={`flex-1 p-2 text-xs font-bold ${activeCenterTab === 'dongPhu' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300'}`}>Động Phủ</button>
                            <button onClick={() => setActiveCenterTab('management')} className={`flex-1 p-2 text-xs font-bold ${activeCenterTab === 'management' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300'}`}>Quản Lý</button>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto styled-scrollbar">
                           {activeCenterTab === 'character' && <CharacterPanelContent gameState={game.gameState} onOpenSimulator={() => setIsSimulatorOpen(true)} />}
                           {activeCenterTab === 'inventory' && <InventoryPanel gameState={game.gameState} inventoryCounts={game.inventoryCounts} groupedConsumableItems={game.groupedConsumableItems} equipmentItems={game.equipmentItems} techniqueItems={game.techniqueItems} handleEquipItem={game.handleEquipItem} handleCraftItem={game.handleCraftItem} handleUseItem={game.handleUseItem} handlePlayerAction={(action) => game.handlePlayerAction(action, 'suggestion')} handleItemImageChange={game.handleItemImageChange} />}
                           {activeCenterTab === 'dongPhu' && <DongPhuPanel dongPhu={game.gameState.dongPhu} inventoryCounts={game.inventoryCounts} isLoading={game.gameState.isLoading} handleUpgradeBuilding={game.handleUpgradeBuilding} handlePlayerAction={(action) => game.handlePlayerAction(action, 'suggestion')}/>}
                           {activeCenterTab === 'management' && <ManagementPanelContent gameState={game.gameState} onRulesChange={(type, rules) => game.handleRulesChange(type, rules)} onJournalChange={(journal) => game.handleJournalEntriesChange(journal)} onScenarioUpdate={(updates) => game.handleScenarioUpdate(updates)} onScenarioStageChange={game.handleScenarioStageChange} handleSaveGame={() => game.handleSaveGame()} handleLoadGame={(file) => game.handleLoadGame(file)} handleGoHome={() => game.goHome()} handleClearApiKey={() => game.clearApiKey()} thienThu={game.gameState.thienThu} onItemImageChange={game.handleThienThuItemImageChange} />}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <BottomNav activeTab={mobileTab} setActiveTab={setMobileTab} heThongActive={game.gameState.player.heThongStatus === 'active'} />
        </div>
    );
};