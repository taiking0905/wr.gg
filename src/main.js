const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { initializeDatabase } = require("./database");
const fetchPatchData = require("./fetchPatchData"); 

let mainWindow;

app.whenReady().then(async () => {
    await initializeDatabase(); // データベースの初期化

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"), // preload.js を指定
            contextIsolation: true, // セキュリティのため true に設定
            enableRemoteModule: false, // 不要なモジュールを無効化
        },
    });

    // 絶対パスで index.html をロード
    mainWindow.loadFile(path.join(__dirname, "index.html"));
});

// fetchPatchData を処理する IPC ハンドラーを設定
ipcMain.handle("fetchPatchData", async () => {
    try {
        const result = await fetchPatchData();
        console.log("fetchPatchData result:", result);
        return result;
    } catch (error) {
        console.error("fetchPatchData のエラー:", error);
        return { success: false, error: error.message };
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
