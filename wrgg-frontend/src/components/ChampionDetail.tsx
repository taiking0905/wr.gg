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
  lane: number | null;
  rank: number | null;
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
        console.log("Champion stats JSON:", data);

        // 最新データを取得（例: 配列の最後）
        const latest = data.data.filter(d => d.winrate !== null).pop() || null;
        setChampionStats(latest);
      } catch (error) {
        console.error("勝率データの読み込みに失敗しました:", error);
      }
    };

    fetchChampionStats();
  }, [champion]);



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
      {championStats && (
        <div className="mb-4 text-gray-700">
          <p>勝率: {championStats.winrate !== null ? championStats.winrate.toFixed(1) : "N/A"}%</p>
          <p>ピック率: {championStats.pickrate !== null ? championStats.pickrate.toFixed(1) : "N/A"}%</p>
          <p>バン率: {championStats.banrate !== null ? championStats.banrate.toFixed(1) : "N/A"}%</p>
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
