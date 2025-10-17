// import { describe, expect, test } from "bun:test";
// import { encodeStatValues, decodeStatIndexes } from "./valueEncoding";
// import type { StatKey } from "../../types/stats";

// describe("value encoding", () => {
//     test("full encode/decode cycle preserves values", () => {
//         const tests = [
//             { stat: "strength" as StatKey, weight: 0, min: 100, max: 200 },
//             { stat: "ap" as StatKey, weight: 150, min: 11, max: 12 },
//             { stat: "neutralResist" as StatKey, weight: 6, min: 25, max: 50 },
//             { stat: "criticalChance" as StatKey, weight: 10, min: 1, max: 95 },
//         ];

//         for (const test of tests) {
//             const encoded = encodeStatValues(test.stat, test.weight, test.min, test.max);
//             expect(encoded.length).toBe(3);

//             const decoded = decodeStatIndexes(encoded);

//             expect(decoded.weight).toBe(test.weight);
//             expect(decoded.min).toBe(test.min);
//             expect(decoded.max).toBe(test.max);
//         }
//     });

//     test("handles edge cases", () => {
//         // Zero values
//         expect(encodeStatValues("strength", 0, 0, 0)).toBeDefined();

//         // Maximum values
//         const encoded = encodeStatValues("strength", 1, 109, 107);
//         const decoded = decodeStatIndexes(encoded);
//         expect(decoded.weight).toBe(1);
//         expect(decoded.min).toBe(100);
//         expect(decoded.max).toBe(100);
//     });
// });
