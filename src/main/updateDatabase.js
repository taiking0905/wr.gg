const axios = require("axios");
const cheerio = require("cheerio");

async function fetchAndUpdateData(db) {
    try {
        const url = "https://wildrift.leagueoflegends.com/ja-jp/news/tags/patch-notes/";

        // Webページを取得
        const { data } = await axios.get(url);

        // cheerioでHTMLを解析
        const $ = cheerio.load(data);

        // パッチノート情報を格納する配列
        const patchNotes = [];

        // 記事のリンク、タイトルを取得
        $("a[data-testid='articlefeaturedcard-component']").each((index, element) => {
            const patch_name = $(element).find("div[data-testid='card-title']").text().trim();
            const patch_link = "https://wildrift.leagueoflegends.com" + $(element).attr("href");

            patchNotes.push({
                patch_name,
                patch_link,
            });
        });

        const patchData = patchNotes.reverse();

        // スクレイピング結果を確認
        console.log("Patch note information obtained!", patchData);

        // チャンピオンデータの差分更新
        await updateChampionData(db);

        // パッチデータの差分更新
        await updatePatchData(db, patchData);

        // パッチ内容の差分更新
        await updatePatchContents(db, patchData);

        console.log("All data successfully fetched and updated.");
        return { success: true };
    } catch (error) {
        console.error("Data acquisition error:", error);
        return { success: false, error: error.message };
    }
}

async function updateChampionData(db) {
    const url = "https://wildrift.leagueoflegends.com/ja-jp/champions/";

    return new Promise((resolve, reject) => {
        axios.get(url)
            .then(async (response) => {
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

                // データベースに挿入（トランザクションを使用）
                db.serialize(() => {
                    db.run("BEGIN TRANSACTION");

                    const insertStmt = db.prepare(`INSERT OR IGNORE INTO Champions (champion_name) VALUES (?)`);
                    for (const name of championNames) {
                        insertStmt.run(name, (err) => {
                            if (err) {
                                console.error("Database Insert Error:", err);
                                db.run("ROLLBACK");
                                return reject(err);
                            }
                        });
                    }

                    insertStmt.finalize((err) => {
                        if (err) {
                            console.error("Error finalizing statement:", err);
                            db.run("ROLLBACK");
                            reject(err);
                        } else {
                            db.run("COMMIT");
                            console.log("Champion names have been inserted into the database.");
                            resolve();
                        }
                    });
                });
            })
            .catch((error) => {
                console.error("Error fetching the website:", error);
                reject(error);
            });
    });
}

async function updatePatchData(db, patchData) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION"); // トランザクションの開始

            const insertStmt = db.prepare(`
                INSERT OR IGNORE INTO Patches (patch_name, patch_link) VALUES (?, ?)
            `);

            patchData.forEach(patch => {
                const patchName = patch.patch_name; 
                const patchLink = patch.patch_link; 

                // データベースに挿入
                insertStmt.run(patchName, patchLink, (err) => {
                    if (err) {
                        console.error("Error inserting patch data:", err);
                        db.run("ROLLBACK"); // エラー時にロールバック
                        return reject(err);
                    }
                });
            });

            insertStmt.finalize((err) => {
                if (err) {
                    console.error("Error finalizing patch statement:", err);
                    db.run("ROLLBACK"); // エラー時にロールバック
                    reject(err);
                } else {
                    db.run("COMMIT", (err) => {
                        if (err) {
                            console.error("Error committing transaction:", err);
                            reject(err);
                        } else {
                            console.log("Patch data updated successfully.");
                            resolve();
                        }
                    });
                }
            });
        });
    });
}

async function updatePatchContents(db, patchData) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION"); // トランザクションの開始

            const insertStmt = db.prepare(`
                INSERT OR IGNORE INTO Champion_Changes 
                (champion_name, patch_name, ability_title, change_details) 
                VALUES (?, ?, ?, ?)
            `);

            const promises = patchData.map(patch => {
                const patchName = patch.patch_name;
                const patchLink = patch.patch_link;

                return axios.get(patchLink).then(response => {
                    const $ = cheerio.load(response.data);

                    const changesPromises = [];
                    $(".character-changes-container").each((i, elem) => {
                        const championName = $(elem).find(".character-name").text().trim();

                        $(elem)
                            .find(".character-change")
                            .each((j, change) => {
                                const abilityTitle = $(change).find(".character-ability-title").text().trim();
                                const changeDetails = $(change).find(".character-change-body").text().trim();

                                changesPromises.push(
                                    new Promise((resolve, reject) => {
                                        insertStmt.run(championName, patchName, abilityTitle, changeDetails, (err) => {
                                            if (err) {
                                                console.error("Error inserting patch content data:", err);
                                                reject(err);
                                            } else {
                                                resolve();
                                            }
                                        });
                                    })
                                );
                            });
                    });

                    return Promise.all(changesPromises);
                });
            });

            Promise.all(promises)
                .then(() => {
                    insertStmt.finalize((err) => {
                        if (err) {
                            console.error("Error finalizing patch content statement:", err);
                            db.run("ROLLBACK");
                            reject(err);
                        } else {
                            db.run("COMMIT", (err) => {
                                if (err) {
                                    console.error("Error committing transaction:", err);
                                    reject(err);
                                } else {
                                    console.log("Patch content data updated successfully.");
                                    resolve();
                                }
                            });
                        }
                    });
                })
                .catch(err => {
                    console.error("Error during patch content update:", err);
                    db.run("ROLLBACK");
                    reject(err);
                });
        });
    });
}

module.exports = fetchAndUpdateData;