const sqlite3 = require('sqlite3').verbose();
const { seedDatabase } = require('./seedData'); 

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

        // テーブル作成と初期データ挿入
        db.serialize(() => {
            // テーブル作成
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
            )`);
        });

        // 初期データの挿入
        seedDatabase(db)
            .then(() => {
                console.log("Database initialized successfully.");
                db.close((err) => {
                    if (err) {
                        console.error(err.message);
                    }
                    console.log('Database connection closed.');
                    resolve();
                });
            })
            .catch((err) => {
                console.error("Error during initial data insertion:.", err);
                db.close();
                reject(err);
            });
    });
}

module.exports = { initializeDatabase };
