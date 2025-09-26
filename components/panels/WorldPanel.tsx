import React, { useState, useEffect } from 'react';
import type { GameState } from '../../types';
import { LocationPanelContent } from './LocationPanelContent';
import { LocationTreeDirectory } from './LocationTreeDirectory';
import { MapIcon } from '../Icons';

export const WorldPanel: React.FC<{ 
    gameState: GameState;
    setCurrentMapViewId: (id: string | null) => void;
    view: 'map' | 'tree';
}> = ({ gameState, setCurrentMapViewId, view }) => {
    
    // Reset map view when switching to tree view
    useEffect(() => {
        if (view === 'tree') {
            setCurrentMapViewId(null);
        }
    }, [view, setCurrentMapViewId]);


    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 min-h-0">
                {view === 'map' && <LocationPanelContent gameState={gameState} setCurrentMapViewId={setCurrentMapViewId} />}
                {view === 'tree' && <LocationTreeDirectory gameState={gameState} />}
            </div>
        </div>
    );
};