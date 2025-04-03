const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

async function fetchPatchData() {
    try {
        // patch_note_test.json の読み込み
        const patchPath = path.join(__dirname, "patch_notes.json");
        const patchData = JSON.parse(fs.readFileSync(patchPath, "utf-8"));

        // 結果を格納する配列
        let allResults = [];

        // 各パッチデータをループ処理
        for (const patch of patchData) {
            const patchName = patch.patch_name; // パッチ名
            const patchLink = patch.patch_link; // パッチリンク

            console.log(`Fetching data for: ${patchName} (${patchLink})`);

            // Webページ取得
            const response = await axios.get(patchLink);
            const $ = cheerio.load(response.data);

            // キャラクター変更部分の取得
            let characterChanges = [];
            $(".character-changes-container").each((i, elem) => {
                const characterName = $(elem).find(".character-name").text().trim();
                let changes = [];

                $(elem)
                    .find(".character-change")
                    .each((j, change) => {
                        const abilityTitle = $(change).find(".character-ability-title").text().trim();
                        const changeDetails = $(change).find(".character-change-body").text().trim();
                        changes.push({ ability_title: abilityTitle, change_details: changeDetails });
                    });

                characterChanges.push({ name: characterName, changes });
            });

            // データを JSON にまとめる（patch_link を含めない）
            const resultData = {
                patch_name: patchName,
                character_changes: characterChanges,
            };

            // 結果を配列に追加
            allResults.push(resultData);
        }

        // すべての結果を test_result.json に保存
        const resultPath = path.join(__dirname, "test_result.json");
        fs.writeFileSync(resultPath, JSON.stringify(allResults, null, 4), "utf-8");

        console.log("Data successfully fetched and saved to test_result.json");
        return { success: true };
    } catch (error) {
        console.error("データ取得エラー:", error);
        return { success: false, error: error.message };
    }
}

module.exports = fetchPatchData;