use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct MinItem {
    pub name: String,
    pub value: f64,
}

#[derive(Serialize, Deserialize)]
pub struct BestResult {
    pub score: f64,
    pub names: Vec<String>, // one per category, same order as input
}

#[wasm_bindgen]
pub fn best_combo(categories_js: JsValue) -> Result<JsValue, JsValue> {
    // Expect Vec<Vec<MinItem>>: categories[i] = list of items in that category
    let categories: Vec<Vec<MinItem>> = serde_wasm_bindgen::from_value(categories_js)
        .map_err(|e| JsValue::from_str(&format!("deserialize: {e}")))?;

    if categories.is_empty() {
        let empty = BestResult { score: 0.0, names: vec![] };
        return serde_wasm_bindgen::to_value(&empty).map_err(|e| JsValue::from_str(&format!("{e}")));
    }
    for (i, cat) in categories.iter().enumerate() {
        if cat.is_empty() {
            return Err(JsValue::from_str(&format!("category {i} is empty")));
        }
    }
    let val = dbg!(categories.len());

    // Cartesian product over categories (brute force)
    let n = categories.len();
    let mut idx = vec![0usize; n];
    let mut best_score = f64::NEG_INFINITY;
    let mut best_idx = idx.clone();

    loop {
        // score current combination
        let mut s = 0.0;
        for (ci, &ii) in idx.iter().enumerate() {
            s += categories[ci][ii].value;
        }
        if s > best_score {
            best_score = s;
            best_idx.clone_from(&idx);
        }

        // increment mixed-radix counter
        let mut k = n as isize - 1;
        while k >= 0 {
            let kk = k as usize;
            idx[kk] += 1;
            if idx[kk] < categories[kk].len() {
                break; // carry resolved
            }
            idx[kk] = 0;
            k -= 1;
        }
        if k < 0 {
            break; // overflowed past the first category -> done
        }
    }

    let names: Vec<String> = best_idx
        .iter()
        .enumerate()
        .map(|(ci, &ii)| categories[ci][ii].name.clone())
        .collect();

    let res = BestResult { score: best_score, names };
    serde_wasm_bindgen::to_value(&res).map_err(|e| JsValue::from_str(&format!("serialize: {e}")))
}
