const sqlite3 = require('sqlite3').verbose();

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // データベース接続
        let db = new sqlite3.Database('./database.sqlite', (err) => {
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
                champion_name TEXT UNIQUE NOT NULL
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS Patches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patch_name TEXT UNIQUE NOT NULL,
                patch_link TEXT NOT NULL
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS Champion_Changes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                champion_name TEXT NOT NULL,
                patch_name TEXT NOT NULL,
                change_description TEXT,
                FOREIGN KEY (champion_name) REFERENCES Champions(champion_name),
                FOREIGN KEY (patch_name) REFERENCES Patches(patch_name)
            )`, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Tables created or verified successfully.');
                    resolve();
                }
            });
        });

        // データベースを閉じる
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Database connection closed.');
        });
    });
}

module.exports = { initializeDatabase };
