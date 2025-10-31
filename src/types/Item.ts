import type { MinRequirement } from "../../frontend/src/workers/orchestrator";
import type { StatKey, Stats } from "./character";

export const ITEM_CATEGORIES = [
    "amulet",
    "belt",
    "boots",
    "cloak",
    "dofus",
    "ring",
    "hat",
    "pet",
    "weapon",
    "shield",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export type Item = {
    id: string;
    idShort: string;
    idDofusBook: number;
    level: number;
    name: Name;
    requirements?: Requirement[][]; // []and -> []or
    minRequirement?: MinRequirement;
    criterions?: string;
    panoply?: string;
    category: ItemCategory;
    stats: ItemStats;
};
export type Name = {
    fr: string;
    en: string;
    de: string;
    pt: string;
    es: string;
};
export type Requirement = {
    type: string;
    stat: StatKey | "panopliesBonus";
    value: number;
};
export type ItemStats = Partial<Stats>;

export type Items = Record<string, Item>;

export type Panoply = {
    id: string;
    // idShort: string;
    name: Name;
    items: string[];
    stats: ItemStats[];
};
export type Panoplies = Record<string, Panoply>;

export function convertItemRequirement(requirements: Requirement[][]): MinRequirement | undefined {
    let apRequirement;
    let mpRequirement;
    for (const andRequirement of requirements ?? []) {
        if (andRequirement[0] && andRequirement[0].stat == "panopliesBonus") {
            return {
                type: "panopliesBonusLessThan",
                value: andRequirement[0].value,
            };
        } else {
            let foundApOrMpCount = 0;
            for (const orRequirement of andRequirement) {
                if (orRequirement.stat == "ap" && orRequirement.type == "lessThan") {
                    apRequirement = orRequirement.value;
                    foundApOrMpCount++;
                } else if (orRequirement.stat == "mp" && orRequirement.type == "lessThan") {
                    mpRequirement = orRequirement.value;
                    foundApOrMpCount++;
                }
            }
            if (foundApOrMpCount >= 2 && apRequirement && mpRequirement) {
                return {
                    type: "apLessThanOrMpLessThan",
                    value: apRequirement,
                    value2: mpRequirement,
                };
            }
        }
    }
    if (apRequirement && mpRequirement) {
        return {
            type: "apLessThanAndMpLessThan",
            value: apRequirement,
            value2: mpRequirement,
        };
    }
    if (apRequirement) {
        return {
            type: "apLessThan",
            value: apRequirement,
        };
    }
    if (mpRequirement) {
        return {
            type: "mpLessThan",
            value: mpRequirement,
        };
    }
    return undefined;
}
