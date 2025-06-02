import React, { useEffect, useState } from "react";

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

export const PatchViewer: React.FC = () => {
  const [patchNotes, setPatchNotes] = useState<PatchNote[]>([]);
  const [patchContents, setPatchContents] = useState<PatchContent[]>([]);
  const [selectedPatch, setSelectedPatch] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const notesRes = await fetch("/wr.gg/data/patch_notes.json");
            if (!notesRes.ok) throw new Error("patch_notes.json not found");
            const patchNotes: PatchNote[] = await notesRes.json();

            // パッチノートを逆順に（例: 新しい順）
            const Re_patchNotes = patchNotes.reverse();

            const contentsRes = await fetch("/wr.gg/data/patch_contents.json");
            if (!contentsRes.ok) throw new Error("patch_contents.json not found");
            const patchContents = await contentsRes.json();

            setPatchNotes(Re_patchNotes);        // ← 追加
            setPatchContents(patchContents);  // ← 追加

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
    <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">パッチノート一覧</h1>

        {/* ▼ セレクト形式でパッチを選択 */}
        <div className="mb-4">
            <label htmlFor="patch-select" className="block text-sm font-medium text-gray-700 mb-1">
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
</div>


      {selectedPatch && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">{selectedPatch} の変更点</h2>
          {filteredChanges.length > 0 ? (
            <ul className="space-y-4">
              {filteredChanges.map((change, idx) => (
                <li key={idx} className="border p-3 rounded bg-gray-50">
                  <p className="font-bold text-lg">{change.champion_name}</p>
                  <p className="text-sm text-gray-700">{change.ability_title}</p>
                  <p className="text-gray-800 mt-1 whitespace-pre-line">{change.change_details}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">このパッチには変更内容が登録されていません。</p>
          )}
        </div>
      )}
    </div>
  );
};
