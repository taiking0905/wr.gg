import React, { useEffect, useState } from "react";

interface PatchContent {
  champion_name: string;
  patch_name: string;
  ability_title: string;
  change_details: string;
}

export const ChampionList: React.FC = () => {
  const [champions, setChampions] = useState<string[]>([]);
  const [patchContents, setPatchContents] = useState<PatchContent[]>([]);
  const [selectedChampion, setSelectedChampion] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const champsRes = await fetch("/wr.gg/data/champions.json");
        if (!champsRes.ok) throw new Error("champions.json not found");
        const championData = await champsRes.json();

        const contentsRes = await fetch("/wr.gg/data/patch_contents.json");
        if (!contentsRes.ok) throw new Error("patch_contents.json not found");

        const patchContentData: PatchContent[] = await contentsRes.json();
        // パッチノートを逆順に（例: 新しい順）
        const Re_patchNotes = patchContentData.reverse();

        setChampions(championData);  // ← 文字列配列そのまま使う
        setPatchContents(Re_patchNotes);
      } catch (error) {
        console.error("データの読み込みに失敗しました:", error);
      }
    };
    fetchData();
  }, []);

  const handleSelectChampion = (championName: string) => {
    setSelectedChampion(championName);
  };

  const filteredChanges: PatchContent[] = selectedChampion
    ? patchContents.filter((c) => c.champion_name === selectedChampion)
    : [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">チャンピオンごとの変更履歴</h1>

      <div className="mb-4">
        <label htmlFor="champion-select" className="block text-sm font-medium text-gray-700 mb-1">
          チャンピオンを選択:
        </label>
        <select
          id="champion-select"
          onChange={(e) => handleSelectChampion(e.target.value)}
          value={selectedChampion ?? ""}
          className="border rounded px-3 py-2 w-full max-w-sm"
        >
          <option value="">-- チャンピオンを選択してください --</option>
          {champions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {selectedChampion && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">{selectedChampion} の変更履歴</h2>
          {filteredChanges.length > 0 ? (
            <ul className="space-y-4">
              {filteredChanges.map((change, idx) => (
                <li key={idx} className="border p-3 rounded bg-gray-50">
                  <p className="text-sm text-gray-500">{change.patch_name}</p>
                  <p className="font-bold text-lg">{change.ability_title}</p>
                  <p className="text-gray-800 mt-1 whitespace-pre-line">{change.change_details}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">このチャンピオンには変更履歴がありません。</p>
          )}
        </div>
      )}
    </div>
  );
};
