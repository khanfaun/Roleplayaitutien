import React, { useState, Dispatch, SetStateAction } from 'react';
import type { InitialItem, InitialCongPhap, InitialNpc, InitialSect, WorldLocation, CultivationTier, DestinyDefinition } from '../../../types';
import * as Icons from '../../Icons';
import { ImageAssignmentModal } from '../../GamePanels';
import { CultivationEditor } from './CultivationEditor';
import { WorldEditor } from './WorldEditor';
import { NpcEditor } from './CharacterElementEditors';
import { ItemsEditor, EquipmentEditor, TreasuresEditor, TechniquesEditor } from './ItemEditors';
import { ElementModal, AddElementChoiceModal, ThienThuSelectorModal } from './ElementModals';
import { useElementModals } from './useElementModals';

export { PHAM_NHAN_TIER } from './CultivationEditor';


interface ElementsTabProps {
    initialItems: InitialItem[];
    setInitialItems: Dispatch<SetStateAction<InitialItem[]>>;
    initialTrangBi: InitialItem[];
    setInitialTrangBi: Dispatch<SetStateAction<InitialItem[]>>;
    initialPhapBao: InitialItem[];
    setInitialPhapBao: Dispatch<SetStateAction<InitialItem[]>>;
    initialCongPhap: InitialCongPhap[];
    setInitialCongPhap: Dispatch<SetStateAction<InitialCongPhap[]>>;
    initialNpcs: InitialNpc[];
    setInitialNpcs: Dispatch<SetStateAction<InitialNpc[]>>;
    initialSects: InitialSect[];
    setInitialSects: Dispatch<SetStateAction<InitialSect[]>>;
    worldLocations: WorldLocation[];
    setWorldLocations: Dispatch<SetStateAction<WorldLocation[]>>;
    startingLocationId: string | null;
    setStartingLocationId: Dispatch<SetStateAction<string | null>>;
    cultivationSystem: CultivationTier[];
    setCultivationSystem: Dispatch<SetStateAction<CultivationTier[]>>;
    onOpenSimulator: (selection: { tierId: string; majorId?: string; minorId?: string; }) => void;
    customThienThu: any;
    setCustomThienThu: Dispatch<SetStateAction<any>>;
    destinyDefs: Record<string, DestinyDefinition>;
}


interface ElementContentProps extends ElementsTabProps {
    activeTab: string;
    setModalState: React.Dispatch<React.SetStateAction<any>>;
    setChoiceModalState: React.Dispatch<React.SetStateAction<any>>;
    setAssignmentModalState: React.Dispatch<React.SetStateAction<any>>;
    setThienThuModalState: React.Dispatch<React.SetStateAction<any>>;
}

const ElementContent: React.FC<ElementContentProps> = (props) => {
    const { activeTab, setModalState, setChoiceModalState, setAssignmentModalState } = props;

    if (activeTab === 'item') {
        return <ItemsEditor
            initialItems={props.initialItems}
            setInitialItems={props.setInitialItems}
            setModalState={setModalState}
            setChoiceModalState={setChoiceModalState}
            setAssignmentModalState={setAssignmentModalState}
        />
    }
    if (activeTab === 'trangBi') {
        return <EquipmentEditor
            initialTrangBi={props.initialTrangBi}
            setInitialTrangBi={props.setInitialTrangBi}
            setModalState={setModalState}
            setChoiceModalState={setChoiceModalState}
            setAssignmentModalState={setAssignmentModalState}
        />
    }
    if (activeTab === 'phapBao') {
        return <TreasuresEditor
            initialPhapBao={props.initialPhapBao}
            setInitialPhapBao={props.setInitialPhapBao}
            setModalState={setModalState}
            setChoiceModalState={setChoiceModalState}
            setAssignmentModalState={setAssignmentModalState}
        />
    }
    if (activeTab === 'congPhap') {
        return <TechniquesEditor
            initialCongPhap={props.initialCongPhap}
            setInitialCongPhap={props.setInitialCongPhap}
            setModalState={setModalState}
            setChoiceModalState={setChoiceModalState}
            setAssignmentModalState={setAssignmentModalState}
        />
    }
    if (activeTab === 'npc') {
        return <NpcEditor
            initialNpcs={props.initialNpcs}
            setInitialNpcs={props.setInitialNpcs}
            setModalState={setModalState}
            setAssignmentModalState={setAssignmentModalState}
            allSects={props.initialSects}
            cultivationSystem={props.cultivationSystem}
        />
    }
    if (activeTab === 'location') {
        return <WorldEditor
            worldLocations={props.worldLocations} setWorldLocations={props.setWorldLocations}
            startingLocationId={props.startingLocationId} setStartingLocationId={props.setStartingLocationId}
            setModalState={setModalState}
            setAssignmentModalState={setAssignmentModalState}
            initialSects={props.initialSects}
            setInitialSects={props.setInitialSects}
        />
    }
    if (activeTab === 'cultivation') {
        return <CultivationEditor system={props.cultivationSystem} setSystem={props.setCultivationSystem} onOpenSimulator={props.onOpenSimulator}/>
    }

    return null;
}

