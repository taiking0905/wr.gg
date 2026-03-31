import React, { useEffect, useState } from "react";
import { PatchChampionList } from "../components/PatchChampionList";
import { OPChampionList } from "../components/OPChampionList";
import { AiChampionList } from "../components/AiChampionList";

interface PatchContents {
  [patch_name: string]: {
    update_date: string;
    champions: string[];
  };
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

interface AllChampionData {
  id: string;
  name_ja: string;
  data: ChampionStatsEntry[];
}

interface AiHighlight {
  ranking: string;     
  champion: string;   
  reason: string;
}
interface TopChampion {
  id: string;
  name_ja: string;
  lane: string;
  score: number;
}

export const Home: React.FC = () => {
  const [patchContents, setPatchContents] = useState<PatchContents>({});
  const [champions, setChampions] = useState<Champion[]>([]);
  const [latestPatch, setLatestPatch] = useState<string | null>(null);
  const [latestPatchUpdate, setLatestPatchUpdate] = useState<string>("N/A");
  const [latestStatUpdate, setLatestStatUpdate] = useState<string>("N/A");
  const [aiHighlights, setAiHighlights] = useState<AiHighlight[]>([]);
  const [opTop10, setOpTop10] = useState<TopChampion[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const notesRes = await fetch("/wr.gg/data/patch_notes.json");
        const contentsRes = await fetch("/wr.gg/data/patch_contents.json");
        const champsRes = await fetch("/wr.gg/data/champions.json");
        const statsRes = await fetch("/wr.gg/data/all_champion_data.json");
        const AIRes = await fetch("/wr.gg/data/AI/output_ai.json");

        if (!notesRes.ok || !contentsRes.ok || !champsRes.ok || !statsRes.ok || !AIRes.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const contents: PatchContents = await contentsRes.json();
        const champs: Champion[] = await champsRes.json();
        const allChampionData: AllChampionData[] = await statsRes.json();
        const aiData: AiHighlight[] = await AIRes.json();

        const patchNames = Object.keys(contents);
        const latest = patchNames[patchNames.length - 1];

        setPatchContents(contents);
        setChampions(champs);
        setLatestPatch(latest);
        setLatestPatchUpdate(contents[latest]?.update_date ?? "N/A");
        setAiHighlights(aiData);

        // 統計データ更新日を別の JSON から取得
        const latestStat = allChampionData
          .flatMap(champ => champ.data)
          .sort((a, b) => a.updatetime.localeCompare(b.updatetime))
          .pop()?.updatetime ?? "N/A";

        setLatestStatUpdate(latestStat);
        
        // 各チャンプの最新統計を取得してスコア計算
        // laneごとに個別にスコア計算してフラットに
        const top10 = allChampionData
          .map(champ => {
            const masterEntries = champ.data.filter(e => e.rank === "Master");
            return masterEntries.map(e => ({
              id: champ.id,
              name_ja: champ.name_ja,
              lane: e.lane,
              score: e.winrate * 0.5 + e.pickrate * 0.3 + e.banrate * 0.2,
            }));
          })
          .flat()
          .sort((a, b) => b.score - a.score)
          .slice(0, 10); // laneごとのTop10

        setOpTop10(top10);
        console.log("OP Top10 (lane別保持):", top10);
        console.log("loaded:", {contents, champs });
      } catch (error) {
        console.error("データの読み込みに失敗しました:", error);
      }
    };
    fetchData();
  }, []);

  if (!latestPatch) {
    return <p className="text-gray-600">読み込み中...</p>;
  }

  const changes = patchContents[latestPatch]?.champions ?? {};

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold mb-4">WR.GG</h1>
      <div className="border p-6 rounded-lg bg-gray-800 text-white space-y-6 shadow-md">
        {/* サイトの特徴 */}
        <section className="space-y-2">
          <h2 className="text-sm md:text-xl font-semibold border-gray-600 pb-1">
            パッチノートと中国版の統計データ（勝率・ピック率・バン率）を
            わかりやすく確認できます。
          </h2>

          <h2 className="text-sm md:text-xl font-semibold border-gray-600 pb-1">
            気になるチャンピオンをクリックすると、過去の統計データを確認できます。
          </h2>
        </section>

        <section className="space-y-1">
          <h3 className="text-sm md:text-xl font-semibold border-gray-600 pb-1">最新更新情報</h3>
          <p className="text-sm md:text-base">
            パッチノート更新日：<strong>{latestPatchUpdate}</strong>
          </p>
          <p className="text-sm md:text-base">
            統計データ更新日：<strong>{latestStatUpdate}</strong>
          </p>
        </section>
      </div>

      <div className="mt-6">
        {/* パッチ詳細 */}
        <PatchChampionList
          latestPatch={latestPatch}
          changes={changes}
          champions={champions}
        />
        {/* OPランキングトップ10 */}
        <OPChampionList
          opTop10={opTop10}
        />
        {/* AIが選んだ今回の見どころトップ15 */}
        <AiChampionList
          aiTOP15={aiHighlights}
          // TODO: Aiが出力する英語を日本語と紐づけするために
          champions={champions}
        />
      </div>

    </div>
  );
};
