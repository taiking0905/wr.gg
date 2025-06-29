import React from "react";
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {PatchViewer} from "./components/PatchViewer";
import {ChampionList} from './components/ChampionList';
import {Contact} from './components/Contact';

export default function App() {
  return (
    <Router>
      <header className="fixed top-0 w-full z-50 p-4 bg-gray-800 text-white shadow">
        <nav className="flex space-x-4">
          <Link to="/">Home</Link>
          <Link to="/champions">チャンピオン一覧</Link>
          <Link to="/contact">お問い合わせ</Link>
        </nav>
      </header>
      <main className="pt-20 p-4">
        <Routes>
          <Route path="/" element={<PatchViewer />} />
          <Route path="/champions" element={<ChampionList />} />
          <Route path="/contact" element={<Contact />} />
          
        </Routes>
      </main>
    </Router>
  );
}

