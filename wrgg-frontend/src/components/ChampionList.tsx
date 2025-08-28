import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

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
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6 text-xl">
      <h1 className="text-3xl font-bold mb-4 ">チャンピオンごとの変更履歴</h1>

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

      <div>
        <div
          className="
            grid gap-6 px-2
            grid-cols-2      
            sm:grid-cols-3   
            md:grid-cols-4   
            lg:grid-cols-5
          "
        >
          {filteredChampions.map((champ) => (
            <Link
              to={`/champion/${champ.id}`}
              key={champ.id}
              className="cursor-pointer text-center hover:bg-gray-100 rounded-lg p-4 shadow-md transition duration-200"
            >
              <img
                src={`/wr.gg/data/champion_images/${champ.id}.png`}
                alt={champ.name_ja}
                className="mx-auto mb-2 max-w-full max-h-40 object-contain"
              />
              <p className="text-base font-semibold text-gray-800">{champ.name_ja}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
