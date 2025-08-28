import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

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
  updatetime: string | null;
  lane: string | null;
  rank: string | null;
  winrate: number | null;
  pickrate: number | null;
  banrate: number | null;
}

interface ChampionData {
  id: string;
  name_ja: string;
  data: ChampionStatsEntry[];
}

export const ChampionDetail: React.FC = () => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [patchContents, setPatchContents] = useState<PatchContent[]>([]);
  const [championStats, setChampionStats] = useState<ChampionStatsEntry | null>(null);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [selectedLane, setSelectedLane] = useState<number | null>(null);
  const [displayStats, setDisplayStats] = useState<ChampionStatsEntry | null>(null);
  const [championStatsAll, setChampionStatsAll] = useState<ChampionStatsEntry[]>([]);




  const navigate = useNavigate();
    
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
  const { id } = useParams<{ id: string }>();

  const champion = champions.find((champ) => champ.id === id);
  const changes = patchContents.filter((change) => change.champion_name === champion?.name_ja);

  useEffect(() => {
    if (!champion) return;

    const fetchChampionStats = async () => {
      try {
        const res = await fetch(`/wr.gg/data/champion_data/${champion.id}.json`);
        if (!res.ok) throw new Error(`${champion.id}.json not found`);
        const data: ChampionData = await res.json();
        
        // null じゃないデータだけ抽出
        const validData = data.data.filter(d => d.winrate !== null);
        setChampionStatsAll(validData);

        // 最新データを displayStats に設定
        setDisplayStats(validData[validData.length - 1] || null);

      } catch (error) {
        console.error("勝率データの読み込みに失敗しました:", error);
      }
    };

    fetchChampionStats();
  }, [champion]);

  const handleSelectRank = (rank: number | null) => {
    setSelectedRank(rank);
    updateDisplayStats(rank, selectedLane);
  };

  const handleSelectLane = (lane: number | null) => {
    setSelectedLane(lane);
    updateDisplayStats(selectedRank, lane);
  };

  const updateDisplayStats = (rank: number | null, lane: number | null) => {
    if (!championStatsAll) return;

    const stats = championStatsAll.find(
      (d) =>
        (rank === null || Number(d.rank) === rank) &&
        (lane === null || Number(d.lane) === lane) &&
        d.winrate !== null
    ) || null;

    setDisplayStats(stats);
  };



  if (!champion) {
    return (
      <div className="p-4">
        <p>チャンピオンが見つかりません。</p>
      {/* 右上に戻るボタン */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-28 right-8 bg-gray-800 text-white px-8 py-4 rounded hover:bg-gray-400 transition"
      >
        ← 戻る
      </button>

      </div>
    );
  }

  return (
    <div className="p-4">
      

      <h1 className="text-2xl font-bold mt-4 mb-2">{champion.name_ja} の変更履歴</h1>
      {/* 右上に戻るボタン */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-28 right-8 bg-gray-800 text-white px-8 py-4 rounded hover:bg-gray-400 transition"
      >
        ← 戻る
      </button>
      <img
        src={`/wr.gg/data/champion_images/${champion.id}.png`}
        alt={champion.name_ja}
        className="w-32 h-32 mb-4"
      />
      {championStatsAll.length > 0 && (
        <div className="mb-4 text-gray-700">
          <div className="flex gap-4 mb-2">
            <div>
              <label className="block mb-1">ランク:</label>
              <select
                value={selectedRank !== null ? selectedRank : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedRank(val !== "" ? Number(val) : null); // 空文字は null に
                }}
              >
                <option value="">全て</option>
                {Array.from(new Set(championStatsAll.map(d => d.rank).filter((v) => v !== null))).map((rank) => (
                  <option key={rank} value={rank!}>{rank}</option>
                ))}
              </select>

              <select
                value={selectedLane !== null ? selectedLane : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedLane(val !== "" ? Number(val) : null);
                }}
              >
                <option value="">全て</option>
                {Array.from(new Set(championStatsAll.map(d => d.lane).filter((v) => v !== null))).map((lane) => (
                  <option key={lane} value={lane!}>{lane}</option>
                ))}
              </select>
            </div>
          </div>

          {displayStats ? (
            <div>
              <p>勝率: {displayStats.winrate?.toFixed(2) ?? "N/A"}%</p>
              <p>ピック率: {displayStats.pickrate?.toFixed(2) ?? "N/A"}%</p>
              <p>バン率: {displayStats.banrate?.toFixed(2) ?? "N/A"}%</p>
            </div>
          ) : (
            <p>選択中のランク・レーンにデータがありません</p>
          )}
        </div>
      )}



      {changes.length > 0 ? (
        <ul className="space-y-4">
          {changes.map((change, idx) => (
            <li key={idx} className="border p-3 rounded bg-gray-50">
              <p className="text-sm text-gray-700">{change.patch_name}</p>
              <p className="font-bold text-lg">{change.ability_title}</p>
              <div
                className="text-gray-800 mt-1"
                dangerouslySetInnerHTML={{ __html: change.change_details }}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <p className="text-gray-600">このチャンピオンには変更履歴がありません。</p>
          <img src="/wr.gg/null.gif" alt="アニメーションGIF" ></img>
        </div>
      )}
    </div>
  );
}
