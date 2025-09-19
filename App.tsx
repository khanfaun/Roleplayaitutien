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

    if (!game.isApiReady) {
        return <ApiKeyInputOverlay onSubmit={game.handleApiKeySubmit} isLoading={game.isApiKeyLoading} success={game.apiValidationSuccess} error={game.apiValidationError} />;
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
            
            <DesktopLayout
                game={game}
                activeLeftPanel={activeLeftPanel}
                handleToggleLeftPanel={handleToggleLeftPanel}
                isEditingName={isEditingName}
                setIsEditingName={setIsEditingName}
                editedName={editedName}
                setEditedName={setEditedName}
                handleNameEditConfirm={handleNameEditConfirm}
                activeCenterTab={activeCenterTab}
                setActiveCenterTab={setActiveCenterTab}
                setIsSimulatorOpen={setIsSimulatorOpen}
                activeRightColumnPanel={activeRightColumnPanel}
                setActiveRightColumnPanel={setActiveRightColumnPanel}
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