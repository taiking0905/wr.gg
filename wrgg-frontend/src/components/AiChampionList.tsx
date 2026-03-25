import React from 'react';
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

export const AiChampionList: React.FC<Props> = ({
  aiTOP15, champions
}) => {
  if (Object.keys(aiTOP15).length === 0) return null;

  return (
    <div>
      {/* AIが選んだ今回の見どころトップ15 */}
      {aiTOP15.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl mb-2">AIが選んだ注目チャンピオン</h2>
          <ul className="flex flex-col gap-4">
            {aiTOP15.map((highlight, index) => {
              // TODO: Aiが出力する英語を日本語と紐づけするために
              const champ = champions.find((c) => c.name_ja ===  highlight.champion);
              const champId = champ?.id ?? "notfound";

              return (
                <Link
                  key={`${champId}-${index}`} 
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
  );
};