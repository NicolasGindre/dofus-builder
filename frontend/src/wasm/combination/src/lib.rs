// src/lib.rs
mod stats;
#[cfg(feature = "cpu")]
mod cpu;
#[cfg(feature = "gpu")]
mod gpu;
mod prepare;

use wasm_bindgen::prelude::*;
use js_sys::Function;
// use web_sys::js_sys::Function;

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

/// CPU version – keep your existing implementation in `cpu::best_combo_cpu`
#[cfg(feature = "cpu")]
#[wasm_bindgen]
pub fn best_combo_cpu(
    items_category_js: JsValue,
    weights_js: JsValue,
    min_js: JsValue,
    max_js: JsValue,
    pre_stats_js: JsValue,
    panoplies_js: JsValue,
    min_pano_bonus: usize,
    progress_cb: Option<Function>,
) -> Result<JsValue, JsValue> {
    cpu::best_combo_cpu_impl(
        items_category_js,
        weights_js,
        min_js,
        max_js,
        pre_stats_js,
        panoplies_js,
        min_pano_bonus,
        progress_cb,
    )
}

/// GPU version – async, same parameters, same return type.
#[cfg(feature = "gpu")]
#[wasm_bindgen]
pub async fn best_combo_gpu(
    items_category_js: JsValue,
    weights_js: JsValue,
    min_js: JsValue,
    max_js: JsValue,
    pre_stats_js: JsValue,
    panoplies_js: JsValue,
    min_pano_bonus: u32,
    progress_cb: Option<Function>,
) -> Result<JsValue, JsValue> {
    crate::gpu::best_combo_gpu_impl(
        items_category_js,
        weights_js,
        min_js,
        max_js,
        pre_stats_js,
        panoplies_js,
        min_pano_bonus,
        progress_cb,
    )
    .await
}