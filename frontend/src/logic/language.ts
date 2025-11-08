import { get } from "svelte/store";
import type { Requirement } from "../types/item";
import { preStats, words } from "../stores/builder";

export function translateRequirement(requirement: Requirement): string {
    // switch (requirement.type) {
    //     case "panopliesBonusLessThan":
    //         return `${get(words).panopliesBonus} < ${requirement.value}`;
    //     case "apLessThanOrMpLessThan":
    //         return `${get(words).stats.ap} < ${requirement.apValue} ${get(words).or} ${get(words).stats.mp} < ${requirement.mpValue} `;
    //     case "apLessThanAndMpLessThan":
    //         return `${get(words).stats.ap} < ${requirement.apValue} ${get(words).and} ${get(words).stats.mp} < ${requirement.mpValue} `;
    //     case "apLessThan":
    //         return `${get(words).stats.ap} < ${requirement.value}`;
    //     case "mpLessThan":
    //         return `${get(words).stats.mp} < ${requirement.value}`;
    // }
    const dict = get(words);
    let translation;
    if (dict.stats[requirement.stat]) {
        translation = dict.stats[requirement.stat];
    } else {
        translation = dict[requirement.stat];
    }

    if (requirement.type == "lessThan") {
        translation += " < ";
    } else if (requirement.type == "moreThan") {
        translation += " > ";
    } else if (requirement.type == "lessThanOrEquals") {
        translation += " max ";
    } else {
        translation += " ";
    }

    if (requirement.stat == "vitality") {
        translation +=
            requirement.value +
            (get(preStats).vitality ?? 0) +
            ` (${requirement.value} + ${dict.baseVitality})`;
    } else {
        translation += requirement.value;
    }

    return translation;
}
