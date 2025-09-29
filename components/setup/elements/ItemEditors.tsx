import React, { Dispatch, SetStateAction } from 'react';
import type { InitialItem, InitialCongPhap, PlayerAttributes } from '../../../types';
import * as Icons from '../../Icons';
import { PLAYER_ATTRIBUTE_NAMES } from '../../../constants';
import { EditableElementList, CollapsibleElement } from './ElementHelpers';
import { getImageUrl } from '../../GamePanels';

export const ItemsEditor: React.FC<{
    initialItems: InitialItem[],
    setInitialItems: Dispatch<SetStateAction<InitialItem[]>>,
    setModalState: (state: any) => void,
    setChoiceModalState: (state: any) => void,
    setAssignmentModalState: (state: any) => void,
}> = ({ initialItems, setInitialItems, setModalState, setChoiceModalState, setAssignmentModalState }) => (
    <EditableElementList
        title="Vật Phẩm Tiêu Hao"
        icon={<Icons.SparklesIcon className="w-6 h-6"/>}
        items={initialItems}
        onAdd={() => setChoiceModalState({ type: 'item' })}
        renderItem={(item: InitialItem) => (
            <CollapsibleElement
                item={item}
                typeLabel={item.consumableType || 'Tiêu hao'}
                onEdit={() => setModalState({ type: 'item', data: item })}
                onDelete={() => setInitialItems(p => p.filter(i => i.id !== item.id))}
                onOpenImageModal={() => setAssignmentModalState({
                    isOpen: true,
                    item: item,
                    onAssign: (imageId: string) => setInitialItems(p => p.map(i => i.id === item.id ? { ...i, imageId } : i))
                })}
            >
                <p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>
                {item.attributes && Object.keys(item.attributes).length > 0 && (
                    <p>
                        <strong className="text-slate-400">Thuộc tính:</strong>
                        {' ' + Object.entries(item.attributes).map(([key, value]) => `${PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes]}: +${value}`).join(', ')}
                    </p>
                )}
            </CollapsibleElement>
        )}
    />
);

export const EquipmentEditor: React.FC<{
    initialTrangBi: InitialItem[],
    setInitialTrangBi: Dispatch<SetStateAction<InitialItem[]>>,
    setModalState: (state: any) => void,
    setChoiceModalState: (state: any) => void,
    setAssignmentModalState: (state: any) => void,
}> = ({ initialTrangBi, setInitialTrangBi, setModalState, setChoiceModalState, setAssignmentModalState }) => (
    <EditableElementList
        title="Trang Bị"
        icon={<Icons.ShieldCheckIcon className="w-6 h-6"/>}
        items={initialTrangBi}
        onAdd={() => setChoiceModalState({ type: 'trangBi' })}
        renderItem={(item: InitialItem) => (
            <CollapsibleElement
                item={item}
                typeLabel={item.equipmentType || 'Trang bị'}
                onEdit={() => setModalState({ type: 'trangBi', data: item })}
                onDelete={() => setInitialTrangBi(p => p.filter(i => i.id !== item.id))}
                onOpenImageModal={() => setAssignmentModalState({
                    isOpen: true,
                    item: item,
                    onAssign: (imageId: string) => setInitialTrangBi(p => p.map(i => i.id === item.id ? { ...i, imageId } : i))
                })}
            >
                <p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>
                 {item.attributes && Object.keys(item.attributes).length > 0 && (
                    <p>
                        <strong className="text-slate-400">Thuộc tính:</strong>
                        {' ' + Object.entries(item.attributes).map(([key, value]) => `${PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes]}: +${value}`).join(', ')}
                    </p>
                )}
            </CollapsibleElement>
        )}
    />
);

export const TreasuresEditor: React.FC<{
    initialPhapBao: InitialItem[],
    setInitialPhapBao: Dispatch<SetStateAction<InitialItem[]>>,
    setModalState: (state: any) => void,
    setChoiceModalState: (state: any) => void,
    setAssignmentModalState: (state: any) => void,
}> = ({ initialPhapBao, setInitialPhapBao, setModalState, setChoiceModalState, setAssignmentModalState }) => (
    <EditableElementList
        title="Pháp Bảo"
        icon={<Icons.HammerIcon className="w-6 h-6"/>}
        items={initialPhapBao}
        onAdd={() => setChoiceModalState({ type: 'phapBao' })}
        renderItem={(item: InitialItem) => (
            <CollapsibleElement
                item={item}
                typeLabel={'Pháp bảo'}
                onEdit={() => setModalState({ type: 'phapBao', data: item })}
                onDelete={() => setInitialPhapBao(p => p.filter(i => i.id !== item.id))}
                onOpenImageModal={() => setAssignmentModalState({
                    isOpen: true,
                    item: item,
                    onAssign: (imageId: string) => setInitialPhapBao(p => p.map(i => i.id === item.id ? { ...i, imageId } : i))
                })}
            >
                <p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>
                 {item.attributes && Object.keys(item.attributes).length > 0 && (
                    <p>
                        <strong className="text-slate-400">Thuộc tính:</strong>
                        {' ' + Object.entries(item.attributes).map(([key, value]) => `${PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes]}: +${value}`).join(', ')}
                    </p>
                )}
            </CollapsibleElement>
        )}
    />
);

export const TechniquesEditor: React.FC<{
    initialCongPhap: InitialCongPhap[],
    setInitialCongPhap: Dispatch<SetStateAction<InitialCongPhap[]>>,
    setModalState: (state: any) => void,
    setChoiceModalState: (state: any) => void,
    setAssignmentModalState: (state: any) => void,
}> = ({ initialCongPhap, setInitialCongPhap, setModalState, setChoiceModalState, setAssignmentModalState }) => (
    <EditableElementList
        title="Công Pháp"
        icon={<Icons.BookOpenIcon className="w-6 h-6"/>}
        items={initialCongPhap}
        onAdd={() => setChoiceModalState({ type: 'congPhap' })}
        renderItem={(item: InitialCongPhap) => (
            <CollapsibleElement
                item={item}
                typeLabel={item.techniqueType}
                onEdit={() => setModalState({ type: 'congPhap', data: item })}
                onDelete={() => setInitialCongPhap(p => p.filter(i => i.id !== item.id))}
                onOpenImageModal={() => setAssignmentModalState({
                    isOpen: true,
                    item: item,
                    onAssign: (imageId: string) => setInitialCongPhap(p => p.map(i => i.id === item.id ? { ...i, imageId } : i))
                })}
            >
                <p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>
                 {item.attributes && Object.keys(item.attributes).length > 0 && (
                    <p>
                        <strong className="text-slate-400">Thuộc tính:</strong>
                        {' ' + Object.entries(item.attributes).map(([key, value]) => `${PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes]}: +${value}`).join(', ')}
                    </p>
                )}
            </CollapsibleElement>
        )}
    />
);