use wasm_bindgen::prelude::*;
use js_sys::Function;

use std::borrow::Cow;
use std::cmp::{Ordering, Reverse};
use std::collections::BinaryHeap;

use crate::stats::{MaxStats, MinStats, Stats};
use crate::prepare::{build_pan_data, prepare_items, BuildResult, MinItem, PanoplyIn, Requirement};

use wgpu::util::DeviceExt;
use futures_channel::oneshot;
use bytemuck::{cast_slice, Pod, Zeroable};

const N_STATS: usize = 52;
const MAX_CATEGORIES: usize = 10;
const MAX_PANOPLIES: usize = 64;
const WORKGROUP_SIZE: u32 = 64;
const CHUNK_SIZE: u32 = 1_000_000;

/// Full build evaluation shader: stats accumulation + panoplies + Momore + requirements + value.
const BUILD_SHADER: &str = r#"
const NUM_STATS: u32 = 52u;
const MAX_CATEGORIES: u32 = 10u;
const MAX_PANOPLIES: u32 = 64u;

const STAT_AP: u32 = 0u;
const STAT_MP: u32 = 1u;
const STAT_RANGE: u32 = 2u;
const STAT_SUMMON: u32 = 3u;

struct Params {
    num_builds: u32,
    num_categories: u32,
    num_panoplies: u32,
    momore_pid: u32,
    chunk_start: u32,
    _pad0: u32,
    _pad1: u32,
    _pad2: u32,

    off_category_lens: u32,
    off_category_offsets: u32,
    off_item_req_kind: u32,
    off_item_pan_offset: u32,
    off_item_pan_len: u32,
    off_pan_ids: u32,
    off_pan_counts: u32,
    off_pan_bonus_offset: u32,
    off_pan_bonus_len: u32,

    off_items_stats: u32,
    off_item_req_v1: u32,
    off_item_req_v2: u32,
    off_pan_bonus_stats: u32,
    off_weights: u32,
    off_min_stats: u32,
    off_max_stats: u32,
    off_pre_stats: u32,
};

@group(0) @binding(0)
var<storage, read> meta_u32: array<u32>;

@group(0) @binding(1)
var<storage, read> meta_f32: array<f32>;

@group(0) @binding(2)
var<storage, read_write> out_values: array<f32>;

@group(0) @binding(3)
var<uniform> params: Params;

fn u32_at(base: u32, index: u32) -> u32 {
    return meta_u32[base + index];
}

