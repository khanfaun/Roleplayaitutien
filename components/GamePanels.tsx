// This file now serves as an index for all panel components.
// It imports them from their new locations and exports them for use in App.tsx.
// This prevents breaking changes in other files that import from 'components/GamePanels'.

export { ImageAssignmentModal } from './panels/ImageAssignmentModal';
export { StatusEffectsDisplay } from './panels/StatusEffectsDisplay';
export { QuestPanelContent } from './panels/QuestPanelContent';
export { QuestLogModal } from './panels/QuestLogModal';
export { CharacterPanelContent, DestinyLabel } from './panels/CharacterPanelContent';
export { LocationPanelContent } from './panels/LocationPanelContent';
export { SectPanel, SectPanelContent } from './panels/SectPanel';
export { DongPhuPanel } from './panels/DongPhuPanel';
export { InventoryPanel, getImageUrl } from './panels/InventoryPanel';
export { HeThongPanel, HeThongPanelContent } from './panels/HeThongPanel';
export { ManagementPanelContent } from './panels/ManagementPanelContent';
export { ThienThuPanelContent } from './panels/ThienThuPanelContent';
export { WorldPanel } from './panels/WorldPanel';
export { NpcPanelContent } from './panels/NpcPanel';
export * from './panels/sect';
