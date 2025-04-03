const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

// コマンドライン引数をチェックして、resetオプションがあれば実行
if (process.argv.includes('--reset')) {
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log("Database deleted.");
    } else {
        console.log("Database does not exist.");
    }
}