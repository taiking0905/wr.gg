import { useParams } from "react-router-dom";

function ChampionDetail() {
  const { id } = useParams();
  // 仮のデータでchampionを定義
  const champion = { name_ja: "チャンピオン名" }; // idからデータ取得

  return (
    <div>
      <h1>{champion.name_ja}</h1>
      {/* 詳細表示ロジック再利用 */}
    </div>
  );
}
