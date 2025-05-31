type Props = {
  query: string;
  setQuery: (val: string) => void;
};

export default function SearchBar({ query, setQuery }: Props) {
  return (
    <input
      type="text"
      placeholder="キャラクター名で検索..."
      className="border px-2 py-1 w-full"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
