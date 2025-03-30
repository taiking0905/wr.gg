function seedDatabase(db) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 初期データの挿入
            db.run(`INSERT OR IGNORE INTO Champions (champion_name) VALUES 
                ('Ahri'), 
                ('Akali'), 
                ('Ashe')`);

            db.run(`INSERT OR IGNORE INTO Patches (patch_name, patch_link) VALUES 
                ('Patch 1.0', 'https://example.com/patch1'),
                ('Patch 1.1', 'https://example.com/patch1.1')`, (err) => {
                if (err) {
                    console.error("初期データ挿入エラー:", err);
                    reject(err);
                } else {
                    console.log("初期データが挿入されました。");
                    resolve();
                }
            });
        });
    });
}

module.exports = { seedDatabase };