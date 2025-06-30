import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

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

export const ChampionDetail: React.FC = () => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [patchContents, setPatchContents] = useState<PatchContent[]>([]);
    
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

  if (!champion) {
    return (
      <div className="p-4">
        <p>チャンピオンが見つかりません。</p>
        <Link to="/" className="text-blue-500 hover:underline">← 一覧に戻る</Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Link to="/champions" className="text-blue-500 hover:underline">← 一覧に戻る</Link>

      <h1 className="text-2xl font-bold mt-4 mb-2">{champion.name_ja} の変更履歴</h1>
      <img
        src={`/wr.gg/data/champion_images/${champion.id}.png`}
        alt={champion.name_ja}
        className="w-32 h-32 mb-4"
      />

      {changes.length > 0 ? (
        <ul className="space-y-4">
          {changes.map((change, idx) => (
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
  );
}
