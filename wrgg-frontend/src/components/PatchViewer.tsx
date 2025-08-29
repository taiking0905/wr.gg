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

export const PatchViewer: React.FC = () => {
  const [patchNotes] = useState<PatchNote[]>([]);
  const [patchContents, setPatchContents] = useState<PatchContents>({});
  const [champions, setChampions] = useState<Champion[]>([]);
  const [selectedPatch, setSelectedPatch] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const notesRes = await fetch("/wr.gg/data/patch_notes.json");
            if (!notesRes.ok) throw new Error("patch_notes.json not found");
            const patchNotes: PatchNote[] = await notesRes.json();



            const contentsRes = await fetch("/wr.gg/data/patch_contents.json");
            if (!contentsRes.ok) throw new Error("patch_contents.json not found");
            const patchContents = await contentsRes.json();

            const champsRes = await fetch("/wr.gg/data/champions.json");
            if (!champsRes.ok) throw new Error("champions.json not found");
            const championData = await champsRes.json();     
            setPatchContents(patchContents);  
            setChampions(championData) 

            console.log(patchNotes, patchContents);
        } catch (error) {
            console.error("データの読み込みに失敗しました:", error);
        }
    };
  fetchData();
}, []);

  const handleSelectPatch = (patchName: string) => {
    setSelectedPatch(patchName);
  };

  const filteredChanges = selectedPatch
    ? patchContents[selectedPatch]
    : null;


  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
        <h1 className="text-2xl font-bold mb-4">パッチノート一覧</h1>

        {/* ▼ セレクト形式でパッチを選択 */}
        <div className="mb-4">
            <label htmlFor="patch-select" className="block font-medium text-gray-700 mb-1">
            パッチを選択:
            </label>
            <select
            id="patch-select"
            onChange={(e) => handleSelectPatch(e.target.value)}
            value={selectedPatch ?? ""}
            className="border rounded px-3 py-2 w-full max-w-sm"
            >
            <option value="">-- パッチを選択してください --</option>
            {Object.keys(patchContents).reverse().map((patchName) => (
              <option key={patchName} value={patchName}>
                {patchName}
              </option>
            ))}
            </select>
          {/* ▼ 公式リンク表示（選択中のパッチにだけリンク表示） */}
          {selectedPatch && (
            <div className="mb-4">
              {(() => {
                const selected = patchNotes.find((p) => p.patch_name === selectedPatch);
                if (!selected) return null;
                return (
                  <a
                    href={selected.patch_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    {selected.patch_name} の公式リンクを見る
                  </a>
                );
              })()}
            </div>
          )}

          {!selectedPatch && (
            <div>
              <p className="text-gray-600 mt-4 pt-20">表示したいパッチを上のセレクトから選んでください。</p>
              <img src="/wr.gg/start.gif" alt="アニメーションGIF" className="mt-4"></img>
            </div>
          )}
        </div>


      {/* パッチ詳細部分 */}
      {selectedPatch && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">{selectedPatch} の変更点</h2>
          <span className="ml-2 text-sm text-gray-500">
            ({filteredChanges?.update_date})
          </span>
          {filteredChanges ? (
            <ul className="flex flex-col gap-4">
              {Object.entries(filteredChanges.champions).map(
                ([champion_name, changes]) => {
                  const matchingChampion = champions.find(
                    (champ) => champ.name_ja === champion_name
                  );
                  const championId = matchingChampion?.id ?? "notfound";

                  return (
                    <Link key={championId} to={`/champion/${championId}`}>
                      <li className="border p-4 rounded-lg bg-gray-10 shadow-sm">
                        <p className="font-bold text-xl text-gray-900 mb-3">
                          {champion_name}
                        </p>
                        <ul className="space-y-4">
                          {changes.map((change, i) => (
                            <li
                              key={i} // change が配列内で安定しているなら問題なし
                              className="border-l-4 border-blue-500 pl-3"
                            >
                              <p className="font-bold text-gray-800">
                                {change.ability_title}
                              </p>
                              <div
                                className="text-gray-700 text-sm mt-1 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: change.change_details }}
                              />
                            </li>
                          ))}
                        </ul>
                      </li>
                    </Link>
                  );
                }
              )}
            </ul>
          ) : (
            <div>
              <p className="text-gray-600 pt-20">
                このパッチには変更内容が登録されていません。
              </p>
              <img src="/wr.gg/null.gif" alt="アニメーションGIF" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
