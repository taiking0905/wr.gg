
document.getElementById("fetchDataButton").addEventListener("click", async () => {
    try {
        const result = await window.electron.invoke("fetchPatchData");
        console.log("fetchPatchData の結果:", result);

        if (result.success) {
            document.getElementById("status").innerText = "保存できました！";
        } else {
            document.getElementById("status").innerText = "エラー: " + result.error;
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
        document.getElementById("status").innerText = "エラー: " + error.message;
    }
});
