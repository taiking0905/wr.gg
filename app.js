const sqlite3 = require('sqlite3').verbose();

// SQLite データベースファイルのパスを指定
const db = new sqlite3.Database('C:\\Users\\T122115\\Desktop\\WR.GG\\new_database.sqlite', (err) => {
    if (err) {
        console.error('Database opening error: ', err);
    } else {
        console.log('Database connected successfully!');
    }
});

// テーブルのデータを取得して表示する例
db.serialize(() => {
    db.each('SELECT * FROM table_name', (err, row) => {
        if (err) {
            console.error('Query error: ', err);
        } else {
            console.log('Row data: ', row);
        }
    });
});

// データベースを閉じる
db.close((err) => {
    if (err) {
        console.error('Closing error: ', err);
    } else {
        console.log('Database closed successfully!');
    }
});