const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { initializeDatabase } = require("./database");
const fetchPatchData = require("./fetchPatchData");
const updateDatabase = require("./updateDatabase");
let mainWindow;
let db; // データベース接続を保持


app.whenReady().then(async () => {
    try {
        db = await initializeDatabase(); // データベースの初期化

        await updateDatabase(db); // データベースを更新


        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, "../preload/preload.js"), // preload.js を指定
                contextIsolation: true, // セキュリティのため true に設定
                enableRemoteModule: false, // 不要なモジュールを無効化
            },
        });

        // 絶対パスで index.html をロード
        mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
    } catch (error) {
        console.error("Error during app initialization:", error);
    }
});

// fetchPatchData を処理する IPC ハンドラーを設定
ipcMain.handle("fetchPatchData", async () => {
    try {
        const result = await fetchPatchData(db); // データベース接続を渡す
        console.log("fetchPatchData result:", result);
        return result;
    } catch (error) {
        console.error("fetchPatchData のエラー:", error);
        return { success: false, error: error.message };
    }
});

// アプリケーション終了時にデータベース接続を閉じる
app.on("window-all-closed", () => {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error("Error closing database:", err);
            } else {
                console.log("Database connection closed.");
            }
        });
    }

    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("web-contents-created", (event, contents) => {
    contents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                "Content-Security-Policy": ["default-src 'self'; script-src 'self' 'unsafe-inline'"],
            },
        });
    });
});
