import React, { useState, useEffect } from 'react';
import type { GameState } from '../../types';
import { LocationPanelContent } from './LocationPanelContent';
import { LocationTreeDirectory } from './LocationTreeDirectory';
import { MapIcon } from '../Icons';

export const WorldPanel: React.FC<{ 
    gameState: GameState;
    setCurrentMapViewId: (id: string | null) => void;
}> = ({ gameState, setCurrentMapViewId }) => {
    const [activeTab, setActiveTab] = useState('map');

    // Reset map view when switching away from the map tab
    useEffect(() => {
        if (activeTab !== 'map') {
            setCurrentMapViewId(null);
        }
    }, [activeTab, setCurrentMapViewId]);


    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-shrink-0 flex border-b-2 border-slate-700/50">
                <button
                    onClick={() => setActiveTab('map')}
                    className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'map' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}
                >
                    <MapIcon className="w-5 h-5"/> Bản đồ
                </button>
                <button
                    onClick={() => setActiveTab('tree')}
                    className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'tree' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm2 2a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                     Cây thư mục
                </button>
            </div>
            <div className="flex-1 min-h-0">
                {activeTab === 'map' && <LocationPanelContent gameState={gameState} setCurrentMapViewId={setCurrentMapViewId} />}
                {activeTab === 'tree' && <LocationTreeDirectory gameState={gameState} />}
            </div>
        </div>
    );
};