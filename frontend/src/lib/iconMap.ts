import type { StatKey } from "../../../shared/types/stats";
import type { Element } from "../../../shared/types/item";

export const statIconMap: Partial<Record<StatKey, string>> = {
    strength: "earth",
    intelligence: "fire",
    chance: "water",
    agility: "air",

    neutralDamage: "neutral",
    earthDamage: "earth",
    fireDamage: "fire",
    waterDamage: "water",
    airDamage: "air",

    neutralResistPer: "neutralResist",
    earthResistPer: "earthResist",
    fireResistPer: "fireResist",
    waterResistPer: "waterResist",
    airResistPer: "airResist",
};

export function getIconFromStat(statKey: StatKey): string {
    // console.log(statKey);
    if (statIconMap[statKey]) {
        return statIconMap[statKey];
    } else {
        return statKey;
    }
}
export const elementIconMap: Record<Element, string> = {
    bestElem: "bestElemDamage",
    neutral: "neutral",
    earth: "earth",
    fire: "fire",
    water: "water",
    air: "air",

    apReduce: "ap",
    mpReduce: "mp",

    pull: "pull",
    push: "pushbackDamage",
};

export function getIconFromElement(element: Element): string {
    // console.log(statKey);
    if (elementIconMap[element]) {
        return elementIconMap[element];
    } else {
        return element;
    }
}
