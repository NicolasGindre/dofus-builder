use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
// use std::cmp::Reverse;
use std::collections::HashMap;

// use crate::stats::{MaxStats, MinStats, Stats};
use crate::stats::Stats;

/// Minimal item description as received from JS.
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

/// Internal prepared item, with panoply info resolved to numeric ids.
#[derive(Clone, Debug)]
pub struct ItemPrepared {
    pub id: String,
    pub stats: Stats,
    /// sparse contributions: (pid, how many set pieces this item brings for that panoply)
    pub pan_sparse: Vec<(usize, u8)>,
    pub requirement: Option<Requirement>,
}

/// Requirements attached to an item.
///
/// NOTE: all numeric fields are f32 now.
#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Requirement {
    PanopliesBonusLessThan { value: usize },
    ApLessThan { value: f32 },
    MpLessThan { value: f32 },
    ApLessThanOrMpLessThan {
        #[serde(rename = "value")]
        value: f32,
        #[serde(rename = "value2")]
        value_2: f32,
    },
    ApLessThanAndMpLessThan {
        #[serde(rename = "value")]
        value: f32,
        #[serde(rename = "value2")]
        value_2: f32,
    },
}

/// Optional helper: adjust requirement thresholds based on pre-stats.
/// (Not currently used in your main loop, but kept here for completeness.)
// #[inline(never)]
// pub fn adjust_requirement_for_pre_stats(req: &mut Requirement, pre: &Stats) {
//     match req {
//         Requirement::PanopliesBonusLessThan { .. } => {
//             // nothing to adjust
//         }
//         Requirement::ApLessThan { value } => {
//             *value -= pre.ap;
//         }
//         Requirement::MpLessThan { value } => {
//             *value -= pre.mp;
//         }
//         Requirement::ApLessThanOrMpLessThan { value, value_2 } => {
//             *value -= pre.ap;
//             *value_2 -= pre.mp;
//         }
//         Requirement::ApLessThanAndMpLessThan { value, value_2 } => {
//             *value -= pre.ap;
//             *value_2 -= pre.mp;
//         }
//     }
// }

/// Panoply input from JS.
#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PanoplyIn {
    pub id: String,
    pub items: Vec<String>,
    /// stats[count-1] = TOTAL bonus for 'count' items (1-based)
    #[serde(rename = "statsWithBonus")]
    pub stats: Vec<Stats>,
}

/// Resolved panoply data used by the solver.
#[derive(Clone, Debug)]
pub struct PanData {
    /// per pid: bonus[count-1] = Stats (clamped in use if count > len)
    pub bonus: Vec<Vec<Stats>>,
    /// mapping from panoply string id -> panoply numeric id
    pub panoply_to_pid: HashMap<String, usize>,
}

/// Result of a build (for the top-500 heap, etc.).
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BuildResult {
    pub value: f32,
    pub ids: Vec<String>,
}

impl Eq for BuildResult {}

impl PartialEq for BuildResult {
    fn eq(&self, other: &Self) -> bool {
        self.value == other.value
    }
}

impl Ord for BuildResult {
    fn cmp(&self, other: &Self) -> Ordering {
        // NOTE: unwrap() is fine here because value is a finite f32 in practice.
        self.value.partial_cmp(&other.value).unwrap()
    }
}

impl PartialOrd for BuildResult {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        self.value.partial_cmp(&other.value)
    }
}

/// Build panoply lookup tables from the JS input.
#[inline(never)]
pub fn build_pan_data(all_panoplies: &[PanoplyIn]) -> PanData {
    let mut panoply_to_pid = HashMap::new();
    let mut bonus_tables = Vec::with_capacity(all_panoplies.len());

    for (panoply_id, pan) in all_panoplies.iter().enumerate() {
        panoply_to_pid.insert(pan.id.clone(), panoply_id);
        // Assuming already cumulative per count
        bonus_tables.push(pan.stats.clone());
    }

    PanData {
        bonus: bonus_tables,
        panoply_to_pid,
    }
}

/// Prepare items:
/// - resolve panoply string ids to numeric ids
/// - compute per-item sparse panoply contributions
#[inline(never)]
pub fn prepare_items(
    categories_in: Vec<Vec<MinItem>>,
    panoply_data: &PanData,
) -> Vec<Vec<ItemPrepared>> {
    categories_in
        .into_iter()
        .map(|category_items| {
            category_items
                .into_iter()
                .map(|min_item| {
                    // Count how many pieces this item contributes for each panoply it declares.
                    // If the item has no panoplies, this stays empty (as intended).
                    let mut per_panoply_counts: HashMap<usize, u8> = HashMap::new();

                    for panoply_id_string in &min_item.panoplies {
                        if let Some(&panoply_id) =
                            panoply_data.panoply_to_pid.get(panoply_id_string)
                        {
                            *per_panoply_counts.entry(panoply_id).or_insert(0) += 1;
                        }
                        // Unknown panoply string ids are ignored silently.
                    }

                    // Convert to a small, cache-friendly sorted vector.
                    let mut pan_sparse: Vec<(usize, u8)> =
                        per_panoply_counts.into_iter().collect();
                    pan_sparse
                        .sort_unstable_by_key(|&(panoply_id, _)| panoply_id);

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
