import React from 'react';
import type { ScenarioData } from '../types';
import { BookOpenIcon, SparklesIcon, UserIcon, CogIcon } from './Icons';
import { RealmStatsSimulator } from './RealmStatsSimulator';
import { CharacterTab } from './setup/CharacterTab';
import { ScenarioTab } from './setup/ScenarioTab';
import { ElementsTab } from './setup/ElementsTab';
import { CustomizationTab } from './setup/CustomizationTab';
import { useScenarioSetup } from '../hooks/useScenarioSetup';
// FIX: Corrected import path for ImageAssignmentModal.
import { ImageAssignmentModal } from './panels/ImageAssignmentModal';

interface ScenarioSetupProps {
  onStartGame: (setupData: ScenarioData) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const ScenarioSetup: React.FC<ScenarioSetupProps> = ({ onStartGame, onBack, isLoading }) => {
    // FIX: All properties on 'setup' were erroring because useScenarioSetup was not fully implemented.
    // The implementation of useScenarioSetup now correctly returns all necessary state and handlers.
    const setup = useScenarioSetup({ onStartGame });

    return (
        <main className="h-screen w-screen p-4 text-white flex flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
            <RealmStatsSimulator
                isOpen={setup.isSimulatorOpen}
                onClose={() => setup.setIsSimulatorOpen(false)}
                cultivationSystem={setup.cultivationSystem}
                currentPlayer={setup.mockPlayerForSimulator}
                isSetupMode={true}
                initialSelection={setup.simulatorSelection}
            />

            <ImageAssignmentModal
                isOpen={setup.isPlayerImageModalOpen}
                onClose={() => setup.setIsPlayerImageModalOpen(false)}
                // FIX: Passed a compatible object to the `item` prop.
                item={{ name: setup.playerName || 'Nhân Vật Chính' }}
                onAssign={(id) => setup.setPlayerImageId(id)}
            />

            <div className="w-full max-w-7xl h-full max-h-[95vh] flex flex-col gap-4">
                <div className="flex-shrink-0 flex justify-between items-center">
                    <div className="text-left">
                        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-600">Thiết Lập Thế Giới</h1>
                        <p className="text-md text-slate-300">Hãy sáng tạo nên thế giới tu tiên của riêng ngươi.</p>
                    </div>
                    <button onClick={setup.handleStartClick} disabled={isLoading} className="flex-shrink-0 px-6 py-3 font-bold text-lg rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait">
                        {isLoading ? "Đang Mở Thiên Môn..." : "Bắt Đầu Phiêu Lưu"}
                    </button>
                </div>

                <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl shadow-black/20 text-white min-h-0">
                    <div className="flex-shrink-0 flex border-b-2 border-slate-700/50">
                        <button onClick={() => setup.setMainTab('scenarioSetup')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${setup.mainTab === 'scenarioSetup' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                            <BookOpenIcon className="w-5 h-5"/> Thiết lập kịch bản
                        </button>
                        <button onClick={() => setup.setMainTab('elements')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${setup.mainTab === 'elements' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                            <SparklesIcon className="w-5 h-5"/> Yếu Tố Khởi Đầu
                        </button>
                        <button onClick={() => setup.setMainTab('character')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${setup.mainTab === 'character' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                            <UserIcon className="w-5 h-5"/> Nhân Vật
                        </button>
                         <button onClick={() => setup.setMainTab('customization')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${setup.mainTab === 'customization' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                            <CogIcon className="w-5 h-5"/> Tùy Chỉnh Thiên Thư
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto styled-scrollbar p-4 flex flex-col gap-4">
                        {setup.mainTab === 'scenarioSetup' && (
                           <ScenarioTab 
                                scenarioName={setup.scenarioName} setScenarioName={setup.setScenarioName}
                                scenarioSummary={setup.scenarioSummary} setScenarioSummary={setup.setScenarioSummary}
                                scenarioStages={setup.scenarioStages} setScenarioStages={setup.setScenarioStages}
                                thienDaoRules={setup.thienDaoRules} setThienDaoRules={setup.setThienDaoRules}
                                coreMemoryRules={setup.coreMemoryRules} setCoreMemoryRules={setup.setCoreMemoryRules}
                                isCustomScenario={setup.selectedScenario === 'custom'}
                           />
                        )}
                        {setup.mainTab === 'elements' && (
                            <ElementsTab
                                initialItems={setup.initialItems} setInitialItems={setup.setInitialItems}
                                initialTrangBi={setup.initialTrangBi} setInitialTrangBi={setup.setInitialTrangBi}
                                initialPhapBao={setup.initialPhapBao} setInitialPhapBao={setup.setInitialPhapBao}
                                initialCongPhap={setup.initialCongPhap} setInitialCongPhap={setup.setInitialCongPhap}
                                initialNpcs={setup.initialNpcs} setInitialNpcs={setup.setInitialNpcs}
                                initialSects={setup.initialSects} setInitialSects={setup.setInitialSects}
                                worldLocations={setup.worldLocations} setWorldLocations={setup.setWorldLocations}
                                startingLocationId={setup.startingLocationId} setStartingLocationId={setup.setStartingLocationId}
                                cultivationSystem={setup.cultivationSystem} setCultivationSystem={setup.setCultivationSystem}
                                onOpenSimulator={setup.handleOpenSimulator}
                                customThienThu={setup.customThienThu}
                                setCustomThienThu={setup.setCustomThienThu}
                                destinyDefs={setup.destinyDefs}
                            />
                        )}
                        {setup.mainTab === 'character' && (
                            <CharacterTab 
                                playerName={setup.playerName} setPlayerName={setup.setPlayerName}
                                playerImageId={setup.playerImageId}
                                onOpenImageModal={() => setup.setIsPlayerImageModalOpen(true)}
                                playerAge={setup.playerAge} setPlayerAge={setup.setPlayerAge}
                                playerBiography={setup.playerBiography} setPlayerBiography={setup.setPlayerBiography}
                                playerGoals={setup.playerGoals} setPlayerGoals={setup.setPlayerGoals}
                                enableHeThong={setup.enableHeThong} setEnableHeThong={setup.setEnableHeThong}
                                enableAdultContent={setup.enableAdultContent} setEnableAdultContent={setup.setEnableAdultContent}
                                linhCanQuality={setup.linhCanQuality} setLinhCanQuality={setup.setLinhCanQuality}
                                nguHanh={setup.nguHanh} setNguHanh={setup.setNguHanh}
                                difficulty={setup.difficulty}
                                selectedDestinyIds={setup.selectedDestinyIds} setSelectedDestinyIds={setup.setSelectedDestinyIds}
                                destinyDefs={setup.destinyDefs}
                                initialSects={setup.initialSects}
                                playerSectId={setup.playerSectId}
                                setPlayerSectId={setup.setPlayerSectId}
                                playerSectRank={setup.playerSectRank}
                                setPlayerSectRank={setup.setPlayerSectRank}
                                cultivationSystem={setup.cultivationSystem}
                                startingCultivationStageId={setup.startingCultivationStageId}
                                setStartingCultivationStageId={setup.setStartingCultivationStageId}
                            />
                        )}
                        {setup.mainTab === 'customization' && (
                             <CustomizationTab
                                customThienThu={setup.customThienThu}
                                setCustomThienThu={setup.setCustomThienThu}
                                destinyDefs={setup.destinyDefs} setDestinyDefs={setup.setDestinyDefs}
                                statusEffectDefs={setup.statusEffectDefs} setStatusEffectDefs={setup.setStatusEffectDefs}
                                itemEffectDefs={setup.itemEffectDefs} setItemEffectDefs={setup.setItemEffectDefs}
                             />
                        )}
                    </div>
                </div>
               
                <div className="flex-shrink-0 flex flex-col md:flex-row gap-3">
                    <button onClick={onBack} className="w-full md:w-auto px-4 py-2 md:px-6 md:py-3 font-bold text-base md:text-lg rounded-lg bg-slate-600 hover:bg-slate-700 text-white transition-colors">
                        Quay Lại
                    </button>
                    <div className="flex-grow flex flex-wrap gap-3">
                         <button onClick={() => setup.fileInputRef.current?.click()} className="flex-1 px-4 py-2 md:px-6 md:py-3 font-bold text-base md:text-lg rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition-colors">
                            Tải
                        </button>
                        <button onClick={setup.handleSaveSetup} className="flex-1 px-4 py-2 md:px-6 md:py-3 font-bold text-base md:text-lg rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                            Lưu
                        </button>
                        <select 
                            id="scenario-select" 
                            value={setup.selectedScenario} 
                            onChange={e => setup.handleScenarioChange(e.target.value)}
                            className="flex-1 text-center bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 md:py-3 font-bold text-base md:text-lg text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        >
                            <option value="custom">Tùy chỉnh kịch bản</option>
                            {Object.entries(setup.PREDEFINED_SCENARIOS).map(([id, scenario]) => (
                                <option key={id} value={id}>{(scenario as { name: string }).name}</option>
                            ))}
                            {setup.loadedScenarios.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <button onClick={setup.handleResetClick} className="flex-1 px-4 py-2 md:px-6 md:py-3 font-bold text-base md:text-lg rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors">
                            Làm Mới
                        </button>
                    </div>
                </div>
                 <input type="file" ref={setup.fileInputRef} onChange={setup.handleLoadSetup} accept=".json,application/json" className="hidden" />
            </div>
        </main>
    );
};
