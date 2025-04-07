const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const { seedChampionData, seedPatchData, seedChampionChangesData } = require('./seedData');

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        const dbPath = './database.sqlite';

        // データベースファイルが存在するか確認
        const dbExists = fs.existsSync(dbPath);

        // データベース接続
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            console.log('Connected to the SQLite database.');
        });

        // テーブル作成
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS Champions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                champion_name TEXT UNIQUE NOT NULL,
                new_flag boolean DEFAULT 1
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS Patches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patch_name TEXT UNIQUE NOT NULL,
                patch_link TEXT NOT NULL,
                new_flag boolean DEFAULT 1
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS Champion_Changes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                champion_name TEXT NOT NULL,
                patch_name TEXT NOT NULL,
                ability_title TEXT NOT NULL,
                change_details TEXT NOT NULL,
                FOREIGN KEY (champion_name) REFERENCES Champions(champion_name),
                FOREIGN KEY (patch_name) REFERENCES Patches(patch_name),
                UNIQUE(champion_name, patch_name, ability_title, change_details) 
            )`);
        });

        // 初期データの挿入（データベースが存在しない場合のみ）
        if (!dbExists) {
            console.log("Database does not exist. Inserting initial data...");
            Promise.all([
                seedChampionData(db),
                seedPatchData(db),
                seedChampionChangesData(db)
            ])
                .then(() => {
                    console.log("Initial data inserted successfully.");
                    resolve(db); // データベース接続を返す
                })
                .catch((err) => {
                    console.error("Error during initial data insertion:", err);
                    reject(err);
                });
        } else {
            console.log("Database already exists. Skipping initial data insertion.");
            resolve(db); // データベース接続を返す
        }
    });
}

module.exports = { initializeDatabase };