fn f32_at(base: u32, index: u32) -> f32 {
    return meta_f32[base + index];
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let local = gid.x;
    if (local >= params.num_builds) {
        return;
    }

    let global_index: u32 = params.chunk_start + local;

    var idx: array<u32, MAX_CATEGORIES>;
    var t: u32 = global_index;
    for (var c: u32 = 0u; c < params.num_categories; c = c + 1u) {
        let len = u32_at(params.off_category_lens, c);
        idx[c] = t % len;
        t = t / len;
    }

    var build_stats: array<f32, NUM_STATS>;
    for (var s: u32 = 0u; s < NUM_STATS; s = s + 1u) {
        build_stats[s] = f32_at(params.off_pre_stats, s);
    }

    var pcount: array<u32, MAX_PANOPLIES>;
    for (var p: u32 = 0u; p < MAX_PANOPLIES; p = p + 1u) {
        pcount[p] = 0u;
    }

    var panoplies_bonus: u32 = 0u;

    // Accumulate item stats & panoply counts
    for (var c: u32 = 0u; c < params.num_categories; c = c + 1u) {
        let cat_off = u32_at(params.off_category_offsets, c);
        let base_item = cat_off + idx[c];

        let stats_base = params.off_items_stats + base_item * NUM_STATS;
        for (var s: u32 = 0u; s < NUM_STATS; s = s + 1u) {
            build_stats[s] = build_stats[s] + f32_at(stats_base, s);
        }

        let poff = u32_at(params.off_item_pan_offset, base_item);
        let plen = u32_at(params.off_item_pan_len, base_item);
        for (var j: u32 = 0u; j < plen; j = j + 1u) {
            let pid = u32_at(params.off_pan_ids, poff + j);
            let cnt = u32_at(params.off_pan_counts, poff + j);
            if (pid < MAX_PANOPLIES) {
                pcount[pid] = pcount[pid] + cnt;
            }
        }
    }

    // Panoply bonuses
    for (var pid: u32 = 0u; pid < params.num_panoplies; pid = pid + 1u) {
        let count = pcount[pid];
        if (count > 1u) {
            panoplies_bonus = panoplies_bonus + (count - 1u);

            let len = u32_at(params.off_pan_bonus_len, pid);
            if (len > 0u) {
                let clamped = select(count, len, count > len);
                let stats_index = u32_at(params.off_pan_bonus_offset, pid);
                let base = params.off_pan_bonus_stats + (stats_index + clamped - 1u) * NUM_STATS;
                for (var s: u32 = 0u; s < NUM_STATS; s = s + 1u) {
                    build_stats[s] = build_stats[s] + f32_at(base, s);
                }
            }
        }
    }

    // Momore rules
    if (params.momore_pid < params.num_panoplies) {
        let pid = params.momore_pid;
        let count = pcount[pid];
        if (count >= 2u) {
            var mp_val = build_stats[STAT_MP];
            var range_val = build_stats[STAT_RANGE];
            var summon_val = build_stats[STAT_SUMMON];

            if (count == 2u) {
                if (mp_val > 4.0) { mp_val = 4.0; }
                if (range_val > 4.0) { range_val = 4.0; }
                if (summon_val > 4.0) { summon_val = 4.0; }
            } else if (count == 3u || count == 4u || count == 5u) {
                if (mp_val > 3.0) { mp_val = 3.0; }
                if (range_val > 3.0) { range_val = 3.0; }
                if (summon_val > 3.0) { summon_val = 3.0; }
            } else if (count >= 6u) {
                if (mp_val > 2.0) { mp_val = 2.0; }
                if (range_val > 2.0) { range_val = 2.0; }
                if (summon_val > 2.0) { summon_val = 2.0; }
            }

            build_stats[STAT_MP] = mp_val;
            build_stats[STAT_RANGE] = range_val;
            build_stats[STAT_SUMMON] = summon_val;
        }
    }

    // Requirements
    var skip = false;

    for (var c: u32 = 0u; c < params.num_categories; c = c + 1u) {
        let cat_off = u32_at(params.off_category_offsets, c);
        let base_item = cat_off + idx[c];

        let kind = u32_at(params.off_item_req_kind, base_item);
        if (kind == 0u) {
            continue;
        }

        let v1 = f32_at(params.off_item_req_v1, base_item);
        let v2 = f32_at(params.off_item_req_v2, base_item);

        if (kind == 1u) {
            let thr = u32(v1);
            if (panoplies_bonus >= thr) {
                skip = true;
                break;
            }
        } else if (kind == 2u) {
            if (build_stats[STAT_AP] >= v1) {
                build_stats[STAT_AP] = v1 - 1.0;
            }
        } else if (kind == 3u) {
            if (build_stats[STAT_MP] >= v1) {
                build_stats[STAT_MP] = v1 - 1.0;
            }
        } else if (kind == 4u) {
            if (build_stats[STAT_AP] >= v1) {
                build_stats[STAT_AP] = v1 - 1.0;
            }
            if (build_stats[STAT_MP] >= v2) {
                build_stats[STAT_MP] = v2 - 1.0;
            }
        } else if (kind == 5u) {
            let ap_val = build_stats[STAT_AP];
            let mp_val = build_stats[STAT_MP];

            let max_ap = f32_at(params.off_max_stats, STAT_AP);
            let max_mp = f32_at(params.off_max_stats, STAT_MP);
            let min_ap = f32_at(params.off_min_stats, STAT_AP);
            let min_mp = f32_at(params.off_min_stats, STAT_MP);
            let w_ap = f32_at(params.off_weights, STAT_AP);
            let w_mp = f32_at(params.off_weights, STAT_MP);

            if (ap_val < v1 || mp_val < v2 || max_ap < v1 || max_mp < v2) {
            } else if (min_ap >= v1 && min_mp >= v2) {
                skip = true;
                break;
            } else if (min_ap >= v1) {
                build_stats[STAT_MP] = v2 - 1.0;
            } else if (min_mp >= v2) {
                build_stats[STAT_AP] = v1 - 1.0;
            } else if (w_ap > w_mp) {
                build_stats[STAT_MP] = v2 - 1.0;
            } else {
                build_stats[STAT_AP] = v1 - 1.0;
            }
        }
    }

    if (skip) {
        out_values[local] = 0.0;
        return;
    }

    var total: f32 = 0.0;
    for (var s: u32 = 0u; s < NUM_STATS; s = s + 1u) {
        let x = build_stats[s];
        let mn = f32_at(params.off_min_stats, s);
        if (x < mn) {
            out_values[local] = 0.0;
            return;
        }
        let w = f32_at(params.off_weights, s);
        let mx = f32_at(params.off_max_stats, s);
        var contrib: f32;
        if (x > mx) {
            contrib = mx * w;
        } else {
            contrib = x * w;
        }
        total = total + contrib;
    }

    out_values[local] = total;
}
"#;


