import React from 'react';
import { ChampionCard } from "../components/ChampionCard";

interface Champion {
  id: string;
  name_ja: string;
  kana: string;
}

type Props = {
  latestPatch: string;
  changes: Record<string, any>;
  champions: Champion[];
};

export const PatchChampionList: React.FC<Props> = ({
  latestPatch,
  changes,
  champions
}) => {
  if (Object.keys(changes).length === 0) return null;

  return (
    <div>
      <h2 className="text-xl mb-2">
        {latestPatch} 変更チャンピオン
      </h2>

      <div className="flex gap-4 overflow-x-auto py-2">
        {Object.keys(changes).map((champion_name) => {
          const champ = champions.find(
            (c) => c.name_ja === champion_name
          );

          const champId = champ?.id ?? "notfound";

          return (
            <ChampionCard
              key={champId}
              id={champId}
            //// TODO: パッチのチャンピオン名が英語の時の負債
              name={champ?.name_ja ?? champion_name}
            />
          );
        })}
      </div>
    </div>
  );
};