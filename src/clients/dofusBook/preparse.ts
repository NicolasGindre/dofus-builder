import { readFile, writeFile } from "fs/promises";

async function main() {
    const harText = await readFile("./har/items.har", "utf8");
    const har = JSON.parse(harText);

    // ✅ Keys we keep from each item
    const allowedKeys = [
        "id",
        "official",
        "level",
        // "legendary",
        "category_id",
        "name",
        "category_name",
        "category_type",
        // "slug",
        // "weapon",
    ];

    const allItems: any[] = [];

    for (const entry of har.log.entries) {
        const mime = entry.response?.content?.mimeType || "";
        const text = entry.response?.content?.text;
        if (!mime.includes("json") || !text) continue;

        try {
            const obj = JSON.parse(text);
            if (Array.isArray(obj.data)) {
                const filtered = obj.data.map((item: { [x: string]: any }) => {
                    const out: any = {};
                    for (const key of allowedKeys) {
                        if (key in item) out[key] = item[key];
                    }
                    return out;
                });
                allItems.push(...filtered);
            }
        } catch {
            console.warn("⚠️ Failed to parse one entry:", entry.request?.url);
        }
    }

    console.log(`✅ Total items merged: ${allItems.length}`);

    const output = { data: allItems };
    await writeFile("./merged_items.json", JSON.stringify(output, null, 2));

    console.log("💾 Saved to merged_items.json (filtered fields only)");
}

main().catch(console.error);