/// Host-side copy of Params (must match WGSL layout).
#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
struct Params {
    // "dynamic" params
    num_builds: u32,
    num_categories: u32,
    num_panoplies: u32,
    momore_pid: u32,
    chunk_start: u32,
    _pad0: u32,
    _pad1: u32,
    _pad2: u32,

    // Offsets in meta_u32 (index in u32 units)
    off_category_lens: u32,
    off_category_offsets: u32,
    off_item_req_kind: u32,
    off_item_pan_offset: u32,
    off_item_pan_len: u32,
    off_pan_ids: u32,
    off_pan_counts: u32,
    off_pan_bonus_offset: u32,
    off_pan_bonus_len: u32,

    // Offsets in meta_f32 (index in f32 units)
    off_items_stats: u32,
    off_item_req_v1: u32,
    off_item_req_v2: u32,
    off_pan_bonus_stats: u32,
    off_weights: u32,
    off_min_stats: u32,
    off_max_stats: u32,
    off_pre_stats: u32,
}

#[derive(Clone, Copy, Debug)]
struct BestIndex {
    value: f32,
    index: u32, // global build index (0..total_builds-1)
}

impl Eq for BestIndex {}

impl PartialEq for BestIndex {
    fn eq(&self, other: &Self) -> bool {
        self.value == other.value
    }
}

impl Ord for BestIndex {
    fn cmp(&self, other: &Self) -> Ordering {
        self.value
            .partial_cmp(&other.value)
            .unwrap_or(Ordering::Equal)
    }
}

impl PartialOrd for BestIndex {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        self.value.partial_cmp(&other.value)
    }
}

/// Flattened GPU input buffers.
struct FlattenedGpuInput {
    // what GPU sees
    u32_data: Vec<u32>,
    f32_data: Vec<f32>,
    offsets: GpuOffsets,

    // what CPU still needs (for decode_indices)
    category_lens: Vec<u32>,
}

struct GpuOffsets {
    // meta_u32 sections
    off_category_lens: u32,
    off_category_offsets: u32,
    off_item_req_kind: u32,
    off_item_pan_offset: u32,
    off_item_pan_len: u32,
    off_pan_ids: u32,
    off_pan_counts: u32,
    off_pan_bonus_offset: u32,
    off_pan_bonus_len: u32,

    // meta_f32 sections
    off_items_stats: u32,
    off_item_req_v1: u32,
    off_item_req_v2: u32,
    off_pan_bonus_stats: u32,
    off_weights: u32,
    off_min_stats: u32,
    off_max_stats: u32,
    off_pre_stats: u32,
}

/// Flatten Stats → [f32; N_STATS] in the macro order.
fn stats_to_array(s: &Stats) -> [f32; N_STATS] {
    [
        s.ap,
        s.mp,
        s.range,
        s.summon,
        s.vitality,
        s.strength,
        s.agility,
        s.chance,
        s.intelligence,
        s.power,
        s.wisdom,
        s.prospecting,
        s.lock,
        s.dodge,
        s.critical_chance,
        s.critical_damage,
        s.pushback_damage,
        s.trap_damage,
        s.trap_power,
        s.spell_damage_per,
        s.ranged_damage_per,
        s.melee_damage_per,
        s.weapon_damage_per,
        s.final_damage_per,
        s.damage,
        s.neutral_damage,
        s.earth_damage,
        s.air_damage,
        s.water_damage,
        s.fire_damage,
        s.critical_resist,
        s.pushback_resist,
        s.neutral_resist,
        s.earth_resist,
        s.air_resist,
        s.water_resist,
        s.fire_resist,
        s.neutral_resist_per,
        s.earth_resist_per,
        s.air_resist_per,
        s.water_resist_per,
        s.fire_resist_per,
        s.ranged_resist_per,
        s.melee_resist_per,
        s.mp_reduction,
        s.ap_reduction,
        s.mp_resist,
        s.ap_resist,
        s.heal,
        s.reflect,
        s.initiative,
        s.pods,
    ]
}

