const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { json } = require("stream/consumers");
const path = require("path");

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

                // JSON ファイルに保存
                const championsJson = { champions: championNames };
                fs.writeFileSync('champions.json', JSON.stringify(championsJson, null, 4), 'utf-8');
                console.log("Champion names have been saved to champions.json");

                // データベースに挿入
                db.serialize(() => {
                    const insertStmt = db.prepare(`INSERT OR IGNORE INTO Champions (champion_name) VALUES (?)`);
                    championNames.forEach(name => {
                        insertStmt.run(name, (err) => {
                            if (err) {
                                console.error("データベース挿入エラー:", err);
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

function seedChampionChangesData(db) {
    // JSON ファイルを読み込む
    const patchData = require('./test_result.json'); 

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const insertStmt = db.prepare(`
                INSERT OR IGNORE INTO Champion_Changes 
                (champion_name, patch_name, ability_title, change_details) 
                VALUES (?, ?, ?, ?)
            `);

            // JSON データをループして挿入
            const patchName = patchData.patch_name; // パッチ名
            patchData.character_changes.forEach(character => {
                const championName = character.name; // チャンピオン名

                character.changes.forEach(change => {
                    const abilityTitle = change.ability_title; // アビリティ名
                    const changeDetails = change.change_details; // 変更内容

                    insertStmt.run(championName, patchName, abilityTitle, changeDetails, (err) => {
                        if (err) {
                            console.error("Error inserting champion changes data:", err);
                            reject(err);
                        }
                    });
                });
            });

            insertStmt.finalize((err) => {
                if (err) {
                    console.error("Error finalizing statement:", err);
                    reject(err);
                } else {
                    console.log("Champion changes data inserted successfully from test_result.json.");
                    resolve();
                }
            });
        });
    });
}

module.exports = { seedChampionChangesData };

module.exports = { seedChampionData, seedPatchData, seedChampionChangesData };



