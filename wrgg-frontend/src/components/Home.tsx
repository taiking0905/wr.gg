import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface PatchNote {
  patch_name: string;
  patch_link: string;
}

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

export const Home: React.FC = () => {
  const [patchNotes, setPatchNotes] = useState<PatchNote[]>([]);
  const [patchContents, setPatchContents] = useState<PatchContents>({});
  const [champions, setChampions] = useState<Champion[]>([]);
  const [latestPatch, setLatestPatch] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const notesRes = await fetch("/wr.gg/data/patch_notes.json");
        const contentsRes = await fetch("/wr.gg/data/patch_contents.json");
        const champsRes = await fetch("/wr.gg/data/champions.json");

        if (!notesRes.ok || !contentsRes.ok || !champsRes.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const notes: PatchNote[] = await notesRes.json();
        const contents: PatchContents = await contentsRes.json();
        const champs: Champion[] = await champsRes.json();

        const patchNames = Object.keys(contents);
        const latest = patchNames[patchNames.length - 1];

        setPatchNotes(notes);
        setPatchContents(contents);
        setChampions(champs);
        setLatestPatch(latest);

        console.log("loaded:", { notes, contents, champs });
      } catch (error) {
        console.error("データの読み込みに失敗しました:", error);
      }
    };
    fetchData();
  }, []);

  if (!latestPatch) {
    return <p className="text-gray-600">読み込み中...</p>;
  }

  const latestNote = patchNotes.find((p) => p.patch_name === latestPatch);
  const changes = patchContents[latestPatch]?.champions ?? {};

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold mb-4">WR.GG</h1>
			<div className="border p-6 rounded-lg bg-gray-800 text-white space-y-6 shadow-md">
				{/* サイトの使い方 */}
				<section className="space-y-2">
					<h2 className="text-xl font-semibold border-gray-600 pb-1">サイトの使い方</h2>
					<ol className="list-decimal list-inside space-y-1 text-gray-200">
						<li>パッチノートから気になる <strong>チャンピオン</strong> をクリック</li>
						<li>チャンピオンごとに <strong>中国版の勝率、ピック率、バン率</strong> が見える</li>
						<li>下には過去の変更履歴がある</li>
					</ol>
				</section>

				{/* パッチ一覧 */}
				<section className="space-y-1">
					<h2 className="text-xl font-semibold border-gray-600 pb-1">パッチ一覧</h2>
					<p className="text-gray-200">過去のパッチが見える。検索もできる。</p>
				</section>

				{/* チャンピオン一覧 */}
				<section className="space-y-1">
					<h2 className="text-xl font-semibold border-gray-600 pb-1">チャンピオン一覧</h2>
					<p className="text-gray-200">チャンピオン一覧から検索できる。</p>
				</section>

				{/* データ一覧 */}
				<section className="space-y-1">
					<h2 className="text-xl font-semibold border-gray-600 pb-1">データ一覧</h2>
					<p className="text-gray-200">最新の中国版の勝率、ピック率、バン率が一覧で見える。</p>
				</section>
			</div>

      {/* パッチ詳細 */}
      <div className="mt-6">
        <h2 className="text-xl mb-2">
          {latestPatch} の変更点
        </h2>
			

      {/* 公式リンク */}
      {latestNote && (
        <a
          href={latestNote.patch_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 underline"
        >
          {latestNote.patch_name} の公式リンクを見る
        </a>
      )}

        {Object.keys(changes).length > 0 ? (
          <ul className="flex flex-col gap-4">
            {Object.entries(changes).map(([champion_name, details]) => {
              const champ = champions.find((c) => c.name_ja === champion_name);
              const champId = champ?.id ?? "notfound";

              return (
                <Link key={champId} to={`/champion/${champId}`}>
                  <li className="border p-4 rounded-lg bg-white shadow-sm">
                    <p className="font-bold text-xl text-gray-900 mb-3">
                      {champion_name}
                    </p>
                    <ul className="space-y-4">
                      {details.map((change, i) => (
                        <li
                          key={i}
                          className="border-l-4 border-blue-500 pl-3"
                        >
                          <p className="font-bold">
                            {change.ability_title}
                          </p>
                          <div
                            className="text-sm mt-1 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: change.change_details,
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </li>
                </Link>
              );
            })}
          </ul>
        ) : (
          <div>
            <p className="pt-20">
              このパッチには変更内容が登録されていません。
            </p>
            <img src="/wr.gg/null.gif" alt="アニメーションGIF" />
          </div>
        )}
      </div>
    </div>
  );
};