fn min_to_array(m: &MinStats) -> [f32; N_STATS] {
    [
        m.ap,
        m.mp,
        m.range,
        m.summon,
        m.vitality,
        m.strength,
        m.agility,
        m.chance,
        m.intelligence,
        m.power,
        m.wisdom,
        m.prospecting,
        m.lock,
        m.dodge,
        m.critical_chance,
        m.critical_damage,
        m.pushback_damage,
        m.trap_damage,
        m.trap_power,
        m.spell_damage_per,
        m.ranged_damage_per,
        m.melee_damage_per,
        m.weapon_damage_per,
        m.final_damage_per,
        m.damage,
        m.neutral_damage,
        m.earth_damage,
        m.air_damage,
        m.water_damage,
        m.fire_damage,
        m.critical_resist,
        m.pushback_resist,
        m.neutral_resist,
        m.earth_resist,
        m.air_resist,
        m.water_resist,
        m.fire_resist,
        m.neutral_resist_per,
        m.earth_resist_per,
        m.air_resist_per,
        m.water_resist_per,
        m.fire_resist_per,
        m.ranged_resist_per,
        m.melee_resist_per,
        m.mp_reduction,
        m.ap_reduction,
        m.mp_resist,
        m.ap_resist,
        m.heal,
        m.reflect,
        m.initiative,
        m.pods,
    ]
}

fn max_to_array(m: &MaxStats) -> [f32; N_STATS] {
    [
        m.ap,
        m.mp,
        m.range,
        m.summon,
        m.vitality,
        m.strength,
        m.agility,
        m.chance,
        m.intelligence,
        m.power,
        m.wisdom,
        m.prospecting,
        m.lock,
        m.dodge,
        m.critical_chance,
        m.critical_damage,
        m.pushback_damage,
        m.trap_damage,
        m.trap_power,
        m.spell_damage_per,
        m.ranged_damage_per,
        m.melee_damage_per,
        m.weapon_damage_per,
        m.final_damage_per,
        m.damage,
        m.neutral_damage,
        m.earth_damage,
        m.air_damage,
        m.water_damage,
        m.fire_damage,
        m.critical_resist,
        m.pushback_resist,
        m.neutral_resist,
        m.earth_resist,
        m.air_resist,
        m.water_resist,
        m.fire_resist,
        m.neutral_resist_per,
        m.earth_resist_per,
        m.air_resist_per,
        m.water_resist_per,
        m.fire_resist_per,
        m.ranged_resist_per,
        m.melee_resist_per,
        m.mp_reduction,
        m.ap_reduction,
        m.mp_resist,
        m.ap_resist,
        m.heal,
        m.reflect,
        m.initiative,
        m.pods,
    ]
}

