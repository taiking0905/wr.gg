import { Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { PatchViewer } from "../pages/PatchViewer";
import { ChampionList } from "../pages/ChampionList";
import { ChampionDetail } from "../pages/ChampionDetail";
import { ChampionStats } from "../pages/ChampionStats";
import { About } from "../pages/About";

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