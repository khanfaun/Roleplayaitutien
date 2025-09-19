import { initializeGeminiClient, clearGeminiClient, validateApiKey as validateApiKeyClient } from './gemini/core';

// Re-export functions from the new modules
export {
    generateScenario,
    generateNewBoard,
    generateEventForSquare,
    generateTribulationEvent,
    generateWorldPhase,
    generateLapCompletionOutcome,
    generateHeThongActivation,
} from './gemini/gameWorldService';

export {
    processPlayerAction,
    processCombatTurn,
} from './gemini/playerActionService';

export {
    generateTagsFromItems,
    analyzeImageForTags,
    optimizeTags,
    assignSingleImage,
    assignImagesInBulk,
} from './gemini/imageService';


// Wrapper functions to maintain the original public API for initialization and validation.
export function initializeGemini(apiKey: string) {
    initializeGeminiClient(apiKey);
}

export function clearGemini() {
    clearGeminiClient();
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
    return validateApiKeyClient(apiKey);
}
