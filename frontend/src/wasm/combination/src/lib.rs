use wasm_bindgen::prelude::*;
use web_sys::console;
use serde::{Deserialize, Serialize};
use web_sys::js_sys::Function;
use crate::stats::{Stats, MaxStats, MinStats};
pub mod stats;
use std::cmp::Reverse;
use std::collections::BinaryHeap;
// use smallvec::SmallVec;

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

fn log<T: AsRef<str>>(msg: T) {
    console::log_1(&msg.as_ref().into());
}

#[derive(Serialize, Deserialize, Clone)]
pub struct MinItem {
    pub id: String,
    pub stats: Stats,
    // pub category: String,
    #[serde(default)]
    pub panoplies: Vec<String>, // if empty, we assume vec![name]
    #[serde(default)]
    pub requirement: Option<Requirement>,
}

#[derive(Clone, Debug)]
struct ItemPrepared {
    id: String,
    stats: Stats,
    // sparse contributions: (pid, how many set pieces this item brings for that panoply)
    pan_sparse: Vec<(usize, u8)>,
    requirement: Option<Requirement>,
}
#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Requirement {
    PanopliesBonusLessThan { value: usize },
    ApLessThan { value: f64 },
    MpLessThan { value: f64 },
    ApLessThanOrMpLessThan {
        #[serde(rename = "value")]
        value: f64,
        #[serde(rename = "value2")]
        value_2: f64,
    },
    // If you also have this variant, same deal:
    ApLessThanAndMpLessThan {
        #[serde(rename = "value")]
        value: f64,
        #[serde(rename = "value2")]
        value_2: f64,
    },
}

