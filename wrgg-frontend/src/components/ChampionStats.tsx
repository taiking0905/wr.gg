import React, { useEffect, useState } from "react";

interface Champion {
  id: string;
  name_ja: string;
  kana: string;
  img_url: string;
}

interface ChampionStatsEntry {
  updatetime: string;
  lane: string;
  rank: string;
  winrate: number;
  pickrate: number;
  banrate: number;
}

interface AllChampionData {
  id: string;
  name_ja: string;
  data: ChampionStatsEntry[];
}

export const ChampionStats: React.FC = () => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [allStats, setAllStats] = useState<AllChampionData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const champsRes = await fetch("/wr.gg/data/champions.json");
        const championData: Champion[] = await champsRes.json();
        setChampions(championData);

        const allRes = await fetch(`/wr.gg/data/all_champion_data.json`);
        const statsData: AllChampionData[] = await allRes.json();
        setAllStats(statsData);
      } catch (error) {
        console.error("データの読み込みに失敗しました:", error);
      }
    };
    fetchData();
  }, []);

  // champion.json からチャンピオン情報を取得
  const getChampionInfo = (id: string) =>
    champions.find((c) => c.id === id);

  // rank + lane でソート（例: rank→lane→winrate降順）
  const sorted = [...allStats].sort((a, b) => {
    const rankA = a.data[0]?.rank.localeCompare(b.data[0]?.rank || "");
    if (rankA !== 0) return rankA;
    const laneA = a.data[0]?.lane.localeCompare(b.data[0]?.lane || "");
    if (laneA !== 0) return laneA;
    return (b.data[0]?.winrate || 0) - (a.data[0]?.winrate || 0);
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">最新データ一覧</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sorted.map((champ) => {
          const info = getChampionInfo(champ.id);
          const data = champ.data[0]; // 最新データを一つ表示
          if (!data) return null;

          return (
            <div
              key={champ.id}
              className="border rounded-lg p-4 shadow bg-white"
            >
              {info && (
                <>
                  <img
                    src={info.img_url}
                    alt={info.name_ja}
                    className="w-16 h-16 mx-auto rounded"
                  />
                  <h2 className="text-center font-semibold mt-2">
                    {info.name_ja}
                  </h2>
                </>
              )}
              <p className="text-sm text-gray-500">
                {data.rank} | {data.lane}
              </p>
              <p>勝率: {data.winrate.toFixed(1)}%</p>
              <p>ピック率: {data.pickrate.toFixed(1)}%</p>
              <p>バン率: {data.banrate.toFixed(1)}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
