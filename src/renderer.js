const { ipcRenderer } = require("electron");

document.getElementById("fetchDataButton").addEventListener("click", async () => {
    const result = await ipcRenderer.invoke("fetchPatchData");

    if (result.success) {
        document.getElementById("status").innerText = "保存できました！";
    } else {
        document.getElementById("status").innerText = "エラー: " + result.error;
    }
});
