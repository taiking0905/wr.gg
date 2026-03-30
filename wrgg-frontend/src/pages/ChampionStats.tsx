import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Select } from "../components/Select";
import { createOptions } from "../components/createOptions";

interface Champion {
  id: string;
  name_ja: string;
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
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [selectedLane, setSelectedLane] = useState<string>("");
  const [sortKey, setSortKey] = useState<"winrate" | "pickrate" | "banrate">("winrate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchData = async () => {
      const champsRes = await fetch("/wr.gg/data/champions.json");
      const championData: Champion[] = await champsRes.json();
      setChampions(championData);

      const statsRes = await fetch("/wr.gg/data/all_champion_data.json");
      const statsData: AllChampionData[] = await statsRes.json();
      setAllStats(statsData);
      const firstRank = "Master";
      const firstLane = "TOP";
      setSelectedRank(firstRank);
      setSelectedLane(firstLane);
    };
    fetchData();
  }, []);

  const rankOptions = useMemo(
    () => createOptions([
      "Emerald",
      "Diamond",
      "Master",
      "Challenger",
      "legendary rank",
    ]),
    []
  );

  const laneOptions = useMemo(
    () => createOptions(["TOP", "JG", "MID", "ADC", "SUP"]),
    []
  );

  const sortKeyOptions = useMemo(
    () => [
      { label: "勝率", value: "winrate" },
      { label: "ピック率", value: "pickrate" },
      { label: "バン率", value: "banrate" },
    ],
    []
  );

  const sortOrderOptions = useMemo(
    () => [
      { label: "降順", value: "desc" },
      { label: "昇順", value: "asc" },
    ],
    []
  );

  const allEntries = allStats.flatMap(champ =>
    champ.data.map(d => ({
      ...d,
      id: champ.id,
      name_ja: champ.name_ja
    }))
  );

  // ランク・レーンでフィルタ
  const filtered = allEntries.filter(d => 
    (selectedRank ? d.rank === selectedRank : true) &&
    (selectedLane ? d.lane === selectedLane : true)
  );

  // ソート
  const sorted = [...filtered].sort((a, b) => {
    const diff = b[sortKey] - a[sortKey];
    return sortOrder === "desc" ? diff : -diff;
  });

  const getChampionInfo = (id: string) => champions.find(c => c.id === id);

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">最新データ一覧 ({sorted[0]?.updatetime ?? "N/A"})</h1>

      {/* フィルタ & ソート */}
      <div className="mb-6 p-4 rounded-lg w-full max-w-3xl">
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap w-full px-2 pb-2 space-x-4 scrollbar-gutter-stable">

          <Select
              options={rankOptions}
              value={selectedRank}
              onChange={setSelectedRank}
              className="inline-block border px-2 py-1 rounded"
            />

            <Select
              options={laneOptions}
              value={selectedLane}
              onChange={setSelectedLane}
              className="inline-block border px-2 py-1 rounded"
            />

            <Select
              options={sortKeyOptions}
              value={sortKey}
              onChange={(v) => setSortKey(v as any)}
              className="inline-block border px-2 py-1 rounded"
            />

            <Select
              options={sortOrderOptions}
              value={sortOrder}
              onChange={(v) => setSortOrder(v as any)}
              className="inline-block border px-2 py-1 rounded"
            />

        </div>
      </div>
      <div className="flex flex-col space-y-4 w-full max-w-3xl">
      {sorted.map((entry, index) => {
        const info = getChampionInfo(entry.id);
        return (
          <Link
            key={`${entry.id}-${entry.rank}-${entry.lane}`}
            to={`/champion/${entry.id}`}
            className="border rounded-lg p-4 shadow bg-white flex items-center gap-4 hover:bg-gray-50 transition"
          >
            <span className="font-bold w-6 text-center">{index + 1}</span>
            {info && (
              <img
                src={info.img_url}
                alt={info.name_ja}
                className="
                    max-h-16
                    sm:max-h-20
                    md:max-h-24
                    lg:max-h-28
                "
              />
            )}
            <div>
              <h2 className="font-semibold">{entry.name_ja}</h2>
              <p className="text-sm text-gray-500">
                {entry.rank} | {entry.lane}
              </p>
              <p>
                勝率: {entry.winrate.toFixed(1)}% / ピック率:{" "}
                {entry.pickrate.toFixed(1)}% / バン率:{" "}
                {entry.banrate.toFixed(1)}%
              </p>
            </div>
          </Link>
        );
      })}
    </div>
    </div>
  );
};
