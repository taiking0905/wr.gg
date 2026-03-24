import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
  championId: string;
  championName: string;
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
// laneごとに個別スコア計算
const top10 = allChampionData
  .map(champ => {
    const masterEntries = champ.data.filter(e => e.rank === "Master");
    return masterEntries.map(e => ({
      championId: champ.id,
      championName: champ.name_ja,
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
      {/* パッチ詳細 */}
      <div className="mt-6">
        <h2 className="text-xl mb-2">{latestPatch} 変更チャンピオン</h2>
        {/* パッチ変更があったチャンピオン（横スクロール対応版） */}
        {Object.keys(changes).length > 0 && (
          <div>
            <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
              {Object.keys(changes).map((champion_name) => {
                const champ = champions.find((c) => c.name_ja === champion_name);
                const champId = champ?.id ?? "notfound";

                return (
                  <Link
                    to={`/champion/${champId}`}
                    key={champId}
                    className="
                      flex-shrink-0
                      cursor-pointer text-center
                      rounded-lg
                      p-2
                      bg-white
                      border
                    "
                  >
                    {champ && (
                      <img
                        src={`/wr.gg/data/champion_images/${champ.id}.png`}
                        alt={champ.name_ja}
                        className="
                          mx-auto mb-1 object-contain
                          max-h-20
                          sm:max-h-24
                          md:max-h-28
                          lg:max-h-32
                        "
                      />
                    )}

                    <p className="text-xs font-semibold text-gray-900">
                      {champ?.name_ja ?? champion_name}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        {/* OPランキングトップ10（横スクロール版） */}
        {opTop10.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl mb-2">OPランキングトップ10</h2>
            <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
              {opTop10.map((champ) => {
                return (
                  <Link
                    key={`${champ.championId}-${champ.lane}`}
                    to={`/champion/${champ.championId}`}
                    className="flex-shrink-0 cursor-pointer text-center rounded-lg p-2 bg-white border shadow-sm"
                  >
                    {/* 画像 */}
                    <img
                      src={`/wr.gg/data/champion_images/${champ.championId}.png`}
                      alt={champ.championName}
                      className="
                        mx-auto mb-1 object-contain
                          max-h-20
                          sm:max-h-24
                          md:max-h-28
                          lg:max-h-32
                      "
                    />

                    {/* 名前 */}
                    <p className="text-xs font-semibold text-gray-900">{champ.championName}</p>

                    {/* レーン */}
                    <p className="text-xs text-gray-600">{champ.lane}</p>

                    {/* スコア */}
                    <p className="text-xs text-gray-700 font-bold">{champ.score.toFixed(2)}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* AIが選んだ今回の見どころトップ15 */}
        {aiHighlights.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl mb-2">AIが選んだ注目チャンピオン</h2>

            <ul className="flex flex-col gap-4">
              {aiHighlights.map((highlight, index) => {
                const champ = champions.find((c) => c.name_ja ===  highlight.champion);
                const champId = champ?.id ?? "notfound";

                return (
                      <Link
                        key={`${champId}-${index}`} // インデックスを追加
                        to={`/champion/${champId}`}
                        className="block"
                      >
                    <li
                      className="
                        flex items-start gap-4
                        p-4
                        rounded-xl
                        bg-white
                        shadow-md
                        hover:bg-gray-50
                        transition
                      "
                    >
                      {/* 左：チャンピオン画像 */}
                      {champ && (
                        <img
                          src={`/wr.gg/data/champion_images/${champ.id}.png`}
                          alt={champ.name_ja}
                          className="
                            mx-auto mb-2 object-contain
                            max-h-20
                            sm:max-h-24
                            md:max-h-28
                            lg:max-h-32
                          "
                        />
                      )}

                      {/* 右：テキストエリア */}
                      <div className="flex-1">
                        <p className="font-bold text-sm text-gray-900 mb-1">
                          {champ?.name_ja ?? highlight.champion}
                        </p>

                        <p className="text-sm text-gray-700 leading-relaxed">
                          {highlight.reason}
                        </p>
                      </div>
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
