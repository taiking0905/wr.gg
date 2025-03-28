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
                name TEXT UNIQUE NOT NULL
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS Patches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patch_name TEXT UNIQUE NOT NULL
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS Champion_Changes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                champion_id INTEGER NOT NULL,
                patch_id INTEGER NOT NULL,
                change_description TEXT,
                FOREIGN KEY (champion_id) REFERENCES Champions(id),
                FOREIGN KEY (patch_id) REFERENCES Patches(id)
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
