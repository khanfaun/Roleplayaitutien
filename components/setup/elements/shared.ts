import type { InitialSect } from '../../../types';

export const getSectDisplayName = (sect: InitialSect, allSects: InitialSect[]): string => {
    if (sect.parentSectId) {
        const parentSect = allSects.find(s => s.id === sect.parentSectId);
        if (parentSect) {
            return `${parentSect.name} (${sect.name})`;
        }
    }
    return sect.name;
};