#[inline(never)]
pub fn adjust_requirement_for_pre_stats(req: &mut Requirement, pre: &Stats) {
    match req {
        Requirement::PanopliesBonusLessThan { .. } => {
            // nothing to adjust
        }
        Requirement::ApLessThan { value } => {
            *value -= pre.ap;
        }
        Requirement::MpLessThan { value } => {
            *value -= pre.mp;
        }
        Requirement::ApLessThanOrMpLessThan { value, value_2 } => {
            *value -= pre.ap;
            *value_2 -= pre.mp;
        }
        Requirement::ApLessThanAndMpLessThan { value, value_2 } => {
            *value -= pre.ap;
            *value_2 -= pre.mp;
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PanoplyIn {
    pub id: String,
    pub items: Vec<String>,
    #[serde(rename = "statsWithBonus")]
    pub stats: Vec<Stats>, // stats[count-1] = TOTAL bonus for 'count' items (1-based)
}
use std::collections::HashMap;
#[derive(Clone, Debug)]
struct PanData {
    // per pid: bonus[count-1] = Stats (clamped in use if count > len)
    bonus: Vec<Vec<Stats>>,
    // mapping from item string id -> panoply id
    panoply_to_pid: HashMap<String, usize>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BuildResult {
    pub value: f64,
    pub ids: Vec<String>,
}

impl Eq for BuildResult {}

impl PartialEq for BuildResult {
    fn eq(&self, other: &Self) -> bool {
        self.value == other.value
    }
}

impl Ord for BuildResult {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.value.partial_cmp(&other.value).unwrap()
    }
}

impl PartialOrd for BuildResult {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        self.value.partial_cmp(&other.value)
    }
}

#[inline(never)]
fn build_pan_data(all_panoplies: &[PanoplyIn]) -> PanData {
    let mut panoply_to_pid = HashMap::new();
    let mut bonus_tables = Vec::with_capacity(all_panoplies.len());

    for (panoply_id, pan) in all_panoplies.iter().enumerate() {
        panoply_to_pid.insert(pan.id.clone(), panoply_id);
        bonus_tables.push(pan.stats.clone()); // assuming already cumulative per count
    }

    PanData {
        bonus: bonus_tables,
        panoply_to_pid,
    }
}

#[inline(never)]
fn prepare_items(
    categories_in: Vec<Vec<MinItem>>,
    panoply_data: &PanData,
    // pre_stats: &Stats,
) -> Vec<Vec<ItemPrepared>> {
    categories_in
        .into_iter()
        .map(|category_items| {
            category_items
                .into_iter()
                .map(|min_item| {
                // .map(|mut min_item| {
                    // if let Some(req) = &mut min_item.requirement {
                    //     adjust_requirement_for_pre_stats(req, &pre_stats);
                    // }
                    // Count how many pieces this item contributes for each panoply it declares.
                    // If the item has no panoplies, this stays empty (as intended).
                    let mut per_panoply_counts: HashMap<usize, u8> = HashMap::new();

                    for panoply_id_string in &min_item.panoplies {
                        if let Some(&panoply_id) = panoply_data.panoply_to_pid.get(panoply_id_string) {
                            *per_panoply_counts.entry(panoply_id).or_insert(0) += 1;
                        }
                        // Unknown panoply string ids are ignored silently.
                    }

                    // Convert to a small, cache-friendly sorted vector.
                    let mut pan_sparse: Vec<(usize, u8)> = per_panoply_counts.into_iter().collect();
                    pan_sparse.sort_unstable_by_key(|&(panoply_id, _)| panoply_id);

                    ItemPrepared {
                        id: min_item.id,
                        stats: min_item.stats,
                        pan_sparse,
                        requirement: min_item.requirement,
                    }
                })
                .collect()
        })
        .collect()
}
// #[derive(Serialize, Deserialize)]
// pub struct BestResult {
//     pub value: f64,
//     pub names: Vec<String>, // one per category, same order as input
// }

#[wasm_bindgen]
    pub fn best_combo(
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

    log(format!("Rust starts calculating items in X categories: {:?}", items_category.len()));

    // let min_adj = &min_stats - &pre_stats;
    // let max_adj = &max_stats - &pre_stats;

    // log(format!("min_stats: {:?}", min_stats));

    // Expect Vec<Vec<MinItem>>: items_category[i] = list of items in that category
    // let categories: Vec<Vec<MinItem>> = serde_wasm_bindgen::from_value(items_category_js)
    //     .map_err(|e| JsValue::from_str(&format!("deserialize: {e}")))?;

    // Precompute panoply data & annotate items
    let pan: PanData = build_pan_data(&pans_in);
    let items = prepare_items(items_category, &pan);
    // let items = prepare_items(items_category, &pan, &pre_stats);

    // for category in &mut items {
    //     for item in category {
    //         if let Some(req) = &mut item.requirement {
    //             req.adjust_for_pre_stats(&pre_stats);
    //         }
    //     }
    // }
    // log(format!("panoplies: {:?}", pan));
    // log(format!("items: {:?}", items));

    // Hardcoded Malédiction de Cire Momore
    const PANO_CIRE_MOMORE_ID: &str = "1a";
    let pano_cire_momore_pid = pan.panoply_to_pid.get(PANO_CIRE_MOMORE_ID).copied();

    // if items.is_empty() {
    //     let empty = BestResult { value: 0.0, names: vec![] };
    //     return serde_wasm_bindgen::to_value(&empty).map_err(|e| JsValue::from_str(&format!("{e}")));
    // }
    for (category_i, item) in items.iter().enumerate() {
        if item.is_empty() {
            return Err(JsValue::from_str(&format!("category {category_i} is empty")));
        }
    }
    dbg!(items.len());

    let total_combinations: u128 = items.iter()
        .map(|slot_items| slot_items.len() as u128)
        .product();
    let target_updates = 50u128;
    let stride: u128 = (total_combinations / target_updates).clamp(100_000, 1_000_000);

    let mut combinations_done: u128 = 0;

    // Cartesian product
    let n = items.len();
    let mut idx = vec![0usize; n];
    let mut lowest_best_value = 0.0;
    // let mut best_idx = idx.clone();
    let mut heap: BinaryHeap<Reverse<BuildResult>> = BinaryHeap::new();

    // panoply counters reused across iterations, we reset only touched ones
    let pcount_len = pan.bonus.len();
    let mut pcount = vec![0u8; pcount_len];
    // let mut pcount: Box<[u8]> = vec![0u8; pcount_len].into_boxed_slice(); // slower performances

    let mut touched: Vec<usize> = Vec::with_capacity(8);
    // let mut touched: SmallVec<[usize; 4]> = SmallVec::new(); // slower performances


    loop {
        // let mut build_stats = Stats::default();
        let mut build_stats = pre_stats.clone();
        // let mut build_stats = pre_stats; // seems slower

        // reset only touched counters
        for &pid in &touched { pcount[pid] = 0; }
        touched.clear();

        for (ci, &ii) in idx.iter().enumerate() {
            let item = &items[ci][ii];

            build_stats += &item.stats;

            // log(format!("item.pan_sparse: {:?}", item.pan_sparse));

            // add sparse panoply counts
            for &(pid, c) in &item.pan_sparse {
                if pcount[pid] == 0 {
                    touched.push(pid);
                }
                pcount[pid] = pcount[pid].saturating_add(c);
            }
        }
        // log(format!("touched: {:?}", touched));

        // add panoply bonuses (array lookups only)
        let mut panoplies_bonus: usize = 0;

        for &pid in &touched {
            let count = pcount[pid] as usize;
            // log(format!("count pano items: {:?}", count));
            if count > 1 {
                let pano_stats = &pan.bonus[pid];
                // let idx = count.min(pano_stats.len()) - 1; // clamp
                build_stats += &pano_stats[count - 1];

                panoplies_bonus += count.saturating_sub(1);
            }
        }
        // log(format!("panoplies_bonus: {:?}", panoplies_bonus));

        if let Some(pid_momore) = pano_cire_momore_pid {
            if touched.contains(&pid_momore) {
                let count = *pcount.get(pid_momore).unwrap_or(&0);
                if count >= 2 {
                    match count {
                        2 => {
                            if build_stats.mp > 4.0 { build_stats.mp = 4.0; }
                            if build_stats.range > 4.0 { build_stats.range = 4.0; }
                            if build_stats.summon > 4.0 { build_stats.summon = 4.0; }
                        }
                        3 | 4 | 5 => {
                            if build_stats.mp > 3.0 { build_stats.mp = 3.0; }
                            if build_stats.range > 3.0 { build_stats.range = 3.0; }
                            if build_stats.summon > 3.0 { build_stats.summon = 3.0; }
                        }
                        6.. => {
                            if build_stats.mp > 2.0 { build_stats.mp = 2.0; }
                            if build_stats.range > 2.0 { build_stats.range = 2.0; }
                            if build_stats.summon > 2.0 { build_stats.summon = 2.0; }
                        }
                        _ => {}
                    }
                }
            }
        }
        // log(format!("build_stats: {:?}", build_stats));
        
        let mut skip_build = false;

        for (category_i, &item_i) in idx.iter().enumerate() {
            let item = &items[category_i][item_i];

            // log(format!("item.requirement: {:?}", item.requirement));

            if let Some(req) = &item.requirement {
                // if !req.is_satisfied(&mut build_stats, &weights, &min_adj, &max_adj, panoplies_bonus) {
                //     skip_build = true;
                //     break;
                // }
                match req {
                    Requirement::PanopliesBonusLessThan { value } => {
                        if panoplies_bonus >= *value {
                            skip_build = true;
                            break;
                        }
                    }
                    Requirement::ApLessThan { value } => {
                        if build_stats.ap >= *value {
                            build_stats.ap = *value - 1.0;
                        }
                    }
                    Requirement::MpLessThan { value } => {
                        if build_stats.mp >= *value {
                            build_stats.mp = *value - 1.0;
                        }
                    }
                    Requirement::ApLessThanAndMpLessThan { value, value_2 } => {
                        if build_stats.ap >= *value {
                            build_stats.ap = *value - 1.0;
                        }
                        if build_stats.mp >= *value_2 {
                            build_stats.mp = *value_2 - 1.0;
                        }
                    }
                    Requirement::ApLessThanOrMpLessThan { value, value_2 } => {
                        if build_stats.ap < *value
                            || build_stats.mp < *value_2
                            || max_stats.ap < *value
                            || max_stats.mp < *value_2
                        {
                            // if either one of the stat is already capped no need to do anything
                        } else if min_stats.ap >= *value && min_stats.mp >= *value_2 {
                            skip_build = true;
                            break;
                        } else if min_stats.ap >= *value {
                            build_stats.mp = *value_2 - 1.0;
                        } else if min_stats.mp >= *value_2 {
                            build_stats.ap = *value - 1.0;
                        } else if weights.ap > weights.mp {
                            build_stats.mp = *value_2 - 1.0;
                        } else {
                            build_stats.ap = *value - 1.0; // default to cap ap if equal weights
                        }
                    }
                }
            }
        }
        let build_value;
        if skip_build {
            build_value = 0.0;
        } else {
            build_value = build_stats.value(&weights, &min_stats, &max_stats);
            // build_value = build_stats.value(&weights, &min_adj, &max_adj);
        }

        if heap.len() < 100 || build_value > lowest_best_value {
            let ids_resp: Vec<String> = idx
                .iter()
                .enumerate()
                .map(|(ci, &ii)| items[ci][ii].id.clone())
                .collect();

            let build = BuildResult { value: build_value, ids: ids_resp };

            if heap.len() == 100 {
                heap.pop(); // drop the smallest
            }
            heap.push(Reverse(build));
            lowest_best_value = heap.peek().unwrap().0.value;
        }

        combinations_done += 1;
        if let Some(callback) = &progress_cb {
            if combinations_done % stride == 0 || combinations_done == total_combinations {
                // let progress = (combinations_done as f64) / (total_combinations as f64);
                // Ignore errors if the callback throws
                let _ = callback.call1(&JsValue::NULL, &JsValue::from_f64(combinations_done as f64));
            }
        }

        // increment mixed-radix counter
        let mut k = n as isize - 1;
        while k >= 0 {
            let kk = k as usize;
            idx[kk] += 1;
            if idx[kk] < items[kk].len() {
                break;
            }
            idx[kk] = 0;
            k -= 1;
        }
        if k < 0 {
            break;
        }
    }

    // let names: Vec<String> = best_idx
    //     .iter()
    //     .enumerate()
    //     .map(|(ci, &ii)| items[ci][ii].name.clone())
    //     .collect();

    let mut results: Vec<BuildResult> = heap.into_iter().map(|r| r.0).collect();
    results.sort_by(|a, b| b.value.partial_cmp(&a.value).unwrap());

    serde_wasm_bindgen::to_value(&results)
    .map_err(|e| JsValue::from_str(&format!("serialize: {e}")))

    // let res = BestResult { value: best_value, names };
    // serde_wasm_bindgen::to_value(&res)
    //     .map_err(|e| JsValue::from_str(&format!("serialize: {e}")))
}
