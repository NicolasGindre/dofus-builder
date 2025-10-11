import { get } from "svelte/store";
import type { Requirement } from "../types/item";
import { words } from "../stores/builder";

export function translateRequirement(requirement: Requirement): string {
    switch (requirement.type) {
        case "panopliesBonusLessThan":
            return `${get(words).panopliesBonus} < ${requirement.value}`;
        case "apLessThanOrMpLessThan":
            return `${get(words).stats.ap} < ${requirement.apValue} OR ${get(words).stats.mp} < ${requirement.mpValue} `;
        case "apLessThanAndMpLessThan":
            return `${get(words).stats.ap} < ${requirement.apValue} AND ${get(words).stats.mp} < ${requirement.mpValue} `;
        case "apLessThan":
            return `${get(words).stats.ap} < ${requirement.value}`;
        case "mpLessThan":
            return `${get(words).stats.mp} < ${requirement.value}`;
    }
    return requirement.type;
}
