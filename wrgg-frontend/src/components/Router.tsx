import { Routes, Route } from "react-router-dom";
import { PatchViewer } from "./PatchViewer";
import { ChampionList } from "./ChampionList";
import { ChampionDetail } from "./ChampionDetail";
import { About } from "./About";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PatchViewer />} />
      <Route path="/champions" element={<ChampionList />} />
      <Route path="/champion/:id" element={<ChampionDetail />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};