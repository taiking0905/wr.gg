import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface PatchContents {
  [patch_name: string]: {
    update_date: string;
    champions: string[]; // チャンピオン名だけ
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

export const Home: React.FC = () => {
  const [patchContents, setPatchContents] = useState<PatchContents>({});
  const [champions, setChampions] = useState<Champion[]>([]);
  const [latestPatch, setLatestPatch] = useState<string | null>(null);
  const [latestPatchUpdate, setLatestPatchUpdate] = useState<string>("N/A");
  const [latestStatUpdate, setLatestStatUpdate] = useState<string>("N/A");
  const [aiHighlights, setAiHighlights] = useState<AiHighlight[]>([]);

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
      {/* パッチ詳細 */}
      <div className="mt-6">
        <h2 className="text-xl mb-2">{latestPatch} の注目チャンピオン</h2>

        {/* パッチ変更があったチャンピオン（アイコンのみ） */}
        {Object.keys(changes).length > 0 && (
          <ul className="flex flex-wrap gap-4">
            {Object.keys(changes).map((champion_name) => {
              const champ = champions.find((c) => c.name_ja === champion_name);
              const champId = champ?.id ?? "notfound";

              return (
                <Link key={champId} to={`/champion/${champId}`}>
                  <li className="border p-2 rounded-lg bg-white shadow-sm w-32 text-center">
                    {champ && (
                      <img
                        src={`/wr.gg/data/champion_images/${champ.id}.png`}
                        alt={champ.name_ja}
                        className="mx-auto mb-2 max-w-full max-h-30 object-contain"
                      />
                    )}
                    <p className="font-bold text-sm text-gray-900">
                      {champ?.name_ja ?? champion_name}
                    </p>
                  </li>
                </Link>
              );
            })}
          </ul>
        )}
        {/* AIが選んだ今回の見どころトップ5 */}
        {aiHighlights.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">AIが選んだ注目チャンピオン</h3>
            <ul className="flex flex-col gap-4">
              {aiHighlights.map((highlight) => {
                const champ = champions.find((c) => c.id === highlight.champion);
                const champId = champ?.id ?? "notfound";

                return (
                  <Link key={champId} to={`/champion/${champId}`}>
                    <li className="border p-4 rounded-lg bg-white shadow-sm">
                      {champ && (
                        <img
                          src={`/wr.gg/data/champion_images/${champ.id}.png`}
                          alt={champ.name_ja}
                          className="mx-auto mb-2 max-w-full max-h-40 object-contain"
                        />
                      )}
                      <p className="font-bold text-xl text-gray-900 mb-1">
                        {highlight.ranking}. {highlight.champion}
                      </p>
                      <p className="text-sm leading-relaxed">{highlight.reason}</p>
                    </li>
                  </Link>
                );
              })}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
};