export const ElementsTab: React.FC<ElementsTabProps> = (props) => {
    const [activeTab, setActiveTab] = useState('cultivation');
    
    // FIX: Destructure thienThuModalState and setThienThuModalState from the hook to align with the expected object-based state.
    const {
        modalState, setModalState,
        choiceModalState, setChoiceModalState,
        thienThuModalState, setThienThuModalState,
        assignmentModalState, setAssignmentModalState,
        handleSave, handleAddFromThienThu
    } = useElementModals({
        setInitialItems: props.setInitialItems,
        setInitialTrangBi: props.setInitialTrangBi,
        setInitialPhapBao: props.setInitialPhapBao,
        setInitialCongPhap: props.setInitialCongPhap,
        setInitialNpcs: props.setInitialNpcs,
        setInitialSects: props.setInitialSects,
        setWorldLocations: props.setWorldLocations,
    });


    const tabs = [
        { id: 'cultivation', label: 'Hệ Thống Cảnh Giới', icon: <Icons.CpuChipIcon className="w-5 h-5"/> },
        { id: 'item', label: 'Vật Phẩm', icon: <Icons.SparklesIcon className="w-5 h-5"/> },
        { id: 'trangBi', label: 'Trang Bị', icon: <Icons.ShieldCheckIcon className="w-5 h-5"/> },
        { id: 'phapBao', label: 'Pháp Bảo', icon: <Icons.HammerIcon className="w-5 h-5"/> },
        { id: 'congPhap', label: 'Công Pháp', icon: <Icons.BookOpenIcon className="w-5 h-5"/> },
        { id: 'location', label: 'Thế Giới', icon: <Icons.MapIcon className="w-5 h-5"/> },
        { id: 'npc', label: 'NPC', icon: <Icons.UserPlusIcon className="w-5 h-5"/> },
    ];
    
    return (
        <div className="flex flex-col md:flex-row gap-4 h-full">
            {modalState && <ElementModal 
                modalState={modalState} 
                onClose={() => setModalState(null)} 
                onSave={handleSave} 
                allSects={props.initialSects} 
                allWorldLocations={props.worldLocations}
                startingLocationId={props.startingLocationId}
                setStartingLocationId={props.setStartingLocationId}
                cultivationSystem={props.cultivationSystem}
                customThienThu={props.customThienThu}
                setThienThuModalState={setThienThuModalState}
                destinyDefs={props.destinyDefs}
            />}
            {choiceModalState && <AddElementChoiceModal
                onClose={() => setChoiceModalState(null)}
                onSelectNew={() => {
                    setModalState({ type: choiceModalState.type, data: null });
                    setChoiceModalState(null);
                }}
                onSelectExisting={() => {
                    setThienThuModalState({type: choiceModalState.type});
                    setChoiceModalState(null);
                }}
            />}
            {/* FIX: Use thienThuModalState (object) instead of thienThuModalType (string). Pass `npcId` to the handler to fix the argument error. */}
            {thienThuModalState && <ThienThuSelectorModal type={thienThuModalState.type} onClose={() => setThienThuModalState(null)} onSelect={(item) => handleAddFromThienThu(item, thienThuModalState.npcId)} customThienThu={props.customThienThu}/>}
            <ImageAssignmentModal
                isOpen={assignmentModalState.isOpen}
                onClose={() => setAssignmentModalState({ ...assignmentModalState, isOpen: false })}
                item={assignmentModalState.item}
                onAssign={(imageId) => {
                    if (assignmentModalState.onAssign) {
                        assignmentModalState.onAssign(imageId);
                    }
                    setAssignmentModalState({ ...assignmentModalState, isOpen: false });
                }}
            />

            <div className="w-full md:w-1/4 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-700/50 pb-2 md:pb-0 md:pr-4">
                <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible styled-scrollbar pb-2 md:pb-0">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 text-left p-3 rounded text-sm font-semibold transition-colors disabled:text-slate-500 disabled:cursor-not-allowed flex-shrink-0 md:w-full ${activeTab === tab.id ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ElementContent {...props} activeTab={activeTab} setModalState={setModalState} setChoiceModalState={setChoiceModalState} setAssignmentModalState={setAssignmentModalState} setThienThuModalState={setThienThuModalState} />
            </div>
        </div>
    )
};