import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";

interface PatchContents {
  [patch_name: string]: {
    update_date: string;
    champions: {
      [champion_name: string]: ChampionChange[];
    };
  };
}

interface ChampionChange {
  ability_title: string;
  change_details: string;
}

interface Champion {
  id: string;
  name_ja: string;
  kana: string;
}

interface ChampionStatsEntry {
  updatetime: string;
  lane: string;
  rank: string;
  winrate: number;
  pickrate: number;
  banrate: number;
}

interface ChampionData {
  id: string;
  name_ja: string;
  data: ChampionStatsEntry[];
}

export const ChampionDetail: React.FC = () => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [patchContents, setPatchContents] = useState<PatchContents>({});
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [selectedLane, setSelectedLane] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [displayStats, setDisplayStats] = useState<ChampionStatsEntry | null>(null);
  const [championStatsAll, setChampionStatsAll] = useState<ChampionStatsEntry[]>([]);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const champsRes = await fetch("/wr.gg/data/champions.json");
        const championData: Champion[] = await champsRes.json();
        const contentsRes = await fetch("/wr.gg/data/patch_contents.json");
        if (!contentsRes.ok) throw new Error("patch_contents.json not found");
        const patchContents = await contentsRes.json();
        setChampions(championData);
        setPatchContents(patchContents);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const champion = champions.find(champ => champ.id === id);
  // パッチごとに変更点をまとめる
  const groupedChanges = champion
    ? Object.entries(patchContents)
        .reverse()
        .map(([patchName, content]) => {
          const champChanges = content.champions[champion.name_ja];
          if (!champChanges) return null;

          return {
            patch_name: patchName,
            update_date: content.update_date,
            changes: champChanges,
          };
        })
        .filter((patch): patch is NonNullable<typeof patch> => patch !== null)
    : [];


  useEffect(() => {

    const fetchChampionStats = async () => {
      try {
        const res = await fetch(`/wr.gg/data/champion_data/${id}.json`);
        const data: ChampionData = await res.json();
        setChampionStatsAll(data.data);

        if (data.data.length > 0) {
          setDisplayStats(data.data[0]);
          setSelectedRank(data.data[0].rank);
          setSelectedLane(data.data[0].lane);
          setSelectedTime(data.data[0].updatetime)
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchChampionStats();
  }, [champion]);

  useEffect(() => {
    if (!championStatsAll.length) return;

    const stats = championStatsAll.find(d =>
      d.rank === selectedRank && d.lane === selectedLane && d.updatetime == selectedTime
    );

    setDisplayStats(stats || null);
  }, [selectedRank, selectedLane, selectedTime, championStatsAll]);

  if (!champion) {
    return (
      <div className="p-4">
        <p>チャンピオンが見つかりません。</p>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-28 right-8 bg-gray-800 text-white px-8 py-4 rounded hover:bg-gray-400 transition"
        >← 戻る</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      {/* ヘッダー: 画像、タイトル、戻るボタン */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <img
            src={`/wr.gg/data/champion_images/${champion.id}.png`}
            alt={champion.name_ja}
            className="w-24 h-24 rounded-lg"
          />
          <h1 className="text-xl font-bold">{champion.name_ja} の変更履歴</h1>
        </div>
      </div>

      {/* スタッツ部分 */}
      {championStatsAll.length > 0 ? (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-inner">
          <div className="flex gap-4 mb-6 overflow-x-auto whitespace-nowrap px-2">
            <div>
              <label className="block mb-1 text-sm font-medium">ランク</label>
              <select
                value={selectedRank ?? ""}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="inline-block border px-2 py-1 rounded"
              >
                {Array.from(new Set(championStatsAll.map(d => d.rank)))
                  .map(rank => (
                    <option key={rank} value={rank ?? ""}>{rank ?? ""}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">レーン</label>
              <select
                value={selectedLane ?? ""}
                onChange={(e) => setSelectedLane(e.target.value)}
                className="inline-block border px-2 py-1 rounded"
              >
                {Array.from(new Set(championStatsAll.map(d => d.lane)))
                  .map(lane => (
                    <option key={lane} value={lane ?? ""}>{lane ?? ""}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">更新日</label>
              <select
                value={selectedTime ?? ""}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="inline-block border px-2 py-1 rounded"
              >
                {Array.from(new Set(championStatsAll.map(d => d.updatetime)))
                  .map(updatetime => (
                    <option key={updatetime} value={updatetime ?? ""}>{updatetime ?? ""}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-2 bg-white rounded shadow-sm">
              <p className="text-sm text-gray-500">勝率</p>
              <p className="font-bold">{displayStats?.winrate?.toFixed(2) ?? "N/A"}%</p>
            </div>
            <div className="p-2 bg-white rounded shadow-sm">
              <p className="text-sm text-gray-500">ピック率</p>
              <p className="font-bold">{displayStats?.pickrate?.toFixed(2) ?? "N/A"}%</p>
            </div>
            <div className="p-2 bg-white rounded shadow-sm">
              <p className="text-sm text-gray-500">バン率</p>
              <p className="font-bold">{displayStats?.banrate?.toFixed(2) ?? "N/A"}%</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-inner">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-2 bg-white rounded shadow-sm">
              <p className="text-sm text-gray-500">勝率</p>
              <p className="font-bold">N/A%</p>
            </div>
            <div className="p-2 bg-white rounded shadow-sm">
              <p className="text-sm text-gray-500">ピック率</p>
              <p className="font-bold">N/A%</p>
            </div>
            <div className="p-2 bg-white rounded shadow-sm">
              <p className="text-sm text-gray-500">バン率</p>
              <p className="font-bold">N/A%</p>
            </div>
          </div>
        </div>
      )}

      {/* 変更履歴部分 */}
      {groupedChanges.length > 0 ? (
        <ul className="space-y-4">
          {groupedChanges.map((patch, idx) => (
            <li 
              key={idx} 
              className="border p-4 rounded-lg bg-white shadow-sm"
            >
              <p className="font-bold text-xl text-gray-900 mb-3">
                {patch.patch_name} の変更
              </p>
              <ul className="space-y-4 pl-3">
                {patch.changes.map((change, i) => (
                  <li 
                    key={i} 
                    className="border-l-4 border-blue-500 pl-3"
                  >
                    <p className="font-bold text-gray-800">{change.ability_title}</p>
                    <div
                      className=" text-gray-700 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: change.change_details }}
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-6 text-gray-600 text-center">
          このチャンピオンには変更履歴がありません。
          <img
            src="/wr.gg/null.gif"
            alt="アニメーションGIF"
            className="mt-4 mx-auto"
          />
        </div>
      )}
    </div>

  );
};
