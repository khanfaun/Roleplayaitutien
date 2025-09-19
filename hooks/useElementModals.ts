import { useState, Dispatch, SetStateAction } from 'react';
import type { InitialItem, InitialCongPhap, InitialNpc, InitialSect, WorldLocation } from '../../../types';

export const useElementModals = ({
    setInitialItems,
    setInitialTrangBi,
    setInitialPhapBao,
    setInitialCongPhap,
    setInitialNpcs,
    setInitialSects,
    setWorldLocations,
}: {
    setInitialItems: Dispatch<SetStateAction<InitialItem[]>>;
    setInitialTrangBi: Dispatch<SetStateAction<InitialItem[]>>;
    setInitialPhapBao: Dispatch<SetStateAction<InitialItem[]>>;
    setInitialCongPhap: Dispatch<SetStateAction<InitialCongPhap[]>>;
    setInitialNpcs: Dispatch<SetStateAction<InitialNpc[]>>;
    setInitialSects: Dispatch<SetStateAction<InitialSect[]>>;
    setWorldLocations: Dispatch<SetStateAction<WorldLocation[]>>;
}) => {
    const [modalState, setModalState] = useState<{ type: string, data: any | null, parentIds?: any } | null>(null);
    const [choiceModalState, setChoiceModalState] = useState<{ type: string } | null>(null);
    const [thienThuModalState, setThienThuModalState] = useState<{ type: string; npcId?: string } | null>(null);
    const [assignmentModalState, setAssignmentModalState] = useState<{ isOpen: boolean; item: any | null; onAssign: (imageId: string) => void; }>({ isOpen: false, item: null, onAssign: () => {} });

    const handleSave = (data: any) => {
        const isNew = !modalState?.data;
        const finalItem = {
            ...data,
            id: isNew ? `init_${modalState?.type}_${Date.now()}` : (modalState?.data.id || `init_${modalState?.type}_${Date.now()}`),
        };

        const updateList = (setter: Dispatch<SetStateAction<any[]>>) => {
            setter(prevList => {
                const index = prevList.findIndex(i => i.id === finalItem.id);
                if (index > -1) {
                    const newList = [...prevList];
                    newList[index] = finalItem;
                    return newList;
                }
                return [...prevList, finalItem];
            });
        };

        switch (modalState?.type) {
            case 'item': updateList(setInitialItems); break;
            case 'trangBi': updateList(setInitialTrangBi); break;
            case 'phapBao': updateList(setInitialPhapBao); break;
            case 'congPhap': updateList(setInitialCongPhap); break;
            case 'npc': updateList(setInitialNpcs); break;
            case 'sect': updateList(setInitialSects); break;
            case 'worldLocation': updateList(setWorldLocations); break;
        }
        setModalState(null);
    };

    const handleAddFromThienThu = (item: InitialItem | InitialCongPhap, npcId?: string) => {
        if (!thienThuModalState) return;
        const newItem = { ...item, id: `init_${thienThuModalState.type}_${Date.now()}` };

        if (npcId) {
            let updatedNpc: InitialNpc | null = null;
            setInitialNpcs(prev => prev.map(npc => {
                if (npc.id !== npcId) return npc;
                
                const newNpc = { ...npc };
                switch (thienThuModalState.type) {
                    case 'item':
                        newNpc.initialItems = [...(newNpc.initialItems || []), newItem as InitialItem];
                        break;
                    case 'trangBi':
                        newNpc.initialTrangBi = [...(newNpc.initialTrangBi || []), newItem as InitialItem];
                        break;
                    case 'phapBao':
                        newNpc.initialPhapBao = [...(newNpc.initialPhapBao || []), newItem as InitialItem];
                        break;
                    case 'congPhap':
                        newNpc.initialCongPhap = [...(newNpc.initialCongPhap || []), newItem as InitialCongPhap];
                        break;
                }
                updatedNpc = newNpc;
                return newNpc;
            }));
            
            if (updatedNpc) {
                setModalState(prevModalState => {
                    if (prevModalState && prevModalState.type === 'npc' && prevModalState.data.id === npcId) {
                        return { ...prevModalState, data: updatedNpc };
                    }
                    return prevModalState;
                });
            }
        } else {
            switch(thienThuModalState.type) {
                case 'item': setInitialItems(prev => [...prev, newItem as InitialItem]); break;
                case 'trangBi': setInitialTrangBi(prev => [...prev, newItem as InitialItem]); break;
                case 'phapBao': setInitialPhapBao(prev => [...prev, newItem as InitialItem]); break;
                case 'congPhap': setInitialCongPhap(prev => [...prev, newItem as InitialCongPhap]); break;
            }
        }
        setThienThuModalState(null);
    };

    return {
        modalState,
        setModalState,
        choiceModalState,
        setChoiceModalState,
        thienThuModalState,
        setThienThuModalState,
        assignmentModalState,
        setAssignmentModalState,
        handleSave,
        handleAddFromThienThu,
    };
};