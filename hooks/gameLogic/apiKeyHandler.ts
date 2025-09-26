

import { initializeGemini, clearGemini, validateApiKey } from '../../services/geminiService';
// FIX: Import types directly from 'react' to resolve 'React' namespace errors.
import type { Dispatch, SetStateAction } from 'react';

const API_KEY_STORAGE_KEY = 'gemini_api_key';

export const checkStoredApiKeyLogic = async (setters: {
    setIsApiReady: Dispatch<SetStateAction<boolean>>;
    setIsApiKeyLoading: Dispatch<SetStateAction<boolean>>;
}) => {
    const { setIsApiReady, setIsApiKeyLoading } = setters;
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
        const isValid = await validateApiKey(storedKey);
        if (isValid) {
            initializeGemini(storedKey);
            setIsApiReady(true);
        } else {
            console.error("Stored API key is invalid.");
            localStorage.removeItem(API_KEY_STORAGE_KEY);
            setIsApiReady(false);
        }
    }
    setIsApiKeyLoading(false);
};

export const handleApiKeySubmitLogic = (key: string, setters: {
    setIsApiReady: Dispatch<SetStateAction<boolean>>;
}) => {
    // This function now immediately sets the key without validation.
    // Validation will happen implicitly on the first API call.
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    initializeGemini(key);
    setters.setIsApiReady(true);
};

export const clearApiKeyLogic = (setters: {
    goHome?: () => void;
    setIsApiReady: Dispatch<SetStateAction<boolean>>;
}) => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    clearGemini();
    setters.setIsApiReady(false);
    if (setters.goHome) setters.goHome();
};
