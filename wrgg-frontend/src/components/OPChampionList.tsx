import React from 'react';
import { ChampionCard } from "../components/ChampionCard";

interface TopChampion {
  id: string;
  name_ja: string;
  lane: string;
  score: number;
}
type Props = {
  opTop10: TopChampion[];
};


export const OPChampionList: React.FC<Props> = ({
  opTop10
}) => {
  if (Object.keys(opTop10).length === 0) return null;

  return (
      <div className="mt-6">
        {opTop10.length > 0 && (
          <div>
            <h2 className="text-xl mb-2">OPランキングトップ10</h2>
            <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
            {opTop10.map((champ) => (
              <ChampionCard
                id={champ.id}
                name={champ.name_ja}
                lane={champ.lane}
                score={champ.score}
              />
            ))}
            </div>
          </div>
        )}
      </div>
  );
};