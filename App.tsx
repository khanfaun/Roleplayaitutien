
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ScenarioData } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import { ScenarioSetup } from './components/ScenarioSetup';
import { BreakthroughModal } from './components/BreakthroughModal';
import { RealmStatsSimulator } from './components/RealmStatsSimulator';
import { ImageLibraryEditor } from './components/ImageLibraryEditor';

// Refactored UI Components
import { ApiKeyInputOverlay } from './components/ui/ApiKeyInputOverlay';
import { IntroScreen } from './components/ui/IntroScreen';
import { DeathScreen } from './components/ui/DeathScreen';
import { DesktopLayout } from './components/layout/DesktopLayout';
import { MobileLayout } from './components/layout/MobileLayout';
import { HeThongPanel, ImageAssignmentModal, InventoryPanel } from './components/GamePanels';
import { SmartTooltip } from './components/SmartTooltip';
import Panel from './components/Panel';
import { BackpackIcon } from './components/Icons';


const App: React.FC = () => {
    const [view, setView] = useState<'intro' | 'setup' | 'game' | 'imageLibrary'>('intro');
    const [activeCenterTab, setActiveCenterTab] = useState('event');
    const [mobileTab, setMobileTab] = useState('DIEN_BIEN');
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
    const [isHeThongModalOpen, setIsHeThongModalOpen] = useState(false);
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
    const [isPlayerImageModalOpen, setIsPlayerImageModalOpen] = useState(false);
    
    const [showHeThongTutorial, setShowHeThongTutorial] = useState(false);
    const heThongIconRef = useRef<HTMLButtonElement>(null);
    
    const game = useGameLogic();
    const prevHeThongStatusRef = useRef<string | undefined>(undefined);

    const handleToggleInventoryModal = () => setIsInventoryModalOpen(prev => !prev);

    useEffect(() => {
        // When game is initialized, switch to game view
        if (game.isInitialized && (game.isApiReady || game.isDemoMode)) {
            setView('game');
        } else if (view === 'game' && !game.isInitialized) {
            // If game is no longer initialized, switch to intro
            setView('intro');
        }
    }, [game.isInitialized, game.isApiReady, game.isDemoMode, view]);

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
            // He Thong was just activated, show the tutorial overlay
            setShowHeThongTutorial(true);
            
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            if (isMobile) {
                setMobileTab('HE_THONG');
            }
        }
        // Update the ref for the next render.
        prevHeThongStatusRef.current = game.gameState.player.heThongStatus;
    }, [game.gameState.player.heThongStatus]);

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

    if ((!game.isApiReady && !game.isDemoMode) || game.isRequestingApiKey) {
        return <ApiKeyInputOverlay 
            onSubmit={game.handleApiKeySubmit} 
            onStartDemo={game.startDemoMode}
            isLoading={game.isApiKeyLoading} 
            isRePrompt={game.isRequestingApiKey}
        />;
    }

    if (view === 'intro') {
         return (
             <IntroScreen
                hasLocalSave={game.hasLocalSave}
                isLoading={game.gameState.isLoading}
                autoSaveEnabled={game.autoSaveEnabled}
                onContinue={game.continueGame}
                onNewGame={() => setView('setup')}
                onLoadGame={game.handleLoadGame}
                onImageLibrary={() => setView('imageLibrary')}
                onAutoSaveChange={game.setAutoSave}
             />
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
            <DeathScreen onRestart={() => game.initializeGame({ isRestart: true })} />
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
            
            <HeThongPanel
                game={game}
                isOpen={isHeThongModalOpen}
                onClose={() => setIsHeThongModalOpen(false)}
            />

            <ImageAssignmentModal
                isOpen={isPlayerImageModalOpen}
                onClose={() => setIsPlayerImageModalOpen(false)}
                item={game.gameState.player}
                onAssign={game.handlePlayerImageChange}
            />

            {isInventoryModalOpen && (
                <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" onClick={handleToggleInventoryModal}>
                    <div className="w-full max-w-2xl h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <Panel
                            title="Túi Đồ"
                            icon={<BackpackIcon />}
                            className="w-full h-full flex flex-col"
                            isCollapsed={false}
                            onToggle={handleToggleInventoryModal}
                        >
                             <InventoryPanel 
                                gameState={game.gameState}
                                inventoryCounts={game.inventoryCounts}
                                groupedConsumableItems={game.groupedConsumableItems}
                                equipmentItems={game.equipmentItems}
                                techniqueItems={game.techniqueItems}
                                handleEquipItem={game.handleEquipItem}
                                handleCraftItem={game.handleCraftItem}
                                handleUseItem={game.handleUseItem}
                                handlePlayerAction={(action) => game.handlePlayerAction(action, 'suggestion')}
                                handleItemImageChange={game.handleItemImageChange}
                            />
                        </Panel>
                    </div>
                </div>
            )}

            {showHeThongTutorial && (
                <div 
                    className="fixed inset-0 bg-black/70 z-50"
                    onClick={() => setShowHeThongTutorial(false)}
                >
                    {heThongIconRef.current && (
                        <SmartTooltip
                            target={heThongIconRef.current}
                            show={true}
                            position="right"
                            className="w-max max-w-xs p-3 text-center text-sm bg-slate-900 border border-yellow-500/50 rounded-lg shadow-xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <p className="font-bold text-yellow-300">Hệ Thống Đã Kích Hoạt!</p>
                            <p className="mt-1">Nhấn vào biểu tượng Hệ Thống để mở hoặc nhấn vào bất cứ đâu để đóng hướng dẫn này.</p>
                        </SmartTooltip>
                    )}
                </div>
            )}
            
            <DesktopLayout
                game={game}
                isEditingName={isEditingName}
                setIsEditingName={setIsEditingName}
                editedName={editedName}
                setEditedName={setEditedName}
                handleNameEditConfirm={handleNameEditConfirm}
                activeCenterTab={activeCenterTab}
                setActiveCenterTab={setActiveCenterTab}
                setIsSimulatorOpen={setIsSimulatorOpen}
                onOpenHeThongModal={() => setIsHeThongModalOpen(true)}
                onOpenInventoryModal={handleToggleInventoryModal}
                onOpenPlayerImageModal={() => setIsPlayerImageModalOpen(true)}
                heThongIconRef={heThongIconRef}
                isHeThongTutorialActive={showHeThongTutorial}
            />

            <MobileLayout
                game={game}
                mobileTab={mobileTab}
                setMobileTab={setMobileTab}
                activeCenterTab={activeCenterTab}
                setActiveCenterTab={setActiveCenterTab}
                setIsSimulatorOpen={setIsSimulatorOpen}
            />
        </main>
    );
};

export default App;