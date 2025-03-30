const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

function seedDatabase(db) {
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

                    console.log("チャンピオンデータがデータベースに挿入されました。");
                    resolve();
                });
            })
            .catch(error => {
                console.error("Error fetching the website:", error);
                reject(error);
            });
    });
}

module.exports = { seedDatabase };



