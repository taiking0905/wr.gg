import React from "react";
import { HashRouter as Router } from "react-router-dom";
import { AppRoutes } from "./components/Router";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <Router>
      <header className="fixed top-0 w-full z-50 bg-gray-800 text-white shadow">
        <nav className="overflow-x-auto whitespace-nowrap px-4 py-3">
          <div className="flex space-x-6 text-sm md:text-xl md:gap-6 pb-2 scrollbar-gutter-stable">
            <a href="#/">Home</a>
            <a href="#/patchs">パッチ一覧</a>
            <a href="#/champions">チャンピオン一覧</a>
            <a href="#/championstats">データ一覧</a>
            <a href="#/about">このサイトについて</a>
          </div>
        </nav>
      </header>
      <main className="pt-20 p-1">
        <AppRoutes />
        <Footer />
      </main>
    </Router>
  );
}
