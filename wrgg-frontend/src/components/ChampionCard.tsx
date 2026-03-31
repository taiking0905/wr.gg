import { Link } from "react-router-dom";

type ChampionCardProps = {
  id: string;
  name: string;
  lane?: string;
  score?: number;
};

export function ChampionCard({ id, name, lane, score }: ChampionCardProps) {
  return (
    <Link
      to={`/champion/${id}`}
      className="
        flex-shrink-0
        cursor-pointer text-center
        rounded-lg
        p-2
        bg-white
        border
      "
    >
      <img
        src={`/wr.gg/data/champion_images/${id}.png`}
        alt={name}
        className="
          mx-auto mb-1 object-contain
          max-h-20
          sm:max-h-24
          md:max-h-28
          lg:max-h-32
        "
      />

      <p className="text-xs font-semibold text-gray-900">
        {name}
      </p>
      {lane && (
        <p className="text-xs text-gray-600">{lane}</p>
      )}

      {score !== undefined && (
        <p className="text-xs text-gray-700 font-bold">
          {score.toFixed(2)}
        </p>
      )}
    </Link>
  );
};