/// Flatten all data needed by the GPU kernel.
fn flatten_gpu_input(
    items: &[Vec<crate::prepare::ItemPrepared>],
    pan: &crate::prepare::PanData,
) -> FlattenedGpuInput {
    let num_categories = items.len();

    // CPU-local copies for decode_indices later
    let mut category_lens: Vec<u32> = Vec::with_capacity(num_categories);

    // Flatten items and panoply info
    let mut category_offsets: Vec<u32> = Vec::with_capacity(num_categories);

    let mut items_stats: Vec<f32> = Vec::new();
    let mut item_req_kind: Vec<u32> = Vec::new();
    let mut item_req_v1: Vec<f32> = Vec::new();
    let mut item_req_v2: Vec<f32> = Vec::new();

    let mut item_pan_offset: Vec<u32> = Vec::new();
    let mut item_pan_len: Vec<u32> = Vec::new();
    let mut pan_ids: Vec<u32> = Vec::new();
    let mut pan_counts: Vec<u32> = Vec::new();

    let mut current_item_index: u32 = 0;

    for cat in items {
        category_offsets.push(current_item_index);
        category_lens.push(cat.len() as u32);

        for item in cat {
            let stats_arr = stats_to_array(&item.stats);
            items_stats.extend_from_slice(&stats_arr);

            match &item.requirement {
                None => {
                    item_req_kind.push(0);
                    item_req_v1.push(0.0);
                    item_req_v2.push(0.0);
                }
                Some(Requirement::PanopliesBonusLessThan { value }) => {
                    item_req_kind.push(1);
                    item_req_v1.push(*value as f32);
                    item_req_v2.push(0.0);
                }
                Some(Requirement::ApLessThan { value }) => {
                    item_req_kind.push(2);
                    item_req_v1.push(*value);
                    item_req_v2.push(0.0);
                }
                Some(Requirement::MpLessThan { value }) => {
                    item_req_kind.push(3);
                    item_req_v1.push(*value);
                    item_req_v2.push(0.0);
                }
                Some(Requirement::ApLessThanAndMpLessThan { value, value_2 }) => {
                    item_req_kind.push(4);
                    item_req_v1.push(*value);
                    item_req_v2.push(*value_2);
                }
                Some(Requirement::ApLessThanOrMpLessThan { value, value_2 }) => {
                    item_req_kind.push(5);
                    item_req_v1.push(*value);
                    item_req_v2.push(*value_2);
                }
            }

            let start = pan_ids.len() as u32;
            let len = item.pan_sparse.len() as u32;
            item_pan_offset.push(start);
            item_pan_len.push(len);

            for &(pid, cnt) in &item.pan_sparse {
                pan_ids.push(pid as u32);
                pan_counts.push(cnt as u32);
            }

            current_item_index += 1;
        }
    }

    // Flatten panoply bonuses
    let num_panoplies = pan.bonus.len();
    let mut pan_bonus_offset: Vec<u32> = Vec::with_capacity(num_panoplies);
    let mut pan_bonus_len: Vec<u32> = Vec::with_capacity(num_panoplies);
    let mut pan_bonus_stats: Vec<f32> = Vec::new();

    for bonuses in &pan.bonus {
        let offset = (pan_bonus_stats.len() / N_STATS) as u32; // offset in Stats units
        pan_bonus_offset.push(offset);
        pan_bonus_len.push(bonuses.len() as u32);

        for st in bonuses {
            let arr = stats_to_array(st);
            pan_bonus_stats.extend_from_slice(&arr);
        }
    }

    // Now PACK into u32_data / f32_data
    let mut u32_data: Vec<u32> = Vec::new();
    let mut f32_data: Vec<f32> = Vec::new();

    // meta_u32 layout
    let off_category_lens = u32_data.len() as u32;
    u32_data.extend_from_slice(&category_lens);

    let off_category_offsets = u32_data.len() as u32;
    u32_data.extend_from_slice(&category_offsets);

    let off_item_req_kind = u32_data.len() as u32;
    u32_data.extend_from_slice(&item_req_kind);

    let off_item_pan_offset = u32_data.len() as u32;
    u32_data.extend_from_slice(&item_pan_offset);

    let off_item_pan_len = u32_data.len() as u32;
    u32_data.extend_from_slice(&item_pan_len);

    let off_pan_ids = u32_data.len() as u32;
    u32_data.extend_from_slice(&pan_ids);

    let off_pan_counts = u32_data.len() as u32;
    u32_data.extend_from_slice(&pan_counts);

    let off_pan_bonus_offset = u32_data.len() as u32;
    u32_data.extend_from_slice(&pan_bonus_offset);

    let off_pan_bonus_len = u32_data.len() as u32;
    u32_data.extend_from_slice(&pan_bonus_len);

    // meta_f32 layout
    let off_items_stats = f32_data.len() as u32;
    f32_data.extend_from_slice(&items_stats);

    let off_item_req_v1 = f32_data.len() as u32;
    f32_data.extend_from_slice(&item_req_v1);

    let off_item_req_v2 = f32_data.len() as u32;
    f32_data.extend_from_slice(&item_req_v2);

    let off_pan_bonus_stats = f32_data.len() as u32;
    f32_data.extend_from_slice(&pan_bonus_stats);

    // Weights / min / max / pre will be appended later (in best_combo_gpu)
    let offsets = GpuOffsets {
        off_category_lens,
        off_category_offsets,
        off_item_req_kind,
        off_item_pan_offset,
        off_item_pan_len,
        off_pan_ids,
        off_pan_counts,
        off_pan_bonus_offset,
        off_pan_bonus_len,
        off_items_stats,
        off_item_req_v1,
        off_item_req_v2,
        off_pan_bonus_stats,
        off_weights: 0,    // will be filled later
        off_min_stats: 0,  // will be filled later
        off_max_stats: 0,  // will be filled later
        off_pre_stats: 0,  // will be filled later
    };

    FlattenedGpuInput {
        u32_data,
        f32_data,
        offsets,
        category_lens,
    }
}

/// Decode a global linear index into per-category indices (same scheme as WGSL).
fn decode_indices(global_index: u32, category_lens: &[u32], num_categories: usize) -> Vec<usize> {
    let mut t = global_index as u64;
    let mut idx = Vec::with_capacity(num_categories);
    for c in 0..num_categories {
        let len = category_lens[c] as u64;
        let v = (t % len) as usize;
        t /= len;
        idx.push(v);
    }
    idx
}

