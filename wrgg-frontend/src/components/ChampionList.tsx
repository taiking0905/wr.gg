import React, { useEffect, useState } from "react";

interface PatchContent {
  champion_name: string;
  patch_name: string;
  ability_title: string;
  change_details: string;
}
interface Champion {
  id: string;
  name_ja: string;
  kana: string;
}

export const ChampionList: React.FC = () => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [patchContents, setPatchContents] = useState<PatchContent[]>([]);
  const [selectedChampion, setSelectedChampion] = useState<string | null>(null);
  const selectedChampionObj = champions.find((champ) => champ.id === selectedChampion);
  const [searchQuery, setSearchQuery] = useState<string>("");



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

  // 検索クエリに基づいてチャンピオンをフィルタリング
  const filteredChampions = champions.filter((champ) => {
    const query = searchQuery.toLowerCase();
    return (
      champ.name_ja.toLowerCase().includes(query) ||
      champ.kana.toLowerCase().includes(query) ||
      champ.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">チャンピオンごとの変更履歴</h1>

      {/* 検索欄 */}
      <div className="mb-4">
        <label
          htmlFor="champion-search"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          チャンピオンを検索:
        </label>
        <input
          type="text"
          id="champion-search"
          placeholder="チャンピオン名で検索（ひらがな・英語可）"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded w-full max-w-md mb-4"
        />
      </div>

      {/* 一覧表示 */}
      {!selectedChampion && (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4">
          {filteredChampions.map((champ) => (
            <div
              key={champ.id}
              onClick={() => handleSelectChampion(champ.id)}
              className="cursor-pointer text-center hover:bg-gray-100 rounded p-2"
            >
              <img
                src={`/wr.gg/data/champion_images/${champ.id}.png`}
                alt={champ.name_ja}
                className="w-28 h-28 mx-auto mb-2"
              />
              <p className="text-sm">{champ.name_ja}</p>
            </div>
          ))}
          {filteredChampions.length === 0 && (
            <p className="text-gray-500 col-span-full">該当するチャンピオンが見つかりません。</p>
          )}
        </div>
      )}

      {/* 詳細表示 */}
      {selectedChampion && selectedChampionObj && (
        <div className="mt-6">
          <button
            onClick={() => setSelectedChampion(null)}
            className="mb-4 text-blue-500 hover:underline"
          >
            ← 戻る
          </button>
          <h2 className="text-xl font-semibold mb-2">
            {selectedChampionObj.name_ja} の変更履歴
          </h2>
          <img
            src={`/wr.gg/data/champion_images/${selectedChampionObj.id}.png`}
            alt={selectedChampionObj.name_ja}
            className="w-24 h-24 mb-4"
          />
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
            <div>
              <p className="text-gray-600">
                このチャンピオンには変更履歴がありません。
              </p>
              <img src="/wr.gg/null.gif" alt="アニメーションGIF" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
