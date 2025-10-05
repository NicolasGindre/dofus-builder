import { derived, writable } from "svelte/store";
import type { Stats } from "../types/stats";
import {
    getEmptyCategoriesItems,
    getEmptyCategoriesItemsArr,
    type ItemCategory,
    type Items,
    type Panoplies,
    type Panoply,
} from "../types/item";
import { getLeveledStats, type CharacterBuild } from "../types/character";
import { getPanoply } from "../logic/frontendDB";
import {
    calculateAllItemsToDisplay,
    calculateItemsToDisplay,
    calculatePanopliesToDisplay,
} from "../logic/display";

// export const distanceFromBestRatio = writable<number>(3);
export const panoplyDisplaySize = writable<number>(20);
export const categoryDisplaySize = writable<Record<ItemCategory, number>>({
    amulet: 15,
    belt: 15,
    boots: 15,
    cloak: 15,
    dofus: 15,
    ring: 15,
    hat: 15,
    pet: 15,
    weapon: 15,
    shield: 15,
});
export const showBonusPanoCappedItems = writable<boolean>(true);
export const sortBestItemsWithPanoValue = writable<boolean>(true);
export const showOnlySelectedPanos = writable<boolean>(false);

export const weights = writable<Partial<Stats>>({
    summon: 0,
    range: 50,
    mp: 201,
    ap: 200,

    health: 0,

    wisdom: 0,
    prospecting: 0,

    strength: 0.6,
    agility: 0.6,
    chance: 0.5,
    intelligence: 0.1,

    power: 2,

    neutralDamage: 0,
    earthDamage: 1.4,
    airDamage: 1.65,
    fireDamage: 0.8,
    waterDamage: 1.65,

    damage: 5.5,

    pushbackDamage: 2,

    criticalDamage: 0.7,
    criticalChance: 3,

    neutralResistPer: 21,
    airResistPer: 21,
    earthResistPer: 21,
    fireResistPer: 21,
    waterResistPer: 21,

    criticalResist: 1,
    pushbackResist: 1.5,

    neutralResist: 0,
    earthResist: 0,
    waterResist: 0,
    airResist: 0,
    fireResist: 0,

    pods: 0,
    initiative: 0.03,

    trapPower: 0,
    trapDamage: 0,

    lock: 1.4,
    dodge: 1.4,

    mpReduction: 10,
    apReduction: 0,
    apResist: 2.2,
    mpResist: 2.2,

    heal: 0,
    reflect: 0,

    spellDamagePer: 10,
    rangedDamagePer: 10,
    weaponDamagePer: 10,
    meleeDamagePer: 10,
    finalDamagePer: 10,

    meleeResistPer: 1,
    rangedResistPer: 1,
});
export const minStats = writable<Partial<Stats>>({
    ap: 11,
    mp: 5,
    range: 0,
});
export const maxStats = writable<Partial<Stats>>({
    ap: 12,
    mp: 6,
    range: 6,
    criticalChance: 95,
    neutralResistPer: 50,
    airResistPer: 50,
    fireResistPer: 50,
    earthResistPer: 50,
    waterResistPer: 50,
});
export const exoAp = writable<boolean>(false);
export const exoMp = writable<boolean>(false);
export const exoRange = writable<boolean>(false);
export const level = writable<number>(200);

export const preStats = derived(
    [level, exoAp, exoMp, exoRange],
    ([$level, $exoAp, $exoMp, $exoRange]) => {
        let preStats = getLeveledStats($level);
        if ($exoAp) {
            preStats.ap!++;
        }
        if ($exoMp) {
            preStats.mp!++;
        }
        if ($exoRange) {
            preStats.range!++;
        }
        return preStats;
    },
);

export const items = writable<Items>({});
export const panoplies = writable<Panoplies>({});

export const itemsCategory = writable(getEmptyCategoriesItemsArr());
export const itemsCategoryBest = writable(getEmptyCategoriesItemsArr());
export const itemsCategoryWithPanoBest = writable(getEmptyCategoriesItemsArr());

export const itemsCategoryDisplayed = writable(getEmptyCategoriesItemsArr());

export const itemsSelected = writable(getEmptyCategoriesItems());

export const categoryBestValue = writable<Record<ItemCategory, number>>();

export const panopliesBest = writable<Panoply[]>([]);
// export const panopliesDisplayed = writable<Panoply[]>([]);

export const bestBuilds = writable<CharacterBuild[]>([]);

export const totalPossibilities = derived(itemsSelected, ($itemsCategory) => {
    let possibilities = 1;
    for (const [category, items] of Object.entries($itemsCategory)) {
        let count = Object.values(items).length;
        if (category == "ring") {
            count = (count * (count - 1)) / 2;
        }
        if (category == "dofus") {
            count =
                (count * (count - 1) * (count - 2) * (count - 3) * (count - 4) * (count - 5)) / 720;
        }

        possibilities *= count == 0 ? 1 : count;
    }
    return possibilities;
});

export const panopliesSelected = derived(itemsSelected, ($itemsCategory) => {
    // const panoplies: Panoply[] = [];
    const panoplies: Panoplies = {};
    for (const items of Object.values($itemsCategory)) {
        for (const item of Object.values(items)) {
            if (item.panoply && !panoplies[item.panoply]) {
                panoplies[item.panoply] = getPanoply(item.panoply);
            }
        }
    }
    return Object.values(panoplies);
});
export const panopliesDisplayed = writable<Panoply[]>([]);
// export const panopliesDisplayed = derived(
//     [panopliesBest, panopliesSelected],
//     ([$panopliesBest, $panopliesSelected]) =>
//         calculatePanopliesToDisplay($panopliesBest, $panopliesSelected),
// );

sortBestItemsWithPanoValue.subscribe(() => {
    calculateAllItemsToDisplay();
});
showBonusPanoCappedItems.subscribe(() => {
    calculateItemsToDisplay("dofus");
});
categoryDisplaySize.subscribe(() => {
    calculateAllItemsToDisplay();
});