/// GPU implementation of best_combo: full evaluation on GPU.
pub async fn best_combo_gpu_impl(
    items_category_js: JsValue,
    weights_js: JsValue,
    min_js: JsValue,
    max_js: JsValue,
    pre_stats_js: JsValue,
    panoplies_js: JsValue,
    progress_cb: Option<Function>,
) -> Result<JsValue, JsValue> {
    // Deserialize input
    let items_category: Vec<Vec<MinItem>> = serde_wasm_bindgen::from_value(items_category_js)
        .map_err(|e| JsValue::from_str(&format!("deserialize categories: {e}")))?;
    let weights: Stats = serde_wasm_bindgen::from_value(weights_js)
        .map_err(|e| JsValue::from_str(&format!("deserialize weights: {e}")))?;
    let min_stats: MinStats = serde_wasm_bindgen::from_value(min_js)
        .map_err(|e| JsValue::from_str(&format!("deserialize min stats: {e}")))?;
    let max_stats: MaxStats = serde_wasm_bindgen::from_value(max_js)
        .map_err(|e| JsValue::from_str(&format!("deserialize max stats: {e}")))?;
    let pre_stats: Stats = serde_wasm_bindgen::from_value(pre_stats_js)
        .map_err(|e| JsValue::from_str(&format!("deserialize base stats: {e}")))?;
    let pans_in: Vec<PanoplyIn> = serde_wasm_bindgen::from_value(panoplies_js)
        .map_err(|e| JsValue::from_str(&format!("deserialize panoplies: {e}")))?;

    // Panoply data & prepared items
    let pan = build_pan_data(&pans_in);
    let items = prepare_items(items_category, &pan);

    let num_categories = items.len();
    if num_categories == 0 {
        // Just return empty results
        let empty: Vec<BuildResult> = Vec::new();
        return serde_wasm_bindgen::to_value(&empty)
            .map_err(|e| JsValue::from_str(&format!("serialize: {e}")));
    }

    if num_categories > MAX_CATEGORIES {
        return Err(JsValue::from_str(
            "GPU version: too many categories; increase MAX_CATEGORIES or reduce input",
        ));
    }

    if pan.bonus.len() > MAX_PANOPLIES {
        return Err(JsValue::from_str(
            "GPU version: too many panoplies; increase MAX_PANOPLIES or reduce input",
        ));
    }

    for (category_i, cat) in items.iter().enumerate() {
        if cat.is_empty() {
            return Err(JsValue::from_str(&format!("category {category_i} is empty")));
        }
    }

    // Compute total combinations (limit to u32 for GPU indexing)
    let total_combinations: u128 = items
        .iter()
        .map(|slot_items| slot_items.len() as u128)
        .product();

    if total_combinations == 0 {
        let empty: Vec<BuildResult> = Vec::new();
        return serde_wasm_bindgen::to_value(&empty)
            .map_err(|e| JsValue::from_str(&format!("serialize: {e}")));
    }

    if total_combinations > u32::MAX as u128 {
        return Err(JsValue::from_str(
            "GPU version currently supports up to 2^32 combinations; this search is larger",
        ));
    }

    let total_builds: u32 = total_combinations as u32;

    // Flatten GPU input
    let flattened = flatten_gpu_input(&items, &pan);

    // Momore panoply id
    const PANO_CIRE_MOMORE_ID: &str = "6h";
    let pano_cire_momore_pid = pan.panoply_to_pid.get(PANO_CIRE_MOMORE_ID).copied();
    let momore_pid_u32: u32 = pano_cire_momore_pid
        .map(|x| x as u32)
        .unwrap_or(u32::MAX);

    // WGPU setup
    let instance = wgpu::Instance::new(&wgpu::InstanceDescriptor {
        ..Default::default()
    });

    let adapter = instance
        .request_adapter(&wgpu::RequestAdapterOptions {
            power_preference: wgpu::PowerPreference::HighPerformance,
            compatible_surface: None,
            force_fallback_adapter: false,
        })
        .await
        .map_err(|e| JsValue::from_str(&format!("request_adapter failed: {e:?}")))?;

    let (device, queue) = adapter
        .request_device(
            &wgpu::DeviceDescriptor {
                label: Some("combo-device"),
                required_features: wgpu::Features::empty(),
                required_limits: if cfg!(target_arch = "wasm32") {
                    wgpu::Limits::downlevel_webgl2_defaults()
                } else {
                    wgpu::Limits::default()
                },
                experimental_features: wgpu::ExperimentalFeatures::disabled(),
                memory_hints: wgpu::MemoryHints::Performance,
                trace: wgpu::Trace::Off,
            },
        )
        .await
        .map_err(|e| JsValue::from_str(&format!("request_device failed: {e:?}")))?;

    let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
        label: Some("build-eval-shader"),
        source: wgpu::ShaderSource::Wgsl(Cow::Borrowed(BUILD_SHADER)),
    });

    let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
        label: Some("build-bgl"),
        entries: &[
            // 0: meta_u32
            wgpu::BindGroupLayoutEntry {
                binding: 0,
                visibility: wgpu::ShaderStages::COMPUTE,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Storage { read_only: true },
                    has_dynamic_offset: false,
                    min_binding_size: None,
                },
                count: None,
            },
            // 1: meta_f32
            wgpu::BindGroupLayoutEntry {
                binding: 1,
                visibility: wgpu::ShaderStages::COMPUTE,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Storage { read_only: true },
                    has_dynamic_offset: false,
                    min_binding_size: None,
                },
                count: None,
            },
            // 2: out_values
            wgpu::BindGroupLayoutEntry {
                binding: 2,
                visibility: wgpu::ShaderStages::COMPUTE,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Storage { read_only: false },
                    has_dynamic_offset: false,
                    min_binding_size: None,
                },
                count: None,
            },
            // 3: params (uniform)
            wgpu::BindGroupLayoutEntry {
                binding: 3,
                visibility: wgpu::ShaderStages::COMPUTE,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Uniform,
                    has_dynamic_offset: false,
                    min_binding_size: None,
                },
                count: None,
            },
        ],
    });

    let pipeline_layout =
        device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
            label: Some("build-pipeline-layout"),
            bind_group_layouts: &[&bind_group_layout],
            push_constant_ranges: &[],
        });

    let pipeline = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
        label: Some("build-pipeline").into(),
        layout: Some(&pipeline_layout),
        module: &shader,
        entry_point: Some("main"),
        compilation_options: wgpu::PipelineCompilationOptions::default(),
        cache: None,
    });

    let mut f32_data = flattened.f32_data;
    let mut offsets = flattened.offsets;

    // append weights/min/max/pre to f32_data
    let weights_arr = stats_to_array(&weights);
    offsets.off_weights = f32_data.len() as u32;
    f32_data.extend_from_slice(&weights_arr);

    let min_arr = min_to_array(&min_stats);
    offsets.off_min_stats = f32_data.len() as u32;
    f32_data.extend_from_slice(&min_arr);

    let max_arr = max_to_array(&max_stats);
    offsets.off_max_stats = f32_data.len() as u32;
    f32_data.extend_from_slice(&max_arr);

    let pre_arr = stats_to_array(&pre_stats);
    offsets.off_pre_stats = f32_data.len() as u32;
    f32_data.extend_from_slice(&pre_arr);

    // Now create the 2 meta buffers:
    let meta_u32_buf = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
        label: Some("meta-u32"),
        contents: cast_slice(&flattened.u32_data),
        usage: wgpu::BufferUsages::STORAGE,
    });

    let meta_f32_buf = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
        label: Some("meta-f32"),
        contents: cast_slice(&f32_data),
        usage: wgpu::BufferUsages::STORAGE,
    });

    // Output + readback buffers sized for max chunk
    let max_chunk_size = std::cmp::min(CHUNK_SIZE, total_builds);
    let out_buffer_size =
        max_chunk_size as u64 * std::mem::size_of::<f32>() as u64;

    let out_values_buf = device.create_buffer(&wgpu::BufferDescriptor {
        label: Some("out-values"),
        size: out_buffer_size,
        usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_SRC,
        mapped_at_creation: false,
    });

    let readback_buf = device.create_buffer(&wgpu::BufferDescriptor {
        label: Some("readback"),
        size: out_buffer_size,
        usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
        mapped_at_creation: false,
    });

    // Params buffer
    let params_buf = device.create_buffer(&wgpu::BufferDescriptor {
        label: Some("params-buffer"),
        size: std::mem::size_of::<Params>() as u64,
        usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        mapped_at_creation: false,
    });

    let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
        label: Some("build-bind-group"),
        layout: &bind_group_layout,
        entries: &[
            wgpu::BindGroupEntry {
                binding: 0,
                resource: meta_u32_buf.as_entire_binding(),
            },
            wgpu::BindGroupEntry {
                binding: 1,
                resource: meta_f32_buf.as_entire_binding(),
            },
            wgpu::BindGroupEntry {
                binding: 2,
                resource: out_values_buf.as_entire_binding(),
            },
            wgpu::BindGroupEntry {
                binding: 3,
                resource: params_buf.as_entire_binding(),
            },
        ],
    });

    // Heap for top 500 builds (by value)
    let mut heap: BinaryHeap<Reverse<BestIndex>> = BinaryHeap::new();
    let mut lowest_best_value: f32 = 0.0;

    let mut combinations_done: u128 = 0;
    let total_combinations_u128 = total_combinations;

    let target_updates = 50u128;
    let stride: u128 = (total_combinations_u128 / target_updates)
        .clamp(100_000, 1_000_000);

    // Chunked dispatch
    let mut chunk_start: u32 = 0;

    while chunk_start < total_builds {
        let remaining = total_builds - chunk_start;
        let num_builds = remaining.min(max_chunk_size);

        // Update params
        let params = Params {
            num_builds,
            num_categories: num_categories as u32,
            num_panoplies: pan.bonus.len() as u32,
            momore_pid: momore_pid_u32,
            chunk_start,
            _pad0: 0,
            _pad1: 0,
            _pad2: 0,

            off_category_lens: offsets.off_category_lens,
            off_category_offsets: offsets.off_category_offsets,
            off_item_req_kind: offsets.off_item_req_kind,
            off_item_pan_offset: offsets.off_item_pan_offset,
            off_item_pan_len: offsets.off_item_pan_len,
            off_pan_ids: offsets.off_pan_ids,
            off_pan_counts: offsets.off_pan_counts,
            off_pan_bonus_offset: offsets.off_pan_bonus_offset,
            off_pan_bonus_len: offsets.off_pan_bonus_len,

            off_items_stats: offsets.off_items_stats,
            off_item_req_v1: offsets.off_item_req_v1,
            off_item_req_v2: offsets.off_item_req_v2,
            off_pan_bonus_stats: offsets.off_pan_bonus_stats,
            off_weights: offsets.off_weights,
            off_min_stats: offsets.off_min_stats,
            off_max_stats: offsets.off_max_stats,
            off_pre_stats: offsets.off_pre_stats,
        };

        queue.write_buffer(&params_buf, 0, cast_slice(&[params]));

        // Encode compute + copy
        let mut encoder =
            device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("build-encoder"),
            });

        {
            let mut cpass =
                encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
                    label: Some("build-pass"),
                    timestamp_writes: None,
                });
            cpass.set_pipeline(&pipeline);
            cpass.set_bind_group(0, &bind_group, &[]);

            let workgroups =
                (num_builds + WORKGROUP_SIZE - 1) / WORKGROUP_SIZE;
            cpass.dispatch_workgroups(workgroups, 1, 1);
        }

        let size_bytes =
            num_builds as u64 * std::mem::size_of::<f32>() as u64;

        encoder.copy_buffer_to_buffer(
            &out_values_buf,
            0,
            &readback_buf,
            0,
            size_bytes,
        );

        queue.submit(Some(encoder.finish()));

        // Map readback
        let slice = readback_buf.slice(0..size_bytes);
        let (tx, rx) = oneshot::channel();
        slice.map_async(wgpu::MapMode::Read, move |res| {
            let _ = tx.send(res);
        });

        // On wasm this is effectively a no-op, but harmless.
        let _ = device.poll(wgpu::PollType::Wait {
            submission_index: None,
            timeout: None,
        });

        rx.await
            .map_err(|_| JsValue::from_str("map_async failed to signal"))?
            .map_err(|_| JsValue::from_str("Failed to map readback buffer"))?;

        {
            let data = slice.get_mapped_range();
            let values: &[f32] = cast_slice(&data);

            for i in 0..(num_builds as usize) {
                let build_value = values[i];
                let global_index = chunk_start + i as u32;

                if heap.len() < 500 || build_value > lowest_best_value {
                    let bi = BestIndex {
                        value: build_value,
                        index: global_index,
                    };
                    if heap.len() == 500 {
                        heap.pop();
                    }
                    heap.push(Reverse(bi));
                    lowest_best_value = heap.peek().unwrap().0.value;
                }
            }
        }

        readback_buf.unmap();

        combinations_done += num_builds as u128;
        if let Some(callback) = &progress_cb {
            if combinations_done % stride == 0
                || combinations_done == total_combinations_u128
            {
                let _ = callback.call1(
                    &JsValue::NULL,
                    &JsValue::from_f64(combinations_done as f64),
                );
            }
        }

        chunk_start += num_builds;
    }

    // Build final results: decode indices, map to ids
    let mut best: Vec<BestIndex> = heap.into_iter().map(|r| r.0).collect();
    best.sort_by(|a, b| {
        b.value
            .partial_cmp(&a.value)
            .unwrap_or(Ordering::Equal)
    });

    let mut results: Vec<BuildResult> = Vec::with_capacity(best.len());
    let category_lens = &flattened.category_lens;

    for bi in best {
        let idx_vec = decode_indices(bi.index, category_lens, num_categories);
        let mut ids: Vec<String> = Vec::with_capacity(num_categories);
        for (ci, &ii) in idx_vec.iter().enumerate() {
            ids.push(items[ci][ii].id.clone());
        }
        results.push(BuildResult {
            value: bi.value,
            ids,
        });
    }

    serde_wasm_bindgen::to_value(&results)
        .map_err(|e| JsValue::from_str(&format!("serialize: {e}")))
}
