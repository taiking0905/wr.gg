import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

interface Champion {
  id: string;
  name_ja: string;
  kana: string;
  lanes:[string]
}

export const ChampionList: React.FC = () => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLane, setSelectedLane] = useState<string>("");



  useEffect(() => {
    const fetchData = async () => {
      try {
        const champsRes = await fetch("/wr.gg/data/champions.json");
        if (!champsRes.ok) throw new Error("champions.json not found");
        const championData = await champsRes.json();

        setChampions(championData);  // ← 文字列配列そのまま使う
      } catch (error) {
        console.error("データの読み込みに失敗しました:", error);
      }
    };
    fetchData();
  }, []);

  // 検索クエリ + レーン選択でフィルタリング
  const filteredChampions = champions.filter((champ) => {
    const query = searchQuery.toLowerCase();
    return (
      champ.name_ja.toLowerCase().includes(query) ||
      (champ.kana?.toLowerCase().includes(query) ?? false) ||
      champ.id.toLowerCase().includes(query)
    );
  }).filter((champ) => {
    // レーンフィルター
    if (!selectedLane) return true;
    if (Array.isArray(champ.lanes)) {
      return champ.lanes.includes(selectedLane); // 配列対応
    }
  });



  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold mb-4 ">チャンピオンごとの変更履歴</h1>

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

      <select value={selectedLane} onChange={e => setSelectedLane(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">ALL</option>
          <option value="TOP">TOP</option>
          <option value="JG">JG</option>
          <option value="MID">MID</option>
          <option value="ADC">ADC</option>
          <option value="SUP">SUP</option>
      </select>

      <div>
        <div
          className="
            grid gap-3
            grid-cols-3    
            text-sm
            sm:grid-cols-3   
            md:grid-cols-4   
            md:gap-8
            md:text-xl
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
              <p className="font-semibold text-gray-800">{champ.name_ja}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
