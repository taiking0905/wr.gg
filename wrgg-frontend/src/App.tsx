import React from "react";
import { HashRouter as Router } from "react-router-dom";
import { AppRoutes } from "./components/Router";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <Router>
      <header className="fixed top-0 w-full z-50 p-4 bg-gray-800 text-white shadow">
        <nav className="flex space-x-10">
          <a href="#/">パッチ一覧</a>
          <a href="#/champions">チャンピオン一覧</a>
          <a href="#/about">このサイトについて</a>
        </nav>
      </header>

      <main className="pt-20 p-1">
        <AppRoutes />
        <Footer />
      </main>
    </Router>
  );
}
