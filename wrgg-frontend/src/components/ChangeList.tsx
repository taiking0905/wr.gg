interface ChampionChange {
  ability_title: string;
  change_details: string;
}

export function ChangeList({ changes }: { changes: ChampionChange[] }) {
  return (
    <ul className="space-y-4">
      {changes.map((change, idx) => (
        <li key={idx} className="border-l-4 border-blue-500 pl-3">
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
  );
}
