import type { Requirement, MinRequirement } from "../../shared/types/item";

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
