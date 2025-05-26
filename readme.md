# WR.GG - Wild Rift Patch Note Viewer

## 🔍 概要

League of Legends: Wild Rift のパッチノートをスクレイピングし、変更点を見やすく表示するWebアプリです。

---

## 🚀 使用技術

- Frontend: React + Tailwind CSS
- Hosting: GitHub Pages
- Scraping: Python (GitHub Actionsで定期実行)
- 通知: Discord Webhook
- Data format: JSON

---

## ⚙️ 開発環境構築

### 1. Clone this repo

```bash
git clone https://github.com/your-username/wr.gg.git
cd wr.gg


---

## ✅ ステップ2：環境構築でやること（React + Tailwind）

### 📁 フォルダ構成（例）

```plaintext
wr.gg/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── App.jsx
├── scripts/  ← スクレイピング用Pythonスクリプト
├── .github/workflows/
│   └── scrape.yml
├── tailwind.config.js
├── package.json
└── README.md
