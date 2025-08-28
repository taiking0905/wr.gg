import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface PatchNote {
  patch_name: string;
  patch_link: string;
}

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

export const PatchViewer: React.FC = () => {
  const [patchNotes, setPatchNotes] = useState<PatchNote[]>([]);
  const [patchContents, setPatchContents] = useState<PatchContent[]>([]);
   const [champions, setChampions] = useState<Champion[]>([]);
  const [selectedPatch, setSelectedPatch] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const notesRes = await fetch("/wr.gg/data/patch_notes.json");
            if (!notesRes.ok) throw new Error("patch_notes.json not found");
            const patchNotes: PatchNote[] = await notesRes.json();

            // パッチノートを逆順に（例: 新しい順）よくないかもです
            const Re_patchNotes = patchNotes.reverse();

            const contentsRes = await fetch("/wr.gg/data/patch_contents.json");
            if (!contentsRes.ok) throw new Error("patch_contents.json not found");
            const patchContents = await contentsRes.json();

            const champsRes = await fetch("/wr.gg/data/champions.json");
            if (!champsRes.ok) throw new Error("champions.json not found");
            const championData = await champsRes.json();

            setPatchNotes(Re_patchNotes);        // ← 追加
            setPatchContents(patchContents);  // ← 追加
            setChampions(championData) // ← 追加

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

  const filteredChanges: PatchContent[] = selectedPatch
    ? patchContents.filter((c) => c.patch_name === selectedPatch)
    : [];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6 text-xl">
        <h1 className="text-3xl font-bold mb-4">パッチノート一覧</h1>

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
            {patchNotes.map((patch) => (
                <option key={patch.patch_name} value={patch.patch_name}>
                {patch.patch_name}
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


        {selectedPatch && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">{selectedPatch} の変更点</h2>
            {filteredChanges.length > 0 ? (
              <ul className="space-y-4">
                
                {filteredChanges.map((change, idx) => {
                    const matchingChampion = champions.find(
                      (champ) => champ.name_ja === change.champion_name
                    );
                    const championId = matchingChampion?.id ?? "notfound"; // Fallback

                    return (
                    <li key={idx} className="border p-3 rounded bg-gray-50">
                      <Link
                        to={`/champion/${championId}`}
                      >
                        <p className="font-bold text-lg">{change.champion_name}</p>
                        <p className="text-sm text-gray-700">{change.ability_title}</p>
                        <div
                          className="text-gray-800 mt-1"
                          dangerouslySetInnerHTML={{ __html: change.change_details }}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div>
                <p className="text-gray-600 pt-20">このパッチには変更内容が登録されていません。</p>
                <img src="/wr.gg/null.gif" alt="アニメーションGIF" ></img>
              </div>
              
            )}
          </div>
        )}
    </div>
  );
};
