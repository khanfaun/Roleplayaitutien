import type { MinorRealm, NguHanhType, RealmQuality } from '../../types';

// --- SHARED ---
export const DEFAULT_NGU_HANH: Record<NguHanhType, number> = { kim: 1, moc: 1, thuy: 1, hoa: 1, tho: 1 };
export const EMPTY_NGU_HANH: Record<NguHanhType, number> = { kim: 0, moc: 0, thuy: 0, hoa: 0, tho: 0 };

// --- HELPER CONSTANTS FOR CULTIVATION SYSTEMS ---
export const STANDARD_3_MINOR_REALMS: Omit<MinorRealm, 'id'>[] = [
    { rank: 1, name: "Sơ Kỳ", description: "Vừa đột phá, cảnh giới chưa ổn định.", isHidden: false },
    { rank: 2, name: "Trung Kỳ", description: "Cảnh giới vững chắc, thực lực tăng tiến.", isHidden: false },
    { rank: 3, name: "Hậu Kỳ", description: "Tu vi hùng hậu, sắp chạm đến bình cảnh.", isHidden: false },
];

export const STANDARD_4_MINOR_REALMS_DV: Omit<MinorRealm, 'id'>[] = [
    ...STANDARD_3_MINOR_REALMS,
    { rank: 4, name: "Đại Viên Mãn", description: "Cảnh giới hoàn mỹ, sẵn sàng cho lần đột phá tiếp theo.", isHidden: false },
];

export const DEBA_5_MINOR_REALMS: Omit<MinorRealm, 'id'>[] = [
    { rank: 1, name: "Sơ Cảnh", description: "Bước đầu vào cảnh giới.", isHidden: false },
    { rank: 2, name: "Tiểu Cảnh", description: "Cảnh giới dần vững chắc.", isHidden: false },
    { rank: 3, name: "Trung Cảnh", description: "Tu vi có chút thành tựu.", isHidden: false },
    { rank: 4, name: "Đại Cảnh", description: "Tu vi hùng hậu.", isHidden: false },
    { rank: 5, name: "Đỉnh Phong", description: "Đạt đến đỉnh cao của cảnh giới này.", isHidden: false },
];

export const kimDanQualities: Omit<RealmQuality, 'id' | 'description' | 'condition' | 'statBonusMultiplier' | 'lifespanBonus'>[] = [
    { rank: 1, name: 'Cửu Phẩm' }, { rank: 2, name: 'Bát Phẩm' }, { rank: 3, name: 'Thất Phẩm' },
    { rank: 4, name: 'Lục Phẩm' }, { rank: 5, name: 'Ngũ Phẩm' }, { rank: 6, name: 'Tứ Phẩm' },
    { rank: 7, name: 'Tam Phẩm' }, { rank: 8, name: 'Nhị Phẩm' }, { rank: 9, name: 'Nhất Phẩm' }
];
