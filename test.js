const fs = require("fs");

// 既存のJSONファイルを読み込む
const patchNotes = JSON.parse(fs.readFileSync("patch_notes.json", "utf-8"));

// 配列の順番を反転
const reversedPatchNotes = patchNotes.reverse();

// 反転したデータをJSONとして保存
fs.writeFileSync("reversed_patch_notes.json", JSON.stringify(reversedPatchNotes, null, 4), "utf-8");

console.log("JSONの向きを変更しました！");
