const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile("src/index.html");
});

// JSONを読み込んでURLを取得し、スクレイピングして保存
ipcMain.handle("fetchPatchData", async () => {
    try {
        // patch_note_test.json の読み込み
        const patchPath = path.join(__dirname, "patch_note_test.json");
        const patchData = JSON.parse(fs.readFileSync(patchPath, "utf-8"));
        const url = patchData[0].link;

        // Webページ取得
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // パッチタイトルを取得
        const patchTitle = $("h1").text().trim();

        // キャラクター変更部分の取得 (仮)
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

        // データを JSON にまとめる
        const resultData = {
            patch_name: patchTitle,
            character_changes: characterChanges,
        };

        // test_result.json に保存
        const resultPath = path.join(__dirname, "test_result.json");
        fs.writeFileSync(resultPath, JSON.stringify(resultData, null, 4), "utf-8");

        return { success: true };
    } catch (error) {
        console.error("データ取得エラー:", error);
        return { success: false, error: error.message };
    }
});
