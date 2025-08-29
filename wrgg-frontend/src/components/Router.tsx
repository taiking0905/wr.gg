import { Routes, Route } from "react-router-dom";
import { Home } from "./Home";
import { PatchViewer } from "./PatchViewer";
import { ChampionList } from "./ChampionList";
import { ChampionDetail } from "./ChampionDetail";
import { ChampionStats } from "./ChampionStats";
import { About } from "./About";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/patchs" element={<PatchViewer />} />
      <Route path="/champions" element={<ChampionList />} />
      <Route path="/champion/:id" element={<ChampionDetail />} />
      <Route path="/championstats" element={<ChampionStats />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};