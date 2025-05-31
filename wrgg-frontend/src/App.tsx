import { useEffect, useState } from 'react';
import SearchBar from './components/SearchBar';
import PatchSelector from './components/PatchSelector';
import PatchCard from './components/PatchCard';
import Footer from './components/Footer';

function App() {
  const [query, setQuery] = useState('');
  const [selectedPatch, setSelectedPatch] = useState('5.2');
  const [patches, setPatches] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/patch_contents.json')
      .then((res) => res.json())
      .then((data) => setPatches(data))
      .catch((err) => console.error('Failed to load patch data:', err));
  }, []);

  const filtered = patches.filter(
    (p) =>
      p.patch_name === selectedPatch &&
      p.champion_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">WR.GG</h1>
      <SearchBar query={query} setQuery={setQuery} />
      <PatchSelector selected={selectedPatch} setSelected={setSelectedPatch} />
      <div className="mt-4 space-y-2">
        {filtered.map((patch, i) => (
          <PatchCard key={i} {...patch} />
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default App;
