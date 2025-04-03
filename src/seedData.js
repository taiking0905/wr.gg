const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

function seedChampionData(db) {
    const url = "https://wildrift.leagueoflegends.com/ja-jp/champions/";

    return new Promise((resolve, reject) => {
        // スクレイピングして JSON ファイルを作成
        axios.get(url)
            .then(response => {
                const $ = cheerio.load(response.data);

                // チャンピオン名を抽出
                const championElements = $('a.sc-985df63-0.cGQgsO.sc-d043b2-0.bZMlAb');
                const championNames = [];
                championElements.each((index, element) => {
                    const name = $(element).find('div.sc-ce9b75fd-0.lmZfRs').text();
                    if (name) {
                        championNames.push(name);
                    }
                });

                // データベースに挿入
                db.serialize(() => {
                    const insertStmt = db.prepare(`INSERT OR IGNORE INTO Champions (champion_name) VALUES (?)`);
                    championNames.forEach(name => {
                        insertStmt.run(name, (err) => {
                            if (err) {
                                console.error("Database Insert Error:", err);
                                reject(err);
                            }
                        });
                    });
                    insertStmt.finalize();

                    console.log("Champion names have been inserted into the database.");
                    resolve();
                });
            })
            .catch(error => {
                console.error("Error fetching the website:", error);
                reject(error);
            });
    });
}

function seedPatchData(db) {

    // patch_note.json を読み込む
    const patchData = require('./patch_notes.json'); // JSON ファイルを読み込む

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const insertStmt = db.prepare(`INSERT OR IGNORE INTO Patches (patch_name, patch_link) VALUES (?, ?)`);

            // JSON データをループして挿入
            patchData.forEach(patch => {
                insertStmt.run(patch.patch_name, patch.patch_link, (err) => {
                    if (err) {
                        console.error("Error inserting patch data:", err);
                        reject(err);
                    }
                });
            });

            insertStmt.finalize((err) => {
                if (err) {
                    console.error("Error finalizing statement:", err);
                    reject(err);
                } else {
                    console.log("Patch data inserted successfully from patch_note.json.");
                    resolve();
                }
            });
        });
    });
}

async function seedChampionChangesData(db) {
    // patch_notes.json の読み込み
    const patchData = require('./patch_notes.json'); 

    return new Promise(async (resolve, reject) => {
        db.serialize(async () => {
            const insertStmt = db.prepare(`
                INSERT OR IGNORE INTO Champion_Changes 
                (champion_name, patch_name, ability_title, change_details) 
                VALUES (?, ?, ?, ?)
            `);

            try {
                db.run("BEGIN TRANSACTION"); // トランザクションの開始

                for (const patch of patchData) {
                    const patchName = patch.patch_name; // パッチ名
                    const patchLink = patch.patch_link; // パッチリンク

                    console.log(`Fetching data for: Patch_Name:${patchName.slice(-4)}`);


                    // Webページ取得
                    const response = await axios.get(patchLink);
                    const $ = cheerio.load(response.data);

                    // キャラクター変更部分の取得
                    $(".character-changes-container").each((i, elem) => {
                        const championName = $(elem).find(".character-name").text().trim();
                        let changes = [];

                        $(elem)
                            .find(".character-change")
                            .each((j, change) => {
                                const abilityTitle = $(change).find(".character-ability-title").text().trim();
                                const changeDetails = $(change).find(".character-change-body").text().trim();
                                changes.push({ ability_title: abilityTitle, change_details: changeDetails });
                            });

                        // データベースに挿入
                        changes.forEach(change => {
                            const abilityTitle = change.ability_title;
                            const changeDetails = change.change_details;

                            insertStmt.run(championName, patchName, abilityTitle, changeDetails, (err) => {
                                if (err) {
                                    console.error("Error inserting data:", err);
                                    reject(err);
                                }
                            });
                        });
                    });
                }

                db.run("COMMIT", (err) => {
                    if (err) {
                        console.error("Error committing transaction:", err);
                        reject(err);
                    } else {
                        console.log("Champion changes data inserted successfully.");
                        resolve();
                    }
                });

                insertStmt.finalize();
            } catch (error) {
                db.run("ROLLBACK", () => {
                    console.error("Transaction rolled back due to error:", error);
                    reject(error);
                });
            }
        });
    });
}

module.exports = { seedChampionData, seedPatchData, seedChampionChangesData };



