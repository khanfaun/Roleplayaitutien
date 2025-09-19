import * as geminiService from '../../services/geminiService';

const API_KEY_STORAGE_KEY = 'gemini_api_key';

export const checkStoredApiKeyLogic = async (setters: {
    setIsApiReady: React.Dispatch<React.SetStateAction<boolean>>;
    setIsApiKeyLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const { setIsApiReady, setIsApiKeyLoading } = setters;
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
        const isValid = await geminiService.validateApiKey(storedKey);
        if (isValid) {
            geminiService.initializeGemini(storedKey);
            setIsApiReady(true);
        } else {
            console.error("Stored API key is invalid.");
            localStorage.removeItem(API_KEY_STORAGE_KEY);
            setIsApiReady(false);
        }
    }
    setIsApiKeyLoading(false);
};

export const handleApiKeySubmitLogic = async (key: string, setters: {
    setApiValidationError: React.Dispatch<React.SetStateAction<string | null>>;
    setIsApiKeyLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setApiValidationSuccess: React.Dispatch<React.SetStateAction<boolean>>;
    setIsApiReady: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const { setApiValidationError, setIsApiKeyLoading, setApiValidationSuccess, setIsApiReady } = setters;

    if (!key.trim()) {
        setApiValidationError("API Key không được để trống.");
        return;
    }
    setIsApiKeyLoading(true);
    setApiValidationError(null);
    setApiValidationSuccess(false);

    const isValid = await geminiService.validateApiKey(key);
    
    if (isValid) {
        setApiValidationSuccess(true);
        setTimeout(() => {
            localStorage.setItem(API_KEY_STORAGE_KEY, key);
            geminiService.initializeGemini(key);
            setIsApiReady(true);
        }, 1500);
    } else {
        setApiValidationError("API Key không hợp lệ hoặc đã xảy ra lỗi. Vui lòng kiểm tra lại key và thử lại.");
        setIsApiReady(false);
        setIsApiKeyLoading(false);
    }
};

export const clearApiKeyLogic = (setters: {
    goHome: () => void;
    setIsApiReady: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const { goHome, setIsApiReady } = setters;
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    geminiService.clearGemini();
    setIsApiReady(false);
    goHome();
};