use wasm_bindgen::prelude::*;
use web_sys::console;
use serde::{Deserialize, Serialize};
use crate::stats::{Stats, MaxStats, MinStats};
pub mod stats;

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

fn log<T: AsRef<str>>(msg: T) {
    console::log_1(&msg.as_ref().into());
}

#[derive(Serialize, Deserialize, Clone)]
pub struct MinItem {
    pub name: String,
    pub stats: Stats,
    // pub category: String,
    #[serde(default)]
    pub panoplies: Vec<String>, // if empty, we assume vec![name]
}

#[derive(Clone, Debug)]
struct ItemPrepared {
    name: String,
    stats: Stats,
    // sparse contributions: (pid, how many set pieces this item brings for that panoply)
    pan_sparse: Vec<(usize, u8)>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct PanoplyIn {
    pub name: String,
    pub items: Vec<String>,
    pub stats: Vec<Stats>, // stats[count-1] = TOTAL bonus for 'count' items (1-based)
}
use std::collections::HashMap;
#[derive(Clone)]
struct PanData {
    // per pid: bonus[count-1] = Stats (clamped in use if count > len)
    bonus: Vec<Vec<Stats>>,
    // mapping from item name -> panoply id
    item_to_pid: HashMap<String, usize>,
}

fn build_pan_data(pans: &[PanoplyIn]) -> PanData {
    let mut item_to_pid = HashMap::new();
    let mut bonus = Vec::with_capacity(pans.len());

    for (pid, p) in pans.iter().enumerate() {
        // map every item name in this panoply
        for it in &p.items {
            item_to_pid.insert(it.clone(), pid);
        }
        // store total-bonus table as-is
        bonus.push(p.stats.clone());
    }

    PanData { bonus, item_to_pid }
}

fn prepare_items(
    cats_in: Vec<Vec<MinItem>>,
    pan: &PanData,
) -> Vec<Vec<ItemPrepared>> {
    cats_in
        .into_iter()
        .map(|cat| {
            cat.into_iter()
                .map(|mi| {
                    let members = if mi.panoplies.is_empty() {
                        std::slice::from_ref(&mi.name).iter().cloned().collect()
                    } else {
                        mi.panoplies
                    };

                    // accumulate counts per pid only for pids present in members
                    let mut local: HashMap<usize, u8> = HashMap::new();
                    for name in members {
                        if let Some(&pid) = pan.item_to_pid.get(&name) {
                            *local.entry(pid).or_insert(0) += 1;
                        }
                    }
                    let mut pan_sparse: Vec<(usize, u8)> = local.into_iter().collect();
                    // keep small and cache-friendly:
                    pan_sparse.sort_unstable_by_key(|&(pid, _)| pid);

                    ItemPrepared {
                        name: mi.name,
                        stats: mi.stats,
                        pan_sparse,
                    }
                })
                .collect()
        })
        .collect()
}

#[derive(Serialize, Deserialize)]
pub struct BestResult {
    pub score: f64,
    pub names: Vec<String>, // one per category, same order as input
}

#[wasm_bindgen]
    pub fn best_combo(
    items_category_js: JsValue,
    weights_js: JsValue,
    min_js: JsValue,
    max_js: JsValue,
    pre_stats_js: JsValue,
    panoplies_js: JsValue,
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
    // log(format!("weights: {:?}", weights));

    // Expect Vec<Vec<MinItem>>: items_category[i] = list of items in that category
    // let categories: Vec<Vec<MinItem>> = serde_wasm_bindgen::from_value(items_category_js)
    //     .map_err(|e| JsValue::from_str(&format!("deserialize: {e}")))?;

    // Precompute panoply data & annotate items
    let pan = build_pan_data(&pans_in);
    let items = prepare_items(items_category, &pan);

    if items.is_empty() {
        let empty = BestResult { score: 0.0, names: vec![] };
        return serde_wasm_bindgen::to_value(&empty).map_err(|e| JsValue::from_str(&format!("{e}")));
    }
    for (category_i, item) in items.iter().enumerate() {
        if item.is_empty() {
            return Err(JsValue::from_str(&format!("category {category_i} is empty")));
        }
    }
    dbg!(items.len());

    // Cartesian product
    let n = items.len();
    let mut idx = vec![0usize; n];
    let mut best_score = 0.0;
    let mut best_idx = idx.clone();

    // panoply counters reused across iterations, we reset only touched ones
    let pcount_len = pan.bonus.len();
    let mut pcount = vec![0u8; pcount_len];
    let mut touched: Vec<usize> = Vec::with_capacity(8); // typically small

    loop {
        let mut build_stats = pre_stats.clone();

        // clear touched marker list
        touched.clear();

        for (ci, &ii) in idx.iter().enumerate() {
            let item = &items[ci][ii];

            build_stats += &item.stats;

            // add sparse panoply counts
            for &(pid, c) in &item.pan_sparse {
                if pcount[pid] == 0 {
                    touched.push(pid);
                }
                pcount[pid] = pcount[pid].saturating_add(c);
            }
        }

        // add panoply bonuses (array lookups only)
        for &pid in &touched {
            let cnt = pcount[pid] as usize;
            if cnt > 0 {
                let pano_stats = &pan.bonus[pid];
                let idx = cnt.min(pano_stats.len()) - 1; // clamp
                build_stats += &pano_stats[idx];
            }
        }

        let build_value = build_stats.value(&weights, &min_stats, &max_stats);

        if build_value > best_score {
            best_score = build_value;
            best_idx.clone_from(&idx);
        }

        // reset only touched counters
        for &pid in &touched { pcount[pid] = 0; }

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

    let names: Vec<String> = best_idx
        .iter()
        .enumerate()
        .map(|(ci, &ii)| items[ci][ii].name.clone())
        .collect();

    let res = BestResult { score: best_score, names };
    serde_wasm_bindgen::to_value(&res)
        .map_err(|e| JsValue::from_str(&format!("serialize: {e}")))
}
