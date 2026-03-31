import { Link } from "react-router-dom";

interface Champion {
  id: string;
  name_ja: string;
  kana: string;
}

interface AiHighlight {
  ranking: string;     
  champion: string;   
  reason: string;
}
type Props = {
  aiTOP15: AiHighlight[];
  champions: Champion[];
};

export function AiChampionList({ aiTOP15, champions }: Props) {
  if (aiTOP15.length === 0) return null;

  const champMap = Object.fromEntries(
    champions.map(c => [c.name_ja, c])
  );

  return (
    <div className="mt-8">
      <h2 className="text-xl mb-2">
        AIが選んだ注目チャンピオン
      </h2>

      <ul className="flex flex-col gap-4">
        {aiTOP15.map((highlight, index) => {
          const champ = champMap[highlight.champion];
          const champId = champ?.id ?? "notfound";

          return (
            <Link key={`${champId}-${index}`} to={`/champion/${champId}`}>
              <li className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-md hover:bg-gray-50 transition">
                {champ && (
                  <img
                    src={`/wr.gg/data/champion_images/${champ.id}.png`}
                    alt={champ.name_ja}
                    className="max-h-24 object-contain"
                  />
                )}

                <div className="flex-1">
                  <p className="font-bold text-sm">
                    {champ?.name_ja ?? highlight.champion}
                  </p>
                  <p className="text-sm text-gray-700">
                    {highlight.reason}
                  </p>
                </div>
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
}