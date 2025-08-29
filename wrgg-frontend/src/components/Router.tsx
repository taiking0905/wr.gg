import { Routes, Route } from "react-router-dom";
import { Home } from "./Home";
import { PatchViewer } from "./PatchViewer";
import { ChampionList } from "./ChampionList";
import { ChampionDetail } from "./ChampionDetail";
import { ChampionData } from "./ChampionData";
import { About } from "./About";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/patchs" element={<PatchViewer />} />
      <Route path="/champions" element={<ChampionList />} />
      <Route path="/champion/:id" element={<ChampionDetail />} />
      <Route path="/championdata" element={<ChampionData />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};