type Props = {
  selected: string;
  setSelected: (val: string) => void;
};

export default function PatchSelector({ selected, setSelected }: Props) {
  const versions = ['5.2', '5.1']; // 動的に取得してもOK

  return (
    <select
      className="mt-2 border px-2 py-1"
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
    >
      {versions.map((v) => (
        <option key={v} value={v}>
          パッチ {v}
        </option>
      ))}
    </select>
  );
}
