import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";

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
  const [patchContents, setPatchContents] = useState<PatchContent[]>([]);
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [selectedLane, setSelectedLane] = useState<string>("");
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
        const patchContentData: PatchContent[] = await contentsRes.json();
        setChampions(championData);
        setPatchContents(patchContentData.reverse());
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const champion = champions.find(champ => champ.id === id);
  const changes = patchContents.filter(change => change.champion_name === champion?.name_ja);

  useEffect(() => {
    if (!champion) return;

    const fetchChampionStats = async () => {
      try {
        const res = await fetch(`/wr.gg/data/champion_data/${champion.id}.json`);
        const data: ChampionData = await res.json();
        setChampionStatsAll(data.data);

        if (data.data.length > 0) {
          setDisplayStats(data.data[0]);
          setSelectedRank(data.data[0].rank);
          setSelectedLane(data.data[0].lane);
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
      d.rank === selectedRank && d.lane === selectedLane
    );

    setDisplayStats(stats || null);
  }, [selectedRank, selectedLane, championStatsAll]);

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
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6 text-xl">
      {/* ヘッダー: 画像、タイトル、戻るボタン */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <img
            src={`/wr.gg/data/champion_images/${champion.id}.png`}
            alt={champion.name_ja}
            className="w-24 h-24 rounded-lg"
          />
          <h1 className="text-3xl font-bold">{champion.name_ja} の変更履歴</h1>
        </div>
      </div>

      {/* スタッツ部分 */}
      {championStatsAll.length > 0 ? (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-inner">
          <div className="flex gap-4 mb-4">
            <div>
              <label className="block mb-1 text-sm font-medium">ランク</label>
              <select
                value={selectedRank ?? ""}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="border px-2 py-1 rounded shadow-sm"
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
                className="border px-2 py-1 rounded shadow-sm"
              >
                {Array.from(new Set(championStatsAll.map(d => d.lane)))
                  .map(lane => (
                    <option key={lane} value={lane ?? ""}>{lane ?? ""}</option>
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
      {changes.length > 0 ? (
        <ul className="space-y-4">
          {changes.map((change, idx) => (
            <li key={idx} className="border p-4 rounded bg-gray-50 shadow-sm">
              <p className="text-sm text-gray-500">{change.patch_name}</p>
              <p className="font-semibold text-lg mt-1">{change.ability_title}</p>
              <div className="text-gray-800 mt-2" dangerouslySetInnerHTML={{ __html: change.change_details }} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center p-6 text-gray-500">
          このチャンピオンには変更履歴がありません
          <img src="/wr.gg/null.gif" alt="アニメーションGIF" className="mx-auto mt-2"/>
        </div>
      )}
    </div>

  );
};